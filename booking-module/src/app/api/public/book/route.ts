/**
 * POST /api/public/book
 *
 * Books a slot. Patient must be verified before calling this endpoint.
 *
 * Body:
 *  slotId        — ID of the chosen slot
 *  procedureId   — ID of the chosen procedure
 *  patientId     — from verify-otp response (stored in sessionStorage)
 *  firstName     — patient's first name
 *  lastName      — patient's last name
 *  phone         — patient's phone
 *  description   — optional problem description (max 500 chars)
 *
 * On success:
 *  - Slot is locked (FOR UPDATE transaction)
 *  - Appointment is created
 *  - Clinic group receives Telegram notification
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { sendGroupNotification } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { slotId, procedureId, patientId, firstName, lastName, phone, description } = body;

  if (!slotId || !procedureId || !patientId || !firstName || !lastName || !phone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Validate patient is verified
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, isVerified: true, telegramChatId: true, cancellationsToday: true, lastCancellationDate: true },
  });

  if (!patient?.isVerified) {
    return NextResponse.json(
      { error: 'Telefon raqami tasdiqlanmagan. Iltimos, avval tasdiqlang.' },
      { status: 403 }
    );
  }

  // Check 2-cancellation rule
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  let cancels = patient.cancellationsToday;
  if (patient.lastCancellationDate && patient.lastCancellationDate < today) cancels = 0;

  if (cancels >= 2) {
    return NextResponse.json(
      { error: "Siz bugun 2 marta qabulni bekor qildingiz. Yangi qabul uchun ertaga urinib ko'ring yoki klinika raqamiga qo'ng'iroq qiling." },
      { status: 403 }
    );
  }

  // Update patient name/phone from this booking (may have been empty after /start)
  await prisma.patient.update({
    where: { id: patientId },
    data: { firstName, lastName, phone },
  });

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      // Lock the slot row against concurrent booking
      const slots = await tx.$queryRaw<any[]>`
        SELECT s.*, d."firstName" as "doctorFirst", d."lastName" as "doctorLast"
        FROM "Slot" s
        JOIN "Doctor" d ON s."doctorId" = d.id
        WHERE s.id = ${slotId} AND s."isAvailable" = true
        FOR UPDATE
      `;

      if (!slots?.length) {
        throw new Error('SLOT_UNAVAILABLE');
      }

      const slot = slots[0];

      // Fetch procedure to check duration fits in slot
      const procedure = await tx.procedure.findUnique({
        where: { id: procedureId },
      });

      if (!procedure) throw new Error('PROCEDURE_NOT_FOUND');

      if (procedure.durationMinutes > slot.duration) {
        throw new Error('PROCEDURE_TOO_LONG');
      }

      // 1 booking per patient per day constraint
      const slotDate = new Date(slot.startTime);
      const dayStart = new Date(slotDate);
      dayStart.setUTCHours(0, 0, 0, 0);
      const dayEnd = new Date(slotDate);
      dayEnd.setUTCHours(23, 59, 59, 999);

      const existing = await tx.appointment.findFirst({
        where: {
          patientId,
          status: 'SCHEDULED',
          slot: { startTime: { gte: dayStart, lte: dayEnd } },
        },
      });

      if (existing) throw new Error('DUPLICATE_BOOKING');

      // Lock slot
      await tx.slot.update({ where: { id: slotId }, data: { isAvailable: false } });

      // Create appointment
      const appointment = await tx.appointment.create({
        data: {
          slotId,
          doctorId: slot.doctorId,
          procedureId,
          patientId,
          patientFirst: firstName,
          patientLast: lastName,
          patientPhone: phone,
          description: description?.trim().slice(0, 500) || null,
          cancelToken: uuidv4(),
        },
        include: { slot: true, procedure: true, doctor: true, patient: true },
      });

      return appointment;
    });

    // Notify clinic group — fire and forget
    sendGroupNotification({
      patientFirst: firstName,
      patientLast: lastName,
      phone,
      doctorName: `${result.doctor.firstName} ${result.doctor.lastName}`,
      procedureName: result.procedure.name,
      appointmentTime: result.slot.startTime,
      description: result.description,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      appointment: {
        id: result.id,
        slotTime: result.slot.startTime,
        doctorName: `${result.doctor.firstName} ${result.doctor.lastName}`,
        procedureName: result.procedure.name,
        cancelToken: result.cancelToken,
      },
    });

  } catch (err: any) {
    const msg: Record<string, string> = {
      SLOT_UNAVAILABLE: 'Bu vaqt allaqachon band qilingan. Boshqa vaqt tanlang.',
      DUPLICATE_BOOKING: 'Siz ushbu sanaga allaqachon qabulga yozilgansiz. Bir kunda faqat bitta qabulga yozilish mumkin.',
      PROCEDURE_TOO_LONG: 'Tanlangan protsedura uchun bu vaqt yetarli emas.',
      PROCEDURE_NOT_FOUND: 'Protsedura topilmadi.',
    };

    const known = msg[err.message];
    if (known) {
      return NextResponse.json({ error: known }, { status: 409 });
    }

    console.error('[book] Unexpected error:', err);
    return NextResponse.json({ error: 'Ichki xatolik yuz berdi.' }, { status: 500 });
  }
}

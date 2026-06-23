import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { requireClinicAccess } from '@/lib/clinic-guard';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  const session = await requireClinicAccess(request);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'RECEPTION')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const since = searchParams.get('since');

  const whereClause: any = { clinicId: session.clinicId };
  if (since) {
    whereClause.createdAt = { gt: new Date(since) };
  }

  const appointments = await prisma.appointment.findMany({
    where: whereClause,
    include: { 
      doctor: true, 
      slot: true,
      patient: true,
      procedure: true,
      visit: true
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, appointments });
}

// POST /api/admin/appointments — Book/Schedule a new appointment
export async function POST(request: NextRequest) {
  const session = await requireClinicAccess(request);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'RECEPTION')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { slotId, procedureId, patientName, patientPhone, note, firstName: reqFirstName, lastName: reqLastName, telegramPhone } = body;

  if (!slotId || !procedureId || !patientPhone || (!patientName && !reqFirstName)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // 1. Create or Find Patient
  const cleanPhone = String(patientPhone).trim();
  const cleanTgPhone = telegramPhone ? String(telegramPhone).trim() : null;

  let firstName = reqFirstName ? String(reqFirstName).trim() : '';
  let lastName = reqLastName ? String(reqLastName).trim() : '';

  if (!firstName && patientName) {
    const parts = String(patientName).trim().split(' ');
    firstName = parts[0] || 'Bemor';
    lastName = parts.slice(1).join(' ') || '';
  }

  if (!firstName) {
    firstName = 'Bemor';
  }

  let patient = await prisma.patient.findFirst({
    where: { phone: cleanPhone },
  });

  if (!patient) {
    patient = await prisma.patient.create({
      data: {
        phone: cleanPhone,
        firstName,
        lastName,
        telegramPhone: cleanTgPhone,
        isVerified: true, // staff verified them
        source: 'ONLINE',
      },
    });
  } else {
    // Keep name and telegram phone in sync
    patient = await prisma.patient.update({
      where: { id: patient.id },
      data: { 
        firstName, 
        lastName,
        ...(cleanTgPhone ? { telegramPhone: cleanTgPhone } : {})
      },
    });
  }

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      // Lock slot
      const slots = await tx.$queryRaw<any[]>`
        SELECT s.* FROM "Slot" s
        WHERE s.id = ${slotId} AND s."isAvailable" = true
        FOR UPDATE
      `;

      if (!slots?.length) {
        throw new Error('SLOT_UNAVAILABLE');
      }

      const slot = slots[0];

      // Fetch procedure to check duration
      const procedure = await tx.procedure.findUnique({
        where: { id: procedureId },
      });

      if (!procedure) throw new Error('PROCEDURE_NOT_FOUND');

      const N = Math.ceil(procedure.durationMinutes / 30);
      const baseTime = new Date(slot.startTime);
      const consecutiveSlots = [slot];

      for (let i = 1; i < N; i++) {
        const chunkStartTime = new Date(baseTime.getTime() + i * 30 * 60 * 1000);
        const nextSlot = await tx.slot.findFirst({
          where: {
            doctorId: slot.doctorId,
            startTime: chunkStartTime,
            isAvailable: true
          }
        });

        if (!nextSlot) {
          throw new Error('SLOT_UNAVAILABLE');
        }
        consecutiveSlots.push(nextSlot);
      }

      // Check if patient already has a scheduled appointment on this day
      const slotDate = new Date(slot.startTime);
      const dayStart = new Date(slotDate);
      dayStart.setUTCHours(0, 0, 0, 0);
      const dayEnd = new Date(slotDate);
      dayEnd.setUTCHours(23, 59, 59, 999);

      const existing = await tx.appointment.findFirst({
        where: {
          patientId: patient.id,
          status: 'SCHEDULED',
          slot: { startTime: { gte: dayStart, lte: dayEnd } },
        },
      });

      if (existing) throw new Error('DUPLICATE_BOOKING');

      // Make slots unavailable
      for (const cs of consecutiveSlots) {
        await tx.slot.update({ where: { id: cs.id }, data: { isAvailable: false } });
      }

      // Create appointment
      const appointment = await tx.appointment.create({
        data: {
          slotId,
          doctorId: slot.doctorId,
          procedureId,
          patientId: patient.id,
          patientFirst: firstName,
          patientLast: lastName,
          patientPhone: cleanPhone,
          description: note?.trim() || null,
          cancelToken: uuidv4(),
          clinicId: session.clinicId as string,
        },
        include: { slot: true, procedure: true, doctor: true, patient: true },
      });

      return appointment;
    });

    return NextResponse.json({ success: true, appointment: result });
  } catch (err: any) {
    const msg: Record<string, string> = {
      SLOT_UNAVAILABLE: 'Bu vaqt allaqachon band qilingan.',
      DUPLICATE_BOOKING: 'Bemor ushbu kunda boshqa qabulga yozilgan.',
      PROCEDURE_NOT_FOUND: 'Tanlangan xizmat topilmadi.',
    };
    return NextResponse.json({ error: msg[err.message] || err.message || 'Xatolik yuz berdi' }, { status: 400 });
  }
}

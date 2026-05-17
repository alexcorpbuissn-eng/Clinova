import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { sendGroupNotification, sendPatientConfirmation } from '@/lib/telegram';

async function requireDoctorOrAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(authHeader.split(' ')[1]);
  if (!payload) return null;
  if (payload.role === 'DOCTOR' || payload.role === 'ADMIN') return payload;
  return null;
}

// POST /api/doctor/book
// Books an active, available slot for an existing patient.
export async function POST(req: NextRequest) {
  const payload = await requireDoctorOrAdmin(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let doctorId = payload.doctorId as string;
  const body = await req.json();
  const { slotId, procedureId, patientId, description } = body;

  if (!slotId || !procedureId || !patientId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Fetch slot and lock it
      // Prisma does not support easy direct FOR UPDATE in standard transaction, 
      // but since it's an authenticated doctor booking, we can query slot and verify availability.
      const slot = await tx.slot.findUnique({
        where: { id: slotId },
        include: { doctor: true }
      });

      if (!slot) throw new Error('SLOT_NOT_FOUND');
      if (!slot.isAvailable) {
        throw new Error('SLOT_UNAVAILABLE');
      }

      // Check slot ownership if logged in as doctor
      if (payload.role !== 'ADMIN' && slot.doctorId !== doctorId) {
        throw new Error('FORBIDDEN_SLOT');
      }

      // 2. Fetch procedure
      const procedure = await tx.procedure.findUnique({
        where: { id: procedureId }
      });
      if (!procedure) throw new Error('PROCEDURE_NOT_FOUND');

      if (procedure.durationMinutes > slot.duration) {
        throw new Error('PROCEDURE_TOO_LONG');
      }

      // 3. Fetch patient
      const patient = await tx.patient.findUnique({
        where: { id: patientId }
      });
      if (!patient) throw new Error('PATIENT_NOT_FOUND');

      // 4. Update slot availability to false
      await tx.slot.update({
        where: { id: slotId },
        data: { isAvailable: false }
      });

      // 5. Create appointment
      const appointment = await tx.appointment.create({
        data: {
          slotId,
          doctorId: slot.doctorId,
          procedureId,
          patientId,
          patientFirst: patient.firstName,
          patientLast: patient.lastName,
          patientPhone: patient.phone,
          description: description ? String(description).trim() : null,
        },
        include: {
          slot: true,
          procedure: true,
          patient: true,
          doctor: true
        }
      });

      return appointment;
    });

    // Send notifications outside transaction
    try {
      await sendGroupNotification(result);
      if (result.patient.telegramChatId) {
        await sendPatientConfirmation(result);
      }
    } catch (err) {
      console.error('Error sending doctor booking notifications:', err);
    }

    return NextResponse.json({ success: true, appointment: result });
  } catch (error: any) {
    console.error('Error in doctor booking:', error);
    if (error.message === 'SLOT_UNAVAILABLE') {
      return NextResponse.json({ error: 'Ushbu vaqt band bo\'lib qoldi' }, { status: 409 });
    }
    if (error.message === 'PROCEDURE_TOO_LONG') {
      return NextResponse.json({ error: 'Ushbu xizmat davomiyligi belgilangan vaqtdan uzunroq' }, { status: 400 });
    }
    if (error.message === 'FORBIDDEN_SLOT') {
      return NextResponse.json({ error: 'Ushbu shifokor vaqtini band qila olmaysiz' }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Server xatosi' }, { status: 500 });
  }
}

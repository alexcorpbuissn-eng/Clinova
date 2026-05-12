import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBot } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { appointmentId, patientId } = body;

    if (!appointmentId || !patientId) {
      return NextResponse.json({ error: 'appointmentId and patientId are required' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const patient = await tx.patient.findUnique({
        where: { id: patientId }
      });

      if (!patient) throw new Error('PATIENT_NOT_FOUND');

      // Check cancellations today
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      let currentCancellations = patient.cancellationsToday;
      if (patient.lastCancellationDate && patient.lastCancellationDate < today) {
        // It's a new day, reset counter
        currentCancellations = 0;
      }

      if (currentCancellations >= 2) {
        throw new Error('CANCELLATION_LIMIT_EXCEEDED');
      }

      const appointment = await tx.appointment.findUnique({
        where: { id: appointmentId },
        include: { slot: true, doctor: true, procedure: true }
      });

      if (!appointment) throw new Error('APPOINTMENT_NOT_FOUND');
      if (appointment.patientId !== patientId) throw new Error('FORBIDDEN');
      if (appointment.status !== 'SCHEDULED') throw new Error('ALREADY_CANCELLED');

      const now = new Date();
      const bookedAt = new Date(appointment.createdAt);
      const slotTime = new Date(appointment.slot.startTime);

      const minsSinceBooking = (now.getTime() - bookedAt.getTime()) / 60000;
      const hoursUntilSlot = (slotTime.getTime() - now.getTime()) / 3600000;

      // Rule: Can cancel if booked < 15 mins ago OR slot is > 24 hours away
      if (minsSinceBooking > 15 && hoursUntilSlot < 24) {
        throw new Error('LATE_CANCELLATION');
      }

      // Perform cancellation
      await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: 'CANCELLED' }
      });

      // Free the slot
      await tx.slot.update({
        where: { id: appointment.slotId },
        data: { isAvailable: true }
      });

      // Update patient cancellations
      await tx.patient.update({
        where: { id: patientId },
        data: {
          cancellationsToday: currentCancellations + 1,
          lastCancellationDate: new Date()
        }
      });

      return { appointment, currentCancellations: currentCancellations + 1 };
    });

    // Notify Clinic
    try {
      const bot = getBot();
      const groupId = process.env.TELEGRAM_GROUP_CHAT_ID;
      if (groupId) {
        const text = `❌ *Qabul bekor qilindi (Bemor tomonidan)*\n\n` +
          `👤 *Bemor:* ${result.appointment.patientFirst} ${result.appointment.patientLast}\n` +
          `👨‍⚕️ *Shifokor:* Dr. ${result.appointment.doctor.firstName} ${result.appointment.doctor.lastName}\n` +
          `⏱ *Vaqti:* ${result.appointment.slot.startTime.toLocaleString('uz-UZ', {timeZone: 'Asia/Tashkent'})}\n\n` +
          `Bo'sh vaqt yana ochiq holatga o'tdi.`;
        await bot.sendMessage(groupId, text, { parse_mode: 'Markdown' });
      }
    } catch (e) {
      console.error('Failed to notify cancellation', e);
    }

    return NextResponse.json({ success: true, cancellationsToday: result.currentCancellations });
  } catch (err: any) {
    const msgs: Record<string, string> = {
      'FORBIDDEN': "Sizga ruxsat yo'q.",
      'ALREADY_CANCELLED': "Qabul allaqachon bekor qilingan.",
      'LATE_CANCELLATION': "Qabulni faqatgina bron qilinganidan so'ng 15 daqiqa ichida yoki qabulga 24 soatdan ko'p vaqt qolganida bekor qilish mumkin.",
      'CANCELLATION_LIMIT_EXCEEDED': "Kunlik bekor qilish limiti (2 marta) tugadi.",
    };
    
    if (msgs[err.message]) {
      return NextResponse.json({ error: msgs[err.message] }, { status: 400 });
    }
    
    console.error('Cancel Error:', err);
    return NextResponse.json({ error: 'Ichki xatolik yuz berdi' }, { status: 500 });
  }
}

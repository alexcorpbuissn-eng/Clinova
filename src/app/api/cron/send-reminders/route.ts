/**
 * POST /api/cron/send-reminders
 *
 * Runs every hour via Vercel Cron (see vercel.json).
 * Protected by CRON_SECRET header.
 *
 * Logic:
 *  - Find SCHEDULED appointments where reminderSent24h = false
 *    AND startTime is within the next 25 hours → send 24h reminder, set flag
 *
 *  - Find SCHEDULED appointments where reminderSent2h = false
 *    AND startTime is within the next 3 hours → send 2h reminder, set flag
 *
 * Using a 25h / 3h window (instead of exact 24h / 2h) gives a safety buffer
 * so appointments are never missed between hourly cron ticks.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendReminder24h, sendReminder2h } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  // Verify cron secret
  const secret = req.headers.get('x-cron-secret') ?? req.headers.get('authorization');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in3h  = new Date(now.getTime() +  3 * 60 * 60 * 1000);
  const in2h  = new Date(now.getTime() +  2 * 60 * 60 * 1000);

  // ── 24h reminders ───────────────────────────────────────────────────────
  const due24h = await prisma.appointment.findMany({
    where: {
      status: 'SCHEDULED',
      reminderSent24h: false,
      slot: { startTime: { gt: in24h, lte: in25h } },
    },
    include: {
      slot: true,
      doctor: { select: { firstName: true, lastName: true } },
      patient: { select: { telegramChatId: true } },
      clinic: { select: { name: true } },
    },
  });

  const results24h = await Promise.allSettled(
    due24h.map(async (appt: any) => {
      const chatId = appt.patient.telegramChatId;
      if (!chatId) return;

      const sent = await sendReminder24h({
        chatId,
        doctorName: `${appt.doctor.firstName} ${appt.doctor.lastName}`,
        appointmentTime: appt.slot.startTime,
        clinicId: appt.clinicId,
        clinicName: appt.clinic?.name || 'Klinika',
      });

      if (sent) {
        await prisma.appointment.update({
          where: { id: appt.id },
          data: { reminderSent24h: true },
        });
      }
    })
  );

  // ── 2h reminders ────────────────────────────────────────────────────────
  const due2h = await prisma.appointment.findMany({
    where: {
      status: 'SCHEDULED',
      reminderSent2h: false,
      slot: { startTime: { gt: in2h, lte: in3h } },
    },
    include: {
      slot: true,
      doctor: { select: { firstName: true, lastName: true } },
      patient: { select: { telegramChatId: true } },
      clinic: { select: { name: true } },
    },
  });

  const results2h = await Promise.allSettled(
    due2h.map(async (appt: any) => {
      const chatId = appt.patient.telegramChatId;
      if (!chatId) return;

      const sent = await sendReminder2h({
        chatId,
        doctorName: `${appt.doctor.firstName} ${appt.doctor.lastName}`,
        appointmentTime: appt.slot.startTime,
        clinicId: appt.clinicId,
        clinicName: appt.clinic?.name || 'Klinika',
      });

      if (sent) {
        await prisma.appointment.update({
          where: { id: appt.id },
          data: { reminderSent2h: true },
        });
      }
    })
  );

  const sent24 = results24h.filter((r: any) => r.status === 'fulfilled').length;
  const sent2  = results2h.filter((r: any) => r.status === 'fulfilled').length;

  // ── Leave Ending Reminders ──────────────────────────────────────────────
  // If we run hourly, check for leaves where endTime is between 24h and 25h from now.
  // Wait, if endTime is 23:59:59, then 24h before that is 23:59:59 the day before.
  // We'll just check if there is any leave whose endTime is between 24h and 25h from now.
  let sentLeaveReminders = 0;
  try {
    const endingLeaves = await prisma.leave.findMany({
      where: {
        endTime: { gt: in24h, lte: in25h }
      },
      include: {
        doctor: true
      }
    });

    const { getClinicBot } = await import('@/lib/telegram');

    for (const leave of endingLeaves) {
      if (leave.doctor?.telegramChatId) {
        try {
          const bot = await getClinicBot(leave.clinicId);
          await bot.sendMessage(
            leave.doctor.telegramChatId, 
            `Eslatma: Dam olish (otpuska) vaqtingiz tugashiga 1 kun qoldi! Ertadan ishga chiqishingiz kerak bo'ladi.`,
            { parse_mode: 'Markdown' }
          );
          sentLeaveReminders++;
        } catch (e) {
          console.error('Leave reminder tg error:', e);
        }
      }
    }
  } catch(e) {
    console.error('Leave reminder error:', e);
  }

  console.log(`[cron] Reminders sent — 24h: ${sent24}/${due24h.length}, 2h: ${sent2}/${due2h.length}, leaves: ${sentLeaveReminders}`);

  return NextResponse.json({
    ok: true,
    sent24h: sent24,
    sent2h: sent2,
    sentLeave: sentLeaveReminders
  });
}

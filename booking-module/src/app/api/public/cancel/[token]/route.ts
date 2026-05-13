import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toTashkentDate, toTashkentTime } from '@/lib/telegram';
import TelegramBot from 'node-telegram-bot-api';

function getBot() {
  return new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false });
}

// GET /api/public/cancel/:token — Validate the token and show appointment info
export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { cancelToken: token },
    include: { doctor: true, slot: true },
  });

  if (!appointment || appointment.status !== 'SCHEDULED') {
    return NextResponse.json({ success: false, error: 'Invalid or expired cancellation link.' }, { status: 404 });
  }

  const now = new Date();
  const bookedAt = new Date(appointment.createdAt);
  const minsSinceBooking = (now.getTime() - bookedAt.getTime()) / 60000;

  if (minsSinceBooking > 15) {
    return NextResponse.json({
      success: false,
      error: 'Qabulni faqatgina bron qilinganidan so\'ng 15 daqiqa ichida bekor qilish mumkin.',
    }, { status: 410 });
  }

  return NextResponse.json({
    success: true,
    appointment: {
      id: appointment.id,
      patientFirst: appointment.patientFirst,
      patientLast: appointment.patientLast,
      slotTime: appointment.slot.startTime,
      doctorName: `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
      specialty: appointment.doctor.specialty,
    },
  });
}

// POST /api/public/cancel/:token — Process the actual cancellation
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { cancelToken: token },
      include: { doctor: true, slot: true, patient: true },
    });

    if (!appointment || appointment.status !== 'SCHEDULED') {
      return NextResponse.json({ success: false, error: 'Invalid or expired cancellation link.' }, { status: 404 });
    }

    const now = new Date();
    const bookedAt = new Date(appointment.createdAt);
    const minsSinceBooking = (now.getTime() - bookedAt.getTime()) / 60000;

    if (minsSinceBooking > 15) {
      return NextResponse.json({ success: false, error: 'Qabulni faqatgina bron qilinganidan so\'ng 15 daqiqa ichida bekor qilish mumkin.' }, { status: 410 });
    }

    // Cancel: free slot + update status + invalidate token
    await prisma.$transaction([
      prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'CANCELLED', cancelToken: null, cancelledBy: 'PATIENT' },
      }),
      prisma.slot.update({
        where: { id: appointment.slotId },
        data: { isAvailable: true },
      }),
    ]);

    const date = toTashkentDate(appointment.slot.startTime);
    const time = toTashkentTime(appointment.slot.startTime);
    const doctorName = `${appointment.doctor.firstName} ${appointment.doctor.lastName}`;

    // Notify patient via Telegram DM
    const chatId = appointment.patient?.telegramChatId;
    if (chatId) {
      const bot = getBot();
      const text =
        `❌ *Qabul bekor qilindi*\n\n` +
        `Dr. *${doctorName}* bilan *${date}, ${time}* dagi qabulingiz bekor qilindi.\n\n` +
        `Qayta yozilish uchun: ${process.env.NEXT_PUBLIC_APP_URL}/booking`;
      bot.sendMessage(chatId, text, { parse_mode: 'Markdown' }).catch(console.error);
    }

    // Notify clinic group
    const groupChatId = process.env.TELEGRAM_GROUP_CHAT_ID;
    if (groupChatId) {
      const bot = getBot();
      const groupText =
        `🚫 *Bemor qabulni bekor qildi*\n\n` +
        `👤 Bemor: *${appointment.patientFirst} ${appointment.patientLast}*\n` +
        `👨‍⚕️ Shifokor: *Dr. ${doctorName}*\n` +
        `📅 Sana: *${date}*\n` +
        `🕐 Vaqt: *${time}*`;
      bot.sendMessage(groupChatId, groupText, { parse_mode: 'Markdown' }).catch(console.error);
    }

    return NextResponse.json({ success: true, message: 'Qabul muvaffaqiyatli bekor qilindi.' });
  } catch (error) {
    console.error('Cancellation error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

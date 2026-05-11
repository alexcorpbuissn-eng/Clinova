import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendGroupNotification, toTashkentDate, toTashkentTime } from '@/lib/telegram';
import TelegramBot from 'node-telegram-bot-api';

function getBot() {
  return new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false });
}

// PATCH /api/doctor/appointments/:id — Mark COMPLETED or CANCELLED
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doctorId = request.headers.get('x-doctor-id') ?? '';
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { status } = await request.json();
  if (!['COMPLETED', 'CANCELLED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const appointment = await prisma.appointment.findFirst({
    where: { id, doctorId },
    include: { slot: true, doctor: true, patient: true },
  });

  if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.$transaction([
    prisma.appointment.update({ where: { id }, data: { status, cancelToken: null } }),
    ...(status === 'CANCELLED'
      ? [prisma.slot.update({ where: { id: appointment.slotId }, data: { isAvailable: true } })]
      : []),
  ]);

  // If doctor cancels → notify patient via Telegram DM
  if (status === 'CANCELLED') {
    const chatId = appointment.patient?.telegramChatId;
    const date = toTashkentDate(appointment.slot.startTime);
    const time = toTashkentTime(appointment.slot.startTime);
    const doctorName = `${appointment.doctor.firstName} ${appointment.doctor.lastName}`;

    if (chatId) {
      const bot = getBot();
      const text =
        `❌ *Qabul bekor qilindi*\n\n` +
        `Hurmatli *${appointment.patientFirst}*,\n` +
        `Dr. *${doctorName}* siz bilan *${date}, ${time}* dagi qabulni bekor qildi.\n\n` +
        `Yangi vaqtga yozilish uchun: ${process.env.NEXT_PUBLIC_APP_URL}/booking`;
      bot.sendMessage(chatId, text, { parse_mode: 'Markdown' }).catch(console.error);
    }

    // Also notify the clinic group
    sendGroupNotification({
      patientFirst: appointment.patientFirst ?? '',
      patientLast: appointment.patientLast ?? '',
      phone: appointment.patientPhone ?? '',
      doctorName,
      procedureName: 'Bekor qilindi',
      appointmentTime: appointment.slot.startTime,
      description: `❌ Shifokor tomonidan bekor qilindi`,
    }).catch(console.error);
  }

  return NextResponse.json({ success: true });
}

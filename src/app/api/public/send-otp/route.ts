import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalisePhone, getBotDeepLink } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  let telegramPhone: string;

  try {
    const body = await req.json();
    if (!body.telegramPhone) {
      return NextResponse.json({ error: 'telegramPhone is required' }, { status: 400 });
    }
    telegramPhone = normalisePhone(body.telegramPhone);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Check if patient already verified
  const existing = await prisma.patient.findUnique({
    where: { telegramPhone },
    select: { id: true, isVerified: true, telegramChatId: true },
  });

  if (existing?.telegramChatId) {
    // Returning user! We already have their chatId, so we can send the OTP directly!
    // Wait, generating OTP and sending it. We need a helper from telegram.ts.
    // I will dynamically import it to avoid top-level issues if bot token is missing.
    try {
      const { generateAndSendOtp } = await import('@/lib/telegram');
      await generateAndSendOtp(telegramPhone, existing.telegramChatId);
      return NextResponse.json({ action: 'enter_otp' });
    } catch (err) {
      console.error('Failed to send direct OTP:', err);
      return NextResponse.json({ error: "Telegram xatoligi. Qayta urinib ko'ring." }, { status: 500 });
    }
  }

  // New user — Return the deep-link. OTP will be sent automatically when they tap /start
  const deepLink = getBotDeepLink(telegramPhone);
  return NextResponse.json({ action: 'deep_link', deepLink });
}

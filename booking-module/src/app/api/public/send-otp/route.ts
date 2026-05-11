/**
 * POST /api/public/send-otp
 *
 * Called after patient enters their Telegram phone on Step 3.
 *
 * If they're already verified → return { alreadyVerified: true }
 * so the frontend skips Step 4 entirely.
 *
 * Otherwise → return the bot deep-link for the patient to tap.
 * The actual OTP is sent automatically when they tap START.
 */

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

  if (existing?.isVerified && existing.telegramChatId) {
    return NextResponse.json({ alreadyVerified: true, patientId: existing.id });
  }

  // Return the deep-link — OTP will be sent automatically on /start
  const deepLink = getBotDeepLink(telegramPhone);

  return NextResponse.json({ alreadyVerified: false, deepLink });
}

/**
 * POST /api/public/verify-otp
 *
 * Validates the 6-digit code entered by the patient.
 *
 * On success:
 *  - Marks OTP as used
 *  - Marks Patient.isVerified = true
 *  - Returns patientId (stored in frontend sessionStorage to link booking)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalisePhone } from '@/lib/telegram';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  let telegramPhone: string;
  let code: string;

  try {
    const body = await req.json();
    if (!body.telegramPhone || !body.code) {
      return NextResponse.json({ error: 'telegramPhone and code are required' }, { status: 400 });
    }
    telegramPhone = normalisePhone(body.telegramPhone);
    code = String(body.code).trim();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Find a valid, unused, non-expired OTP for this phone
  const otp = await prisma.otp.findFirst({
    where: {
      telegramPhone,
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) {
    return NextResponse.json(
      { error: 'Kod noto\'g\'ri yoki muddati tugagan. Iltimos, qaytadan urinib ko\'ring.' },
      { status: 400 }
    );
  }

  // Mark OTP as used + mark patient as verified in a single transaction
  const [, patient] = await prisma.$transaction([
    prisma.otp.update({ where: { id: otp.id }, data: { used: true } }),
    prisma.patient.update({
      where: { telegramPhone },
      data: { isVerified: true },
      select: { id: true, firstName: true, lastName: true, phone: true, telegramPhone: true },
    }),
  ]);

  // Check if this phone belongs to an admin or staff
  let user = await prisma.user.findUnique({
    where: { telegramPhone }
  });

  // Bootstrap: If no users exist in the database at all, make the first person an ADMIN
  const userCount = await prisma.user.count();
  if (userCount === 0 && !user) {
    user = await prisma.user.create({
      data: {
        telegramPhone,
        role: 'ADMIN'
      }
    });
  }

  let token = undefined;
  if (user) {
    token = await signToken({
      userId: user.id,
      role: user.role,
      doctorId: user.doctorId ?? undefined
    });
  }

  return NextResponse.json({ success: true, patient, token });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

// POST /api/doctor/login — Verify OTP and issue doctor JWT
export async function POST(request: NextRequest) {
  const { telegramPhone, code } = await request.json();

  if (!telegramPhone || !code) {
    return NextResponse.json({ error: 'Telefon va kod kiritilishi shart' }, { status: 400 });
  }

  // Verify OTP
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
    return NextResponse.json({ error: 'Kod noto\'g\'ri yoki muddati o\'tgan' }, { status: 400 });
  }

  await prisma.otp.update({ where: { id: otp.id }, data: { used: true } });

  // Find the user with DOCTOR role
  const user = await prisma.user.findFirst({
    where: { telegramPhone, role: 'DOCTOR' },
  });

  if (!user || !user.doctorId) {
    return NextResponse.json({ error: 'Sizda shifokor huquqi yo\'q' }, { status: 403 });
  }

  // Get doctor details
  const doctor = await prisma.doctor.findUnique({
    where: { id: user.doctorId },
    select: { id: true, firstName: true, lastName: true, specialty: true },
  });

  if (!doctor) {
    return NextResponse.json({ error: 'Shifokor topilmadi' }, { status: 404 });
  }

  const token = await signToken({
    userId: user.id,
    role: 'DOCTOR',
    doctorId: user.doctorId,
  });

  return NextResponse.json({ success: true, token, doctor });
}

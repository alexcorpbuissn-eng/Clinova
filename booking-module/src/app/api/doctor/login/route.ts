import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { normalisePhone } from '@/lib/telegram';

// POST /api/doctor/login — Verify OTP and issue doctor JWT
export async function POST(request: NextRequest) {
  let { telegramPhone, code } = await request.json();

  if (!telegramPhone || !code) {
    return NextResponse.json({ error: 'Telefon va kod kiritilishi shart' }, { status: 400 });
  }

  telegramPhone = normalisePhone(telegramPhone);

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

  // Find the user
  const user = await prisma.user.findFirst({
    where: { 
      telegramPhone, 
      role: { in: ['DOCTOR', 'ADMIN', 'RECEPTION'] }
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'Sizda kirish huquqi yo\'q' }, { status: 403 });
  }

  // If role is DOCTOR or RECEPTION, they MUST have a doctorId
  if (user.role !== 'ADMIN' && !user.doctorId) {
    return NextResponse.json({ error: 'Sizda shifokor huquqi yo\'q' }, { status: 403 });
  }

  // Get doctor details if linked
  let doctor = null;
  if (user.doctorId) {
    doctor = await prisma.doctor.findUnique({
      where: { id: user.doctorId },
      select: { id: true, firstName: true, lastName: true, specialty: true },
    });
  }

  const token = await signToken({
    userId: user.id,
    role: user.role,
    doctorId: user.doctorId || 'ADMIN_GLOBAL', // Special flag for admins
  });

  return NextResponse.json({ success: true, token, doctor, role: user.role });

}

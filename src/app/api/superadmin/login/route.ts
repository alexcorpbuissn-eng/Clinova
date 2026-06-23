import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { phone, password } = body;

  if (!phone || !password) {
    return NextResponse.json({ error: 'phone and password required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { telegramPhone: phone, role: 'SUPER_ADMIN' }
    });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await signToken({
      userId: user.id,
      role: 'SUPER_ADMIN',
      clinicId: undefined,
      doctorId: undefined,
    });

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

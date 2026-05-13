import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email va parol kiritish majburiy' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: 'Foydalanuvchi topilmadi yoki parol xato' }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: 'Foydalanuvchi topilmadi yoki parol xato' }, { status: 401 });
    }

    // Generate JWT
    const token = await signToken({
      userId: user.id,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        email: user.email,
        role: user.role,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Ichki xatolik yuz berdi' }, { status: 500 });
  }
}

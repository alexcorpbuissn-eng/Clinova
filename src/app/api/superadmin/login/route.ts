import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  let { phone, password } = body;
  
  // Clean inputs on the backend just to be safe against trailing spaces from frontend
  phone = phone?.replace(/\s+/g, '').trim();
  password = password?.trim();

  if (!phone || !password) {
    return NextResponse.json({ error: 'phone and password required' }, { status: 400 });
  }

  try {
    console.log("Superadmin login attempt:", { phone, password });
    const user = await prisma.user.findFirst({
      where: { telegramPhone: phone, role: 'SUPER_ADMIN' }
    });
    console.log("Superadmin user found:", user);

    if (!user || user.password !== password) {
      return NextResponse.json({ 
        error: 'Invalid credentials', 
        debug: { 
          receivedPhone: phone, 
          receivedPassword: password, 
          userFound: !!user,
          userRole: user?.role,
          dbPasswordLength: user?.password?.length,
          matches: user?.password === password
        } 
      }, { status: 401 });
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

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(authHeader.split(' ')[1]);
  return payload?.role === 'ADMIN' ? payload : null;
}

// GET /api/admin/users
export async function GET(request: NextRequest) {
  if (!await requireAdmin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ success: true, users });
}

// POST /api/admin/users
export async function POST(request: NextRequest) {
  if (!await requireAdmin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { telegramPhone, role, doctorId } = body;

    if (!telegramPhone || !role) {
      return NextResponse.json({ error: 'Telefon raqam va rol majburiy' }, { status: 400 });
    }

    if (role === 'DOCTOR' && !doctorId) {
      return NextResponse.json({ error: 'Shifokor roli uchun shifokorni tanlash majburiy' }, { status: 400 });
    }

    // Check if phone already exists
    const existing = await prisma.user.findUnique({ where: { telegramPhone } });
    if (existing) {
      return NextResponse.json({ error: 'Bu telefon raqami bilan foydalanuvchi allaqachon mavjud' }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        telegramPhone,
        role,
        doctorId: role === 'DOCTOR' ? doctorId : null
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

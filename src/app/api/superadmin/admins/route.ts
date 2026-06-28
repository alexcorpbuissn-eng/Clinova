import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClinicAccess } from '@/lib/clinic-guard';
import { logSystemEvent } from '@/lib/logger';

// GET /api/superadmin/admins
export async function GET(request: NextRequest) {
  const session = await requireClinicAccess(request);
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' },
      select: {
        id: true,
        telegramPhone: true,
        permissions: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json({ success: true, superAdmins });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Failed to fetch superadmins', stack: error.stack }, { status: 500 });
  }
}

// POST /api/superadmin/admins
export async function POST(request: NextRequest) {
  const session = await requireClinicAccess(request);
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { telegramPhone, permissions } = body;

    if (!telegramPhone) {
      return NextResponse.json({ error: 'telegramPhone is required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { telegramPhone } });

    if (existingUser) {
      if (existingUser.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Этот номер уже привязан к другой роли. Сначала удалите его.' }, { status: 400 });
      }
      
      // Update permissions
      const updatedAdmin = await prisma.user.update({
        where: { telegramPhone },
        data: { permissions: permissions || [] },
        select: { id: true, telegramPhone: true, permissions: true }
      });
      await logSystemEvent('INFO', 'BACKEND', `Обновлены права суперадмина: ${telegramPhone}`, { updatedAdmin });
      return NextResponse.json({ success: true, admin: updatedAdmin });
    }

    // Create new superadmin
    const newAdmin = await prisma.user.create({
      data: {
        telegramPhone,
        role: 'SUPER_ADMIN',
        permissions: permissions || []
      },
      select: { id: true, telegramPhone: true, permissions: true }
    });

    await logSystemEvent('INFO', 'BACKEND', `Добавлен новый суперадмин: ${telegramPhone}`, { newAdmin });
    return NextResponse.json({ success: true, admin: newAdmin }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process superadmin' }, { status: 500 });
  }
}

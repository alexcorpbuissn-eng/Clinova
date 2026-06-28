import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/clinic-guard';
import { logSystemEvent } from '@/lib/logger';

// POST /api/superadmin/clinics/[id]/admin
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireRole(request, ['SUPER_ADMIN']);
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = params;
    const { telegramPhone } = await request.json();

    if (!telegramPhone) {
      return NextResponse.json({ error: 'telegramPhone is required' }, { status: 400 });
    }

    const clinic = await prisma.clinic.findUnique({ where: { id } });
    if (!clinic) {
      return NextResponse.json({ error: 'Klinika topilmadi' }, { status: 404 });
    }

    const existingUser = await prisma.user.findUnique({ where: { telegramPhone } });

    if (existingUser) {
      if (existingUser.role !== 'ADMIN' && existingUser.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Bu raqam boshqa rolga biriktirilgan. Avval uni o`chiring.' }, { status: 400 });
      }
      if (existingUser.role === 'SUPER_ADMIN') {
        return NextResponse.json({ success: true, message: 'Foydalanuvchi allaqachon Super Admin, u hamma klinikaga kira oladi.' });
      }

      const updated = await prisma.user.update({
        where: { id: existingUser.id },
        data: { clinicId: id }
      });
      await logSystemEvent('INFO', 'BACKEND', `Admin klinikaga biriktirildi: ${telegramPhone} -> ${clinic.name}`);
      return NextResponse.json({ success: true, user: updated });
    }

    const newUser = await prisma.user.create({
      data: {
        telegramPhone,
        role: 'ADMIN',
        clinicId: id
      }
    });

    await logSystemEvent('INFO', 'BACKEND', `Yangi admin yaratildi: ${telegramPhone} -> ${clinic.name}`);
    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to add admin to clinic:', error);
    return NextResponse.json({ error: error.message || 'Failed to add admin' }, { status: 500 });
  }
}

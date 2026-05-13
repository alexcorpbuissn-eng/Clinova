import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token);

  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { slot: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    }

    // Cancel appointment and free the slot instead of deleting it
    await prisma.$transaction([
      prisma.appointment.update({ 
        where: { id },
        data: { status: 'CANCELLED', cancelledBy: 'ADMIN' } 
      }),
      prisma.slot.update({
        where: { id: appointment.slotId },
        data: { isAvailable: true },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Cancel error:', err);
    return NextResponse.json({ error: 'Bekor qilishda xatolik yuz berdi' }, { status: 500 });
  }
}

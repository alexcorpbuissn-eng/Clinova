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

    // Delete appointment and free the slot
    await prisma.$transaction([
      prisma.appointment.delete({ where: { id } }),
      prisma.slot.update({
        where: { id: appointment.slotId },
        data: { isAvailable: true },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err);
    return NextResponse.json({ error: 'Oʻchirishda xatolik yuz berdi' }, { status: 500 });
  }
}

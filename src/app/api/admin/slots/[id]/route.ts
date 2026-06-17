import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// ── DELETE /api/admin/slots/:id ──────────────────────────────────────────────
// Refuses to delete a slot that already has a booking (isAvailable = false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const payload = await verifyToken(authHeader.split(' ')[1]);
  if (payload?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const slot = await prisma.slot.findUnique({
      where: { id },
      select: { id: true, isAvailable: true },
    });

    if (!slot) {
      return NextResponse.json({ error: 'Slot topilmadi' }, { status: 404 });
    }
    if (!slot.isAvailable) {
      return NextResponse.json(
        { error: 'Bu slot band — avval qabulni bekor qiling' },
        { status: 409 }
      );
    }

    await prisma.slot.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admin/slots/[id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

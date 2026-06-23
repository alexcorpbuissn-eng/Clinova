import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { requireClinicAccess } from '@/lib/clinic-guard';

// ── DELETE /api/admin/slots/:id ──────────────────────────────────────────────
// Refuses to delete a slot that already has a booking (isAvailable = false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireClinicAccess(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const slot = await prisma.slot.findUnique({
      where: { id },
      select: { id: true, isAvailable: true, clinicId: true },
    });

    if (!slot) {
      return NextResponse.json({ error: 'Slot topilmadi' }, { status: 404 });
    }
    if (slot.clinicId !== session.clinicId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

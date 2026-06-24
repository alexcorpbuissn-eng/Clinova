import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


import { requireClinicAccess } from '@/lib/clinic-guard';

// DELETE /api/admin/purchases/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireClinicAccess(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'ID topilmadi' }, { status: 400 });
    }

    const purchase = await prisma.purchase.findUnique({ where: { id } });
    if (!purchase) {
      return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    }
    if (purchase.clinicId !== session.clinicId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.purchase.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { requireClinicAccess } from '@/lib/clinic-guard';

// PATCH /api/admin/visits/[id] — update visit (finish treatment, record payment)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireClinicAccess(request);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'RECEPTION')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status, paidAmount, price, note, endTime, paymentMethod } = body;

  try {
    const visitToUpdate = await prisma.visit.findUnique({ where: { id } });
    if (!visitToUpdate) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    if (visitToUpdate.clinicId !== session.clinicId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const visit = await prisma.visit.update({
      where: { id },
      data: {
        status: status || undefined,
        paidAmount: paidAmount !== undefined ? parseInt(paidAmount) : undefined,
        paymentMethod: paymentMethod !== undefined ? paymentMethod : undefined,
        price: price !== undefined ? parseInt(price) : undefined,
        note: note || undefined,
        endTime: endTime ? new Date(endTime) : undefined,
      }
    });
    return NextResponse.json({ success: true, visit });
  } catch (err) {
    return NextResponse.json({ error: 'Visit update failed' }, { status: 500 });
  }
}

// DELETE /api/admin/visits/[id] — remove a visit record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireClinicAccess(request);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'RECEPTION')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const visitToDelete = await prisma.visit.findUnique({ where: { id } });
    if (!visitToDelete) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    if (visitToDelete.clinicId !== session.clinicId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    await prisma.visit.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}

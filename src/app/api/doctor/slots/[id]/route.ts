import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClinicAccess } from '@/lib/clinic-guard';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await requireClinicAccess(request);
  if (!session || (session.role !== 'DOCTOR' && session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const slot = await prisma.slot.findUnique({ where: { id } });
  if (!slot) return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
  if (slot.clinicId !== session.clinicId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (session.role === 'DOCTOR' && slot.doctorId !== session.doctorId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!slot.isAvailable) {
    return NextResponse.json({ error: 'Cannot delete a slot that is already booked.' }, { status: 409 });
  }

  await prisma.slot.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE /api/doctor/slots/:id — Remove an unbooked slot
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const doctorId = request.headers.get('x-doctor-id') ?? '';
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const slot = await prisma.slot.findFirst({ where: { id: params.id, doctorId } });

  if (!slot) return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
  if (!slot.isAvailable) {
    return NextResponse.json({ error: 'Cannot delete a slot that is already booked.' }, { status: 409 });
  }

  await prisma.slot.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

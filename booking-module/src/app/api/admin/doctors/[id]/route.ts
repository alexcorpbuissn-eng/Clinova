import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/admin/doctors/:id — Edit or deactivate a doctor
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const role = request.headers.get('x-user-role');
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const data = await request.json();
  const allowedFields = ['firstName', 'lastName', 'specialty', 'bio', 'photoUrl', 'isActive'];
  const updateData: Record<string, any> = {};

  for (const key of allowedFields) {
    if (key in data) updateData[key] = data[key];
  }

  const doctor = await prisma.doctor.update({ where: { id: params.id }, data: updateData });
  return NextResponse.json({ success: true, doctor });
}

// DELETE /api/admin/doctors/:id — Hard delete a doctor (use PATCH isActive=false instead)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const role = request.headers.get('x-user-role');
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.doctor.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

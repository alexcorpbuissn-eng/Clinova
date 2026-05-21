import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(authHeader.split(' ')[1]);
  return payload?.role === 'ADMIN' ? payload : null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!await requireAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const data = await request.json();
  const allowedFields = ['firstName', 'lastName', 'specialty', 'bio', 'photoUrl', 'isActive'];
  const updateData: Record<string, any> = {};
  for (const key of allowedFields) {
    if (key in data) updateData[key] = data[key];
  }

  const doctor = await prisma.doctor.update({ where: { id }, data: updateData });
  return NextResponse.json({ success: true, doctor });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!await requireAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.doctor.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

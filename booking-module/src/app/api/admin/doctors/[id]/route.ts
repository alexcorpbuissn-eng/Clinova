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

  try {
    const data = await request.json();
    const allowedFields = ['firstName', 'lastName', 'specialty', 'bio', 'photoUrl', 'isActive', 'telegramUsername'];
    const updateData: Record<string, any> = {};
    for (const key of allowedFields) {
      if (key in data) updateData[key] = data[key];
    }

    if (updateData.telegramUsername) {
      updateData.telegramUsername = updateData.telegramUsername.replace('@', '').trim();
      const patient = await prisma.patient.findFirst({
        where: {
          telegramUsername: {
            equals: updateData.telegramUsername,
            mode: 'insensitive'
          }
        }
      });
      if (patient && patient.telegramChatId) {
        updateData.telegramChatId = patient.telegramChatId;
      }
    }

    const doctor = await prisma.doctor.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, doctor, chatFound: !!updateData.telegramChatId });
  } catch (error: any) {
    console.error('Doctor PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
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

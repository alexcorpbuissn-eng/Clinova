import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

async function requireStaff(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(authHeader.split(' ')[1]);
  if (payload?.role === 'ADMIN' || payload?.role === 'RECEPTION') return payload;
  return null;
}

// PATCH /api/admin/visits/[id] — update visit (finish treatment, record payment)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireStaff(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status, paidAmount, price, note, endTime } = body;

  try {
    const visit = await prisma.visit.update({
      where: { id },
      data: {
        status: status || undefined,
        paidAmount: paidAmount !== undefined ? parseInt(paidAmount) : undefined,
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
  if (!await requireStaff(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  try {
    await prisma.visit.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}

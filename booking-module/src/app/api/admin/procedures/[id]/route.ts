import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function PATCH(
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
  const body = await request.json();

  if (typeof body.price !== 'number') {
    return NextResponse.json({ error: 'Price must be a number' }, { status: 400 });
  }

  try {
    const procedure = await prisma.procedure.update({
      where: { id },
      data: { price: body.price },
    });
    return NextResponse.json({ success: true, procedure });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update procedure' }, { status: 500 });
  }
}

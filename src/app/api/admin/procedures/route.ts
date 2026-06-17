import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyToken(authHeader.split(' ')[1]);
  if (payload?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const procedures = await prisma.procedure.findMany({
      include: { doctor: { select: { firstName: true, lastName: true, specialty: true } } },
      orderBy: [
        { doctor: { specialty: 'asc' } },
        { name: 'asc' }
      ]
    });
    return NextResponse.json({ success: true, procedures });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch procedures' }, { status: 500 });
  }
}

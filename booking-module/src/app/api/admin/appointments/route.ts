import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/admin/appointments — All appointments across all doctors
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token);

  if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'RECEPTION')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const since = searchParams.get('since');

  const whereClause: any = {};
  if (since) {
    whereClause.createdAt = { gt: new Date(since) };
  }

  const appointments = await prisma.appointment.findMany({
    where: whereClause,
    include: { 
      doctor: true, 
      slot: true,
      patient: true,
      procedure: true
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, appointments });
}

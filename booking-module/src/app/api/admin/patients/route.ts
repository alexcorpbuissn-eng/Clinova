import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/admin/patients — All registered patients
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token);

  if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'RECEPTION' && payload.role !== 'DOCTOR')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const patients = await prisma.patient.findMany({
    where: { isVerified: true },
    include: {
      _count: {
        select: { appointments: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, patients });
}

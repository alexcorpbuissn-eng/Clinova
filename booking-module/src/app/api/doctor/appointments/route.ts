import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

async function requireDoctor(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(authHeader.split(' ')[1]);
  return payload?.role === 'DOCTOR' ? payload : null;
}

// GET /api/doctor/appointments — Upcoming appointments for authenticated doctor
export async function GET(request: NextRequest) {
  const payload = await requireDoctor(request);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const doctorId = payload.doctorId as string;

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      status: 'SCHEDULED',
      slot: { startTime: { gt: new Date() } },
    },
    include: { 
      slot: true,
      patient: {
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          telegramUsername: true
        }
      }
    },
    orderBy: { slot: { startTime: 'asc' } },
  });

  return NextResponse.json({ success: true, appointments });
}

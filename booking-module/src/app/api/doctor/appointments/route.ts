import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/doctor/appointments — Upcoming appointments for authenticated doctor
export async function GET(request: Request) {
  // In production: validate JWT and extract doctorId from it
  const doctorId = request.headers.get('x-doctor-id') ?? '';
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      status: 'SCHEDULED',
      slot: { startTime: { gt: new Date() } },
    },
    include: { slot: true },
    orderBy: { slot: { startTime: 'asc' } },
  });

  return NextResponse.json({ success: true, appointments });
}

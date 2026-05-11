import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/appointments — All appointments across all doctors
export async function GET(request: Request) {
  const role = request.headers.get('x-user-role');
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const appointments = await prisma.appointment.findMany({
    include: { doctor: true, slot: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, appointments });
}

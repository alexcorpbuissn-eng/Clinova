import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/doctor/slots — Fetch doctor's own slots
export async function GET(request: Request) {
  const doctorId = request.headers.get('x-doctor-id') ?? '';
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const slots = await prisma.slot.findMany({
    where: { doctorId, startTime: { gt: new Date() } },
    orderBy: { startTime: 'asc' },
  });

  return NextResponse.json({ success: true, slots });
}

// POST /api/doctor/slots — Create new availability slot
export async function POST(request: Request) {
  const doctorId = request.headers.get('x-doctor-id') ?? '';
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { startTime, duration } = await request.json();

  if (!startTime || !duration) {
    return NextResponse.json({ error: 'startTime and duration are required' }, { status: 400 });
  }

  try {
    const slot = await prisma.slot.create({
      data: { doctorId, startTime: new Date(startTime), duration: Number(duration) },
    });
    return NextResponse.json({ success: true, slot }, { status: 201 });
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'A slot already exists at this time.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

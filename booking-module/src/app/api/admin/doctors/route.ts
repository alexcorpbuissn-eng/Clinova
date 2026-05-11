import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/doctors — List all doctors including inactive
export async function GET(request: Request) {
  const role = request.headers.get('x-user-role');
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const doctors = await prisma.doctor.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ success: true, doctors });
}

// POST /api/admin/doctors — Add a new doctor
export async function POST(request: Request) {
  const role = request.headers.get('x-user-role');
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { firstName, lastName, specialty, bio, photoUrl } = await request.json();
  if (!firstName || !lastName || !specialty) {
    return NextResponse.json({ error: 'firstName, lastName, specialty are required' }, { status: 400 });
  }

  const doctor = await prisma.doctor.create({
    data: { firstName, lastName, specialty, bio, photoUrl },
  });

  return NextResponse.json({ success: true, doctor }, { status: 201 });
}

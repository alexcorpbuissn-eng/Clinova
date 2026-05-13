import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(authHeader.split(' ')[1]);
  return payload?.role === 'ADMIN' ? payload : null;
}

// GET /api/admin/doctors — List all doctors including inactive
export async function GET(request: NextRequest) {
  if (!await requireAdmin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const doctors = await prisma.doctor.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ success: true, doctors });
}

// POST /api/admin/doctors — Add a new doctor
export async function POST(request: NextRequest) {
  if (!await requireAdmin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { firstName, lastName, specialty, bio, photoUrl } = await request.json();
  if (!firstName || !lastName || !specialty) {
    return NextResponse.json({ error: 'firstName, lastName, specialty are required' }, { status: 400 });
  }

  const doctor = await prisma.doctor.create({
    data: { firstName, lastName, specialty, bio, photoUrl },
  });

  return NextResponse.json({ success: true, doctor }, { status: 201 });
}

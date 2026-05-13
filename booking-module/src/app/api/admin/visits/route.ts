import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(authHeader.split(' ')[1]);
  return payload?.role === 'ADMIN' ? payload : null;
}

// GET /api/admin/visits — list visits (optional ?doctorId=&limit=)
export async function GET(request: NextRequest) {
  if (!await requireAdmin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get('doctorId') || undefined;
  const limit = parseInt(searchParams.get('limit') || '50');

  const visits = await prisma.visit.findMany({
    where: doctorId ? { doctorId } : undefined,
    include: { doctor: { select: { firstName: true, lastName: true, specialty: true } } },
    orderBy: { visitDate: 'desc' },
    take: limit,
  });

  return NextResponse.json({ success: true, visits });
}

// POST /api/admin/visits — log a new visit
export async function POST(request: NextRequest) {
  if (!await requireAdmin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { doctorId, patientName, serviceName, price, source, visitDate, note } = body;

  if (!doctorId || !patientName || !serviceName || price === undefined) {
    return NextResponse.json(
      { error: 'doctorId, patientName, serviceName, price are required' },
      { status: 400 }
    );
  }

  const visit = await prisma.visit.create({
    data: {
      doctorId,
      patientName: String(patientName).trim(),
      serviceName: String(serviceName).trim(),
      price: parseInt(price),
      source: source === 'BOOKED' ? 'BOOKED' : 'WALKIN',
      visitDate: visitDate ? new Date(visitDate) : new Date(),
      note: note ? String(note).trim() : null,
    },
    include: { doctor: { select: { firstName: true, lastName: true } } },
  });

  return NextResponse.json({ success: true, visit }, { status: 201 });
}

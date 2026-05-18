import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

async function requireStaff(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(authHeader.split(' ')[1]);
  if (payload?.role === 'ADMIN' || payload?.role === 'RECEPTION') return payload;
  return null;
}

// GET /api/admin/visits — list visits (optional ?doctorId=&limit=)
export async function GET(request: NextRequest) {
  if (!await requireStaff(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get('doctorId') || undefined;
  const limit = parseInt(searchParams.get('limit') || '50');

  const visits = await prisma.visit.findMany({
    where: doctorId ? { doctorId } : undefined,
    include: { doctor: { select: { firstName: true, lastName: true, specialty: true } } },
    orderBy: { startTime: 'desc' },
    take: limit,
  });

  return NextResponse.json({ success: true, visits });
}

// POST /api/admin/visits — log a new visit
export async function POST(request: NextRequest) {
  if (!await requireStaff(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { doctorId, patientId, appointmentId, patientName, serviceName, price, source, startTime, endTime, status, note } = body;

  if (!doctorId || !patientName || !serviceName || price === undefined) {
    return NextResponse.json(
      { error: 'doctorId, patientName, serviceName, price are required' },
      { status: 400 }
    );
  }

  const visit = await prisma.visit.create({
    data: {
      doctorId,
      patientId: patientId || null,
      appointmentId: appointmentId || null,
      patientName: String(patientName).trim(),
      serviceName: String(serviceName).trim(),
      price: parseInt(price),
      source: patientId ? 'BOOKED' : 'WALKIN',
      startTime: startTime ? new Date(startTime) : new Date(),
      endTime: endTime ? new Date(endTime) : null,
      status: status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'COMPLETED',
      paidAmount: status === 'IN_PROGRESS' ? 0 : parseInt(price),
      note: note ? String(note).trim() : null,
    },
    include: { doctor: { select: { firstName: true, lastName: true } } },
  });

  return NextResponse.json({ success: true, visit }, { status: 201 });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

async function requireDoctorOrAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(authHeader.split(' ')[1]);
  if (!payload) return null;
  if (payload.role === 'DOCTOR' || payload.role === 'ADMIN') return payload;
  return null;
}

// GET /api/doctor/slots — Fetch doctor's own upcoming slots
export async function GET(request: NextRequest) {
  const payload = await requireDoctorOrAdmin(request);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let doctorId = payload.doctorId as string;
  if (payload.role === 'ADMIN') {
    const qDocId = request.nextUrl.searchParams.get('doctorId');
    if (qDocId) doctorId = qDocId;
  }

  if (!doctorId || doctorId === 'ADMIN_GLOBAL') {
    return NextResponse.json({ success: true, slots: [] });
  }

  const slots = await prisma.slot.findMany({
    where: { doctorId, startTime: { gte: new Date() } },
    include: { appointment: { select: { status: true, patientFirst: true, patientLast: true, patientPhone: true, patient: { select: { firstName: true, lastName: true, phone: true } } } } },
    orderBy: { startTime: 'asc' },
  });

  return NextResponse.json({ success: true, slots });
}

// POST /api/doctor/slots — Create one or multiple availability slots
export async function POST(request: NextRequest) {
  const payload = await requireDoctorOrAdmin(request);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  
  let doctorId = payload.doctorId as string;
  if (payload.role === 'ADMIN') {
    if (body.doctorId) doctorId = body.doctorId;
  }

  if (!doctorId || doctorId === 'ADMIN_GLOBAL') {
    return NextResponse.json({ error: 'Shifokor tanlanmagan' }, { status: 400 });
  }

  // Support batch: { slots: [{startTime, duration}] } or single: { startTime, duration }
  const slotsToCreate: { startTime: string; duration: number }[] = body.slots || [{ startTime: body.startTime, duration: body.duration }];

  if (!slotsToCreate.length || slotsToCreate.some(s => !s.startTime || !s.duration)) {
    return NextResponse.json({ error: 'startTime va duration majburiy' }, { status: 400 });
  }

  const created = [];
  const skipped = [];

  for (const s of slotsToCreate) {
    try {
      const slot = await prisma.slot.create({
        data: { doctorId, startTime: new Date(s.startTime), duration: Number(s.duration) },
      });
      created.push(slot);
    } catch (e: any) {
      if (e.code === 'P2002') {
        skipped.push(s.startTime); // already exists
      } else {
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ success: true, created: created.length, skipped: skipped.length }, { status: 201 });
}

// DELETE /api/doctor/slots — Delete a free (unbooked) slot
export async function DELETE(request: NextRequest) {
  const payload = await requireDoctorOrAdmin(request);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { slotId } = body;
  
  let doctorId = payload.doctorId as string;
  if (payload.role === 'ADMIN') {
    if (body.doctorId) doctorId = body.doctorId;
  }

  const slot = await prisma.slot.findUnique({ where: { id: slotId } });

  if (!slot || (payload.role !== 'ADMIN' && slot.doctorId !== doctorId)) {
    return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
  }

  if (!slot.isAvailable) {
    return NextResponse.json({ error: 'Bu vaqtga bemor yozilgan, o\'chira olmaysiz' }, { status: 400 });
  }

  await prisma.slot.delete({ where: { id: slotId } });
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token);

  if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'RECEPTION')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  // Read optional cancelNote from request body (JSON)
  let cancelNote: string | undefined;
  try {
    const body = await request.json();
    cancelNote = body?.cancelNote?.trim()?.slice(0, 1000) || undefined;
  } catch {
    // No body or not JSON — that's fine, cancelNote stays undefined
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { slot: true, procedure: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    }

    const N = Math.ceil(appointment.procedure.durationMinutes / 30);
    const baseTime = new Date(appointment.slot.startTime);
    const slotTimesToFree = [];
    for (let i = 0; i < N; i++) {
      slotTimesToFree.push(new Date(baseTime.getTime() + i * 30 * 60 * 1000));
    }

    // Determine target cancelledBy value
    let newCancelledBy = 'ADMIN';
    if (appointment.status === 'CANCELLED' && appointment.cancelledBy === 'NOSHOW') {
      newCancelledBy = 'NOSHOW_UNREACHABLE';
    }

    // Cancel appointment and free the slots instead of deleting it
    await prisma.$transaction([
      prisma.appointment.update({ 
        where: { id },
        data: { 
          status: 'CANCELLED', 
          cancelledBy: newCancelledBy,
          ...(cancelNote ? { cancelNote } : {})
        } 
      }),
      prisma.slot.updateMany({
        where: {
          doctorId: appointment.doctorId,
          startTime: { in: slotTimesToFree }
        },
        data: { isAvailable: true },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Cancel error:', err);
    return NextResponse.json({ error: 'Bekor qilishda xatolik yuz berdi' }, { status: 500 });
  }
}

// PATCH /api/admin/appointments/[id] — Mark as attended
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token);

  if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'RECEPTION')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  if (body.action !== 'ATTEND' && body.action !== 'NOSHOW') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, procedure: true, slot: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    }

    if (appointment.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Allaqachon tugallangan' }, { status: 400 });
    }

    if (body.action === 'NOSHOW') {
      const N = Math.ceil(appointment.procedure.durationMinutes / 30);
      const baseTime = new Date(appointment.slot.startTime);
      const slotTimesToFree = [];
      for (let i = 0; i < N; i++) {
        slotTimesToFree.push(new Date(baseTime.getTime() + i * 30 * 60 * 1000));
      }

      await prisma.$transaction([
        prisma.appointment.update({
          where: { id },
          data: { status: 'CANCELLED', cancelledBy: 'NOSHOW' },
        }),
        prisma.slot.updateMany({
          where: {
            doctorId: appointment.doctorId,
            startTime: { in: slotTimesToFree }
          },
          data: { isAvailable: true }
        }),
      ]);
      return NextResponse.json({ success: true });
    }

    // Mark as completed and log to Visit table
    const patientName = appointment.patient
      ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
      : `${appointment.patientFirst} ${appointment.patientLast}`;

    await prisma.$transaction([
      prisma.appointment.update({
        where: { id },
        data: { status: 'COMPLETED' },
      }),
      prisma.visit.create({
        data: {
          clinic:       { connect: { id: appointment.clinicId } },
          doctor:       { connect: { id: appointment.doctorId } },
          appointment:  { connect: { id } },
          patientName:  patientName.trim(),
          serviceName:  appointment.procedure?.name || 'Birlamchi ko\'rik',
          price:        0,
          source:       'BOOKED',
          startTime:    new Date(),
          note:         'Qabuldan (Admin panel)',
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Attend error:', err);
    return NextResponse.json({ error: 'Saqlashda xatolik' }, { status: 500 });
  }
}

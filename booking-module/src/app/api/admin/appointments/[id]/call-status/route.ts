import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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

  if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'RECEPTION' && payload.role !== 'DOCTOR')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { action } = body;

  if (action !== 'RESOLVE' && action !== 'NO_ANSWER') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Qabul topilmadi' }, { status: 404 });
    }

    let updatedAppointment;

    if (action === 'RESOLVE') {
      updatedAppointment = await prisma.appointment.update({
        where: { id },
        data: { cancelledBy: 'NOSHOW_RESOLVED' },
      });
    } else {
      const newAttempts = appointment.callAttempts + 1;
      if (newAttempts >= 3) {
        updatedAppointment = await prisma.appointment.update({
          where: { id },
          data: { 
            callAttempts: newAttempts,
            cancelledBy: 'NOSHOW_UNREACHABLE'
          },
        });
      } else {
        updatedAppointment = await prisma.appointment.update({
          where: { id },
          data: { callAttempts: newAttempts },
        });
      }
    }

    return NextResponse.json({ success: true, appointment: updatedAppointment });
  } catch (err) {
    console.error('Call status update error:', err);
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 });
  }
}

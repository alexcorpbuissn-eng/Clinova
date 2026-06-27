import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { requireClinicAccess } from '@/lib/clinic-guard';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireClinicAccess(request);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'RECEPTION' && session.role !== 'DOCTOR' && session.role !== 'SUPER_ADMIN')) {
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

    if (appointment.clinicId !== session.clinicId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

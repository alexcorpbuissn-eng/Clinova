import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const patientId = url.searchParams.get('patientId');

  if (!patientId) {
    return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
  }

  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        appointments: {
          where: {
            status: 'SCHEDULED',
            slot: { startTime: { gt: new Date() } } // only upcoming
          },
          include: {
            doctor: true,
            procedure: true,
            slot: true
          },
          orderBy: { slot: { startTime: 'asc' } }
        }
      }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Calculate remaining cancellations
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    let currentCancellations = patient.cancellationsToday;
    if (patient.lastCancellationDate && patient.lastCancellationDate < today) {
      currentCancellations = 0;
    }
    const maxCancellations = 2;
    const remainingCancellations = Math.max(0, maxCancellations - currentCancellations);

    return NextResponse.json({ 
      appointments: patient.appointments,
      remainingCancellations,
      maxCancellations
    });
  } catch (err) {
    console.error('Failed to fetch appointments:', err);
    return NextResponse.json({ error: 'Ichki xatolik' }, { status: 500 });
  }
}

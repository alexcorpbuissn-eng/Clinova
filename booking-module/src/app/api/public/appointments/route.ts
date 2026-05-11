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

    return NextResponse.json({ appointments: patient.appointments });
  } catch (err) {
    console.error('Failed to fetch appointments:', err);
    return NextResponse.json({ error: 'Ichki xatolik' }, { status: 500 });
  }
}

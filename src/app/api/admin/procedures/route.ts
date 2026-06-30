import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClinicAccess } from '@/lib/clinic-guard';

export async function GET(request: NextRequest) {
  const session = await requireClinicAccess(request);
  if (!session || session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const procedures = await prisma.procedure.findMany({
      where: { clinicId: session.clinicId },
      include: { doctor: { select: { firstName: true, lastName: true, specialty: true } } },
      orderBy: [
        { doctor: { specialty: 'asc' } },
        { name: 'asc' }
      ]
    });
    return NextResponse.json({ success: true, procedures });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch procedures' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireClinicAccess(request);
  if (!session || session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, durationMinutes, price, specialty } = body;

    if (!name || !durationMinutes || price === undefined || !specialty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const doctors = await prisma.doctor.findMany({
      where: { clinicId: session.clinicId, specialty }
    });

    if (doctors.length === 0) {
      return NextResponse.json({ error: `Klinikada '${specialty}' mutaxassisligi bo'yicha shifokorlar yo'q. Avval shifokor qo'shing.` }, { status: 400 });
    }

    const newProcedures = [];
    for (const doc of doctors) {
      const proc = await prisma.procedure.create({
        data: {
          name,
          durationMinutes: parseInt(durationMinutes),
          price: parseInt(price),
          doctorId: doc.id,
          clinicId: session.clinicId as string
        }
      });
      newProcedures.push(proc);
    }

    return NextResponse.json({ success: true, count: newProcedures.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create procedure' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { requireClinicAccess } from '@/lib/clinic-guard';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireClinicAccess(request);
  if (!session || session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  if (typeof body.price !== 'number') {
    return NextResponse.json({ error: 'Price must be a number' }, { status: 400 });
  }

  try {
    const target = await prisma.procedure.findUnique({
      where: { id },
      include: { doctor: true }
    });

    if (!target) {
      return NextResponse.json({ error: 'Procedure not found' }, { status: 404 });
    }
    if (target.clinicId !== session.clinicId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const dataToUpdate: any = { price: body.price };
    if (typeof body.durationMinutes === 'number') {
      dataToUpdate.durationMinutes = body.durationMinutes;
    }

    await prisma.procedure.updateMany({
      where: {
        clinicId: session.clinicId,
        name: target.name,
        doctor: { specialty: target.doctor.specialty }
      },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, message: 'All specialty procedures updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update procedures' }, { status: 500 });
  }
}

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

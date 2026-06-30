import { NextRequest, NextResponse } from 'next/server';
import { requireClinicAccess } from '@/lib/clinic-guard';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await requireClinicAccess(request);
  if (!session || !['ADMIN', 'RECEPTION', 'DOCTOR', 'INVENTORY', 'SUPER_ADMIN'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!session.clinicId) {
    return NextResponse.json({ error: 'Clinic is not assigned' }, { status: 403 });
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: session.clinicId },
    select: { id: true, name: true, slug: true, logoUrl: true, isActive: true, plan: true }
  });

  if (!clinic) {
    return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: session.userId,
      role: session.role,
      clinicId: session.clinicId,
      doctorId: session.doctorId ?? null
    },
    clinic
  });
}

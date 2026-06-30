import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClinicAccess } from '@/lib/clinic-guard';

// GET /api/admin/patients — All registered patients
export async function GET(request: NextRequest) {
  const session = await requireClinicAccess(request);
  if (!session || !session.clinicId || (session.role !== 'ADMIN' && session.role !== 'RECEPTION' && session.role !== 'DOCTOR' && session.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const patients = await prisma.patient.findMany({
    where: {
      isVerified: true,
      OR: [
        { appointments: { some: { clinicId: session.clinicId } } },
        { visits: { some: { clinicId: session.clinicId } } }
      ]
    },
    include: {
      _count: {
        select: { appointments: { where: { clinicId: session.clinicId } } }
      },
      appointments: {
        where: { clinicId: session.clinicId },
        select: {
          id: true,
          status: true,
          cancelledBy: true,
          slot: {
            select: { startTime: true }
          }
        }
      },
      visits: {
        where: { clinicId: session.clinicId },
        select: {
          id: true,
          status: true,
          startTime: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, patients });
}

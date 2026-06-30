import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClinicAccess } from '@/lib/clinic-guard';

// GET /api/admin/patients/[id] — Fetch detailed profile and history for a patient
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireClinicAccess(request);
  if (!session || !session.clinicId || (session.role !== 'ADMIN' && session.role !== 'RECEPTION' && session.role !== 'DOCTOR' && session.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          where: { clinicId: session.clinicId },
          include: {
            slot: true,
            doctor: { select: { firstName: true, lastName: true, specialty: true } },
            procedure: { select: { name: true } }
          },
          orderBy: { slot: { startTime: 'desc' } }
        },
        visits: {
          where: { clinicId: session.clinicId },
          include: {
            doctor: { select: { firstName: true, lastName: true, specialty: true } }
          },
          orderBy: { startTime: 'desc' }
        }
      }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Bemor topilmadi' }, { status: 404 });
    }

    if (patient.appointments.length === 0 && patient.visits.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, patient });
  } catch (err) {
    console.error('Error fetching patient history:', err);
    return NextResponse.json({ error: 'Bemor tarixini yuklashda xatolik yuz berdi' }, { status: 500 });
  }
}

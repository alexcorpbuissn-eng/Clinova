import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClinicAccess } from '@/lib/clinic-guard';

// GET /api/superadmin/stats — platform-wide statistics
export async function GET(request: NextRequest) {
  const session = await requireClinicAccess(request);
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const [
      totalClinics,
      activeClinics,
      totalDoctors,
      totalAppointments,
      totalVisits,
      clinicsByPlan,
    ] = await Promise.all([
      prisma.clinic.count(),
      prisma.clinic.count({ where: { isActive: true } }),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.visit.count(),
      prisma.clinic.groupBy({
        by: ['plan'],
        _count: { _all: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalClinics,
        activeClinics,
        totalDoctors,
        totalAppointments,
        totalVisits,
        clinicsByPlan: Object.fromEntries(clinicsByPlan.map(g => [g.plan, g._count._all])),
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

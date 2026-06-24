import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClinicAccess } from '@/lib/clinic-guard';
import { getClinicUsage, PLAN_LIMITS } from '@/lib/plan-limits';

// GET /api/superadmin/billing — usage summary for all clinics
export async function GET(request: NextRequest) {
  const session = await requireClinicAccess(request);
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const clinics = await prisma.clinic.findMany({
    select: { id: true, name: true, slug: true, plan: true, planExpiresAt: true, isActive: true }
  });

  const usageList = await Promise.all(
    clinics.map(async (clinic) => {
      const usage = await getClinicUsage(clinic.id);
      return { ...clinic, usage };
    })
  );

  return NextResponse.json({ success: true, clinics: usageList });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/clinic-guard';
import { signToken } from '@/lib/auth';
import { logSystemEvent } from '@/lib/logger';

// POST /api/superadmin/impersonate
export async function POST(request: NextRequest) {
  const session = await requireRole(request, ['SUPER_ADMIN']);
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { clinicId, role } = await request.json();

    if (!clinicId || !role) {
      return NextResponse.json({ error: 'clinicId and role are required' }, { status: 400 });
    }

    const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
    if (!clinic) {
      return NextResponse.json({ error: 'Klinika topilmadi (Clinic not found)' }, { status: 404 });
    }

    // Assign the SUPER_ADMIN the requested role for the requested clinic
    const payload = {
      userId: session.userId,
      role: role,
      clinicId: clinicId,
      // For DOCTOR role, we would normally need a doctorId. 
      // But SUPER_ADMIN usually just wants to see the doctor UI. 
      // Let's find the first doctor in the clinic, or just pass undefined if none exists.
      doctorId: undefined as string | undefined
    };

    if (role === 'DOCTOR') {
      const doctorUser = await prisma.user.findFirst({
        where: { clinicId, role: 'DOCTOR' },
        select: { doctorId: true }
      });
      if (doctorUser && doctorUser.doctorId) {
        payload.doctorId = doctorUser.doctorId;
      }
    }

    const token = await signToken(payload);

    await logSystemEvent('INFO', 'BACKEND', `SuperAdmin tizimga kirdi: ${role} @ ${clinic.name}`, { superAdminId: session.userId });

    return NextResponse.json({ success: true, token, role });
  } catch (error: any) {
    console.error('Impersonate error:', error);
    return NextResponse.json({ error: error.message || 'Failed to impersonate' }, { status: 500 });
  }
}

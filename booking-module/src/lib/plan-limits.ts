import { prisma } from './prisma';

export type ClinicPlan = 'TRIAL' | 'BASIC' | 'PRO' | 'ENTERPRISE';

export const PLAN_LIMITS: Record<ClinicPlan, { maxDoctors: number; maxAppointmentsPerMonth: number; label: string }> = {
  TRIAL:      { maxDoctors: 1,        maxAppointmentsPerMonth: 50,   label: '🆓 Trial'      },
  BASIC:      { maxDoctors: 3,        maxAppointmentsPerMonth: 150,  label: '📦 Basic'      },
  PRO:        { maxDoctors: 10,       maxAppointmentsPerMonth: 2000, label: '🚀 Pro'        },
  ENTERPRISE: { maxDoctors: Infinity, maxAppointmentsPerMonth: Infinity, label: '🏢 Enterprise' },
};

/** Returns null if OK, or an error message string if limit exceeded */
export async function checkDoctorLimit(clinicId: string): Promise<string | null> {
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { plan: true, _count: { select: { doctors: true } } }
  });
  if (!clinic) return 'Clinic not found';

  const limits = PLAN_LIMITS[clinic.plan as ClinicPlan];
  if (clinic._count.doctors >= limits.maxDoctors) {
    return `${limits.label} rejimi maksimal ${limits.maxDoctors} ta shifokorga ruxsat beradi. Yanada ko'proq shifokor qo'shish uchun tarifingizni yangilang.`;
  }
  return null;
}

/** Returns null if OK, or an error message string if limit exceeded */
export async function checkAppointmentLimit(clinicId: string): Promise<string | null> {
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { plan: true }
  });
  if (!clinic) return 'Clinic not found';

  const limits = PLAN_LIMITS[clinic.plan as ClinicPlan];
  if (limits.maxAppointmentsPerMonth === Infinity) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const count = await prisma.appointment.count({
    where: {
      clinicId,
      createdAt: { gte: startOfMonth },
      status: { not: 'CANCELLED' }
    }
  });

  if (count >= limits.maxAppointmentsPerMonth) {
    return `${limits.label} rejimi oyiga maksimal ${limits.maxAppointmentsPerMonth} ta qabulga ruxsat beradi. Tarifingizni yangilang.`;
  }
  return null;
}

/** Get clinic usage stats for SUPER_ADMIN billing panel */
export async function getClinicUsage(clinicId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: {
      plan: true,
      planExpiresAt: true,
      _count: { select: { doctors: true } }
    }
  });
  if (!clinic) return null;

  const appointmentsThisMonth = await prisma.appointment.count({
    where: {
      clinicId,
      createdAt: { gte: startOfMonth },
      status: { not: 'CANCELLED' }
    }
  });

  const limits = PLAN_LIMITS[clinic.plan as ClinicPlan];

  return {
    plan: clinic.plan,
    planLabel: limits.label,
    planExpiresAt: clinic.planExpiresAt,
    doctors: {
      used: clinic._count.doctors,
      max: limits.maxDoctors === Infinity ? '∞' : limits.maxDoctors,
      pct: limits.maxDoctors === Infinity ? 0 : Math.round((clinic._count.doctors / limits.maxDoctors) * 100)
    },
    appointments: {
      used: appointmentsThisMonth,
      max: limits.maxAppointmentsPerMonth === Infinity ? '∞' : limits.maxAppointmentsPerMonth,
      pct: limits.maxAppointmentsPerMonth === Infinity ? 0 : Math.round((appointmentsThisMonth / limits.maxAppointmentsPerMonth) * 100)
    }
  };
}

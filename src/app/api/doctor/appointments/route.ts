import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClinicAccess } from '@/lib/clinic-guard';

// GET /api/doctor/appointments — Today's appointments for authenticated doctor
export async function GET(request: NextRequest) {
  const session = await requireClinicAccess(request);
  if (!session || !session.clinicId || (session.role !== 'DOCTOR' && session.role !== 'ADMIN' && session.role !== 'RECEPTION' && session.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // If Admin, use doctorId from query params. If Doctor, use their own.
  let doctorId = session.doctorId as string;
  if (session.role === 'ADMIN' || session.role === 'RECEPTION' || session.role === 'SUPER_ADMIN') {
    const qDocId = request.nextUrl.searchParams.get('doctorId');
    if (qDocId) doctorId = qDocId;
  }

  if (!doctorId || doctorId === 'ADMIN_GLOBAL') {
    return NextResponse.json({ success: true, appointments: [] });
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: { clinicId: true }
  });
  if (!doctor || doctor.clinicId !== session.clinicId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Today's start in Tashkent (UTC+5): midnight Tashkent = 19:00 UTC previous day
  const nowUTC = new Date();
  const tashkentNow = new Date(nowUTC.getTime() + 5 * 60 * 60 * 1000);
  // Build midnight UTC for Tashkent today, then subtract 5h to get UTC midnight equivalent
  const todayStartUTC = new Date(Date.UTC(
    tashkentNow.getUTCFullYear(),
    tashkentNow.getUTCMonth(),
    tashkentNow.getUTCDate(),
    -5, 0, 0  // UTC hour = Tashkent midnight (00:00) - 5h = -5 = prev day 19:00 UTC
  ));

  const appointments = await prisma.appointment.findMany({
    where: {
      clinicId: session.clinicId,
      doctorId,
      status: 'SCHEDULED',
      slot: { startTime: { gte: todayStartUTC } },
    },
    include: {
      slot: true,
      procedure: { select: { name: true } },
      patient: {
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          telegramUsername: true
        }
      }
    },
    orderBy: { slot: { startTime: 'asc' } },
  });

  return NextResponse.json({ success: true, appointments });
}

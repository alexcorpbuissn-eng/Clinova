import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

async function requireDoctorOrAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(authHeader.split(' ')[1]);
  if (!payload) return null;
  if (payload.role === 'DOCTOR' || payload.role === 'ADMIN' || payload.role === 'RECEPTION' || payload.role === 'SUPER_ADMIN') return payload;
  return null;
}

// GET /api/doctor/appointments — Today's appointments for authenticated doctor
export async function GET(request: NextRequest) {
  const payload = await requireDoctorOrAdmin(request);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // If Admin, use doctorId from query params. If Doctor, use their own.
  let doctorId = payload.doctorId as string;
  if (payload.role === 'ADMIN') {
    const qDocId = request.nextUrl.searchParams.get('doctorId');
    if (qDocId) doctorId = qDocId;
  }

  if (!doctorId || doctorId === 'ADMIN_GLOBAL') {
    return NextResponse.json({ success: true, appointments: [] });
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

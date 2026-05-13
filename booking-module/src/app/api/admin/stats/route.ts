import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(authHeader.split(' ')[1]);
  return payload?.role === 'ADMIN' ? payload : null;
}

// GET /api/admin/stats — per-doctor visit counts and earnings
export async function GET(request: NextRequest) {
  if (!await requireAdmin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const now = new Date();

  // Today: start of today in UTC
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);

  // Week: last 7 days
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setUTCHours(0, 0, 0, 0);

  // Month: start of current calendar month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const doctors = await prisma.doctor.findMany({
    where: { isActive: true },
    select: { id: true, firstName: true, lastName: true, specialty: true },
    orderBy: { specialty: 'asc' },
  });

  const stats = await Promise.all(doctors.map(async (doc) => {
    const base = { doctorId: doc.id };

    const [daily, weekly, monthly, monthlyRevenue] = await Promise.all([
      prisma.visit.count({ where: { ...base, visitDate: { gte: todayStart } } }),
      prisma.visit.count({ where: { ...base, visitDate: { gte: weekStart } } }),
      prisma.visit.count({ where: { ...base, visitDate: { gte: monthStart } } }),
      prisma.visit.aggregate({
        where: { ...base, visitDate: { gte: monthStart } },
        _sum: { price: true },
      }),
    ]);

    return {
      ...doc,
      daily,
      weekly,
      monthly,
      monthlyRevenue: monthlyRevenue._sum.price || 0,
    };
  }));

  return NextResponse.json({ success: true, stats });
}

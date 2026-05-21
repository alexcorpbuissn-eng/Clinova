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

  // Year: start of current calendar year
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const doctors = await prisma.doctor.findMany({
    select: { id: true, firstName: true, lastName: true, specialty: true, isActive: true, bio: true, photoUrl: true },
    orderBy: { specialty: 'asc' },
  });

  const stats = await Promise.all(doctors.map(async (doc) => {
    const base = { doctorId: doc.id };

    const [daily, weekly, monthly, totalPatients, monthlyRevenue, yearlyRevenue] = await Promise.all([
      prisma.visit.count({ where: { ...base, startTime: { gte: todayStart } } }),
      prisma.visit.count({ where: { ...base, startTime: { gte: weekStart } } }),
      prisma.visit.count({ where: { ...base, startTime: { gte: monthStart } } }),
      prisma.visit.count({ where: base }),
      prisma.visit.aggregate({
        where: { ...base, startTime: { gte: monthStart } },
        _sum: { price: true },
      }),
      prisma.visit.aggregate({
        where: { ...base, startTime: { gte: yearStart } },
        _sum: { price: true },
      }),
    ]);

    // Monthly breakdown for last 12 months (chronological order)
    const monthlyHistory = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      
      const res = await prisma.visit.aggregate({
        where: { ...base, startTime: { gte: start, lte: end } },
        _sum: { price: true }
      });
      
      const uzMonths = [
        'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
        'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
      ];
      
      monthlyHistory.push({
        month: `${uzMonths[d.getMonth()]}, ${d.getFullYear()}`,
        revenue: res._sum.price || 0
      });
    }

    return {
      ...doc,
      daily,
      weekly,
      monthly,
      totalPatients,
      monthlyRevenue: monthlyRevenue._sum.price || 0,
      yearlyRevenue: yearlyRevenue._sum.price || 0,
      monthlyHistory
    };
  }));

  return NextResponse.json({ success: true, stats });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// ── Auth helper ──────────────────────────────────────────────────────────────
async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(authHeader.split(' ')[1]);
  if (payload?.role !== 'ADMIN') return null;
  return payload;
}

// ── GET /api/admin/slots?doctorId=xxx&from=ISO&to=ISO ────────────────────────
// Returns all slots for a doctor in a date range (defaults to next 60 days)
export async function GET(request: NextRequest) {
  const payload = await requireAdmin(request);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get('doctorId');
  if (!doctorId) return NextResponse.json({ error: 'doctorId required' }, { status: 400 });

  const from = searchParams.get('from')
    ? new Date(searchParams.get('from')!)
    : new Date();
  const to = searchParams.get('to')
    ? new Date(searchParams.get('to')!)
    : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days ahead

  try {
    const slots = await prisma.slot.findMany({
      where: {
        doctorId,
        startTime: { gte: from, lte: to },
      },
      include: {
        appointment: {
          select: {
            id: true,
            status: true,
            patient: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
    return NextResponse.json({ success: true, slots });
  } catch (err) {
    console.error('GET /api/admin/slots', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ── POST /api/admin/slots ────────────────────────────────────────────────────
// Single slot: { doctorId, startTime, duration }
// Bulk slots:  { doctorId, days:[0-6], startHour, endHour, interval, fromDate, toDate }
export async function POST(request: NextRequest) {
  const payload = await requireAdmin(request);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: any;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { doctorId } = body;
  if (!doctorId) return NextResponse.json({ error: 'doctorId required' }, { status: 400 });

  // ── Verify doctor exists ──
  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });

  // ── BULK MODE ──────────────────────────────────────────────────────────────
  if (body.bulk === true) {
    const { days, startHour, endHour, interval, fromDate, toDate } = body;

    if (
      !Array.isArray(days) || days.length === 0 ||
      typeof startHour !== 'number' || typeof endHour !== 'number' ||
      typeof interval !== 'number' || !fromDate || !toDate
    ) {
      return NextResponse.json(
        { error: 'Bulk requires: days[], startHour, endHour, interval, fromDate, toDate' },
        { status: 400 }
      );
    }
    if (startHour >= endHour) {
      return NextResponse.json({ error: 'startHour must be before endHour' }, { status: 400 });
    }
    if (interval < 10 || interval > 240) {
      return NextResponse.json({ error: 'interval must be 10–240 minutes' }, { status: 400 });
    }

    const from = new Date(fromDate);
    const to   = new Date(toDate);
    if (isNaN(from.getTime()) || isNaN(to.getTime()) || from > to) {
      return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
    }
    // Safety cap: max 6 months
    const MAX_DAYS = 184;
    const diffDays = Math.ceil((to.getTime() - from.getTime()) / 86400000);
    if (diffDays > MAX_DAYS) {
      return NextResponse.json(
        { error: `Date range too large (max ${MAX_DAYS} days)` },
        { status: 400 }
      );
    }

    // Fetch existing slots in range to avoid duplicates
    const existing = await prisma.slot.findMany({
      where: { doctorId, startTime: { gte: from, lte: to } },
      select: { startTime: true },
    });
    const existingSet = new Set(existing.map((s) => s.startTime.toISOString()));

    // Generate candidate slots
    const toCreate: { doctorId: string; startTime: Date; duration: number }[] = [];
    const cursor = new Date(from);
    cursor.setHours(0, 0, 0, 0);

    while (cursor <= to) {
      const dayOfWeek = cursor.getDay(); // 0 Sun … 6 Sat
      if (days.includes(dayOfWeek)) {
        let hour = startHour;
        let minute = 0;

        while (hour < endHour || (hour === endHour && minute === 0)) {
          const slotStart = new Date(cursor);
          slotStart.setHours(hour, minute, 0, 0);

          const slotEnd = new Date(slotStart.getTime() + interval * 60000);
          if (slotEnd.getHours() > endHour || (slotEnd.getHours() === endHour && slotEnd.getMinutes() > 0)) break;

          if (!existingSet.has(slotStart.toISOString())) {
            toCreate.push({ doctorId, startTime: slotStart, duration: interval });
            existingSet.add(slotStart.toISOString()); // prevent self-duplication in same batch
          }

          minute += interval;
          hour   += Math.floor(minute / 60);
          minute  = minute % 60;
          if (hour >= endHour) break;
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    if (toCreate.length === 0) {
      return NextResponse.json({ success: true, created: 0, message: 'Yaratilacak slot topilmadi (allaqachon mavjud bo\'lishi mumkin)' });
    }

    // Batch insert
    const result = await prisma.slot.createMany({ data: toCreate, skipDuplicates: true });
    return NextResponse.json({ success: true, created: result.count });
  }

  // ── SINGLE SLOT MODE ───────────────────────────────────────────────────────
  const { startTime, duration } = body;
  if (!startTime || typeof duration !== 'number' || duration < 10) {
    return NextResponse.json({ error: 'startTime and duration (min 10) required' }, { status: 400 });
  }

  const start = new Date(startTime);
  if (isNaN(start.getTime())) {
    return NextResponse.json({ error: 'Invalid startTime' }, { status: 400 });
  }

  try {
    const slot = await prisma.slot.create({
      data: { doctorId, startTime: start, duration },
    });
    return NextResponse.json({ success: true, slot });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Bu vaqtda slot allaqachon mavjud' }, { status: 409 });
    }
    console.error('POST /api/admin/slots', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

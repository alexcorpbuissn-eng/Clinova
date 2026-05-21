import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(authHeader.split(' ')[1]);
  if (payload?.role !== 'ADMIN') return null;
  return payload;
}

// GET /api/admin/leaves
export async function GET(request: NextRequest) {
  const payload = await requireAdmin(request);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const leaves = await prisma.leave.findMany({
      include: {
        doctor: { select: { firstName: true, lastName: true } }
      },
      orderBy: { startTime: 'desc' },
      take: 100
    });
    return NextResponse.json({ success: true, leaves });
  } catch (err) {
    console.error('[GET leaves error]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/admin/leaves
export async function POST(request: NextRequest) {
  const payload = await requireAdmin(request);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { doctorId, startTime, endTime, reason } = body;

    if (!doctorId || !startTime || !endTime) {
      return NextResponse.json({ error: 'doctorId, startTime, endTime required' }, { status: 400 });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return NextResponse.json({ error: 'Invalid dates' }, { status: 400 });
    }

    // 1. Create the leave record
    const leave = await prisma.leave.create({
      data: {
        doctorId,
        startTime: start,
        endTime: end,
        reason: reason || 'Dam olish / Otgul'
      }
    });

    // 2. Delete ALL UNBOOKED slots that fall entirely OR partially inside this leave period
    // Unbooked means they have no appointment
    const deletedSlots = await prisma.slot.deleteMany({
      where: {
        doctorId,
        appointment: null,
        startTime: {
          gte: start,
          lt: end
        }
      }
    });

    return NextResponse.json({ success: true, leave, deletedSlots: deletedSlots.count });
  } catch (err) {
    console.error('[POST leaves error]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/admin/leaves?id=...
export async function DELETE(request: NextRequest) {
  const payload = await requireAdmin(request);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    await prisma.leave.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE leaves error]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

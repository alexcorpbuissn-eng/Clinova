import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClinicAccess } from '@/lib/clinic-guard';

// GET /api/admin/leaves
export async function GET(request: NextRequest) {
  const session = await requireClinicAccess(request);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'RECEPTION' && session.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const leaves = await prisma.leave.findMany({
      where: { clinicId: session.clinicId },
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
  const session = await requireClinicAccess(request);
  if (!session || session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
        reason: reason || 'Dam olish / Otgul',
        clinicId: session.clinicId as string,
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

    // 3. Send Telegram notification to the doctor
    try {
      const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
      if (doctor && doctor.telegramChatId) {
        // dynamic import of bot to avoid top-level issues if any
        const { getBot, toTashkentDate } = await import('@/lib/telegram');
        const bot = getBot();
        
        const startDateStr = toTashkentDate(start);
        const endDateStr = toTashkentDate(end);

        const text = `🎉 *Tabriklaymiz!*\n\nSizga *${startDateStr}* dan *${endDateStr}* gacha dam olish (otpuska) berildi.\n\nYaxshi dam oling! 🌴`;
        await bot.sendMessage(doctor.telegramChatId, text, { parse_mode: 'Markdown' });
      }
    } catch (tgErr) {
      console.error('[POST leaves Telegram error]', tgErr);
    }

    return NextResponse.json({ success: true, leave, deletedSlots: deletedSlots.count });
  } catch (err) {
    console.error('[POST leaves error]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/admin/leaves?id=...
export async function DELETE(request: NextRequest) {
  const session = await requireClinicAccess(request);
  if (!session || session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const leave = await prisma.leave.findUnique({ where: { id } });
    if (!leave) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    if (leave.clinicId !== session.clinicId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.leave.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE leaves error]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

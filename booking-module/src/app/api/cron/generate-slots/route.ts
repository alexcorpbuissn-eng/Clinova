import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This endpoint can be triggered by a Vercel Cron or called manually
// GET /api/cron/generate-slots
export async function GET(request: NextRequest) {
  try {
    // 1. Get all active doctors
    const doctors = await prisma.doctor.findMany({
      where: { isActive: true },
      include: { leaves: true }
    });

    const now = new Date();
    // Generate for next 30 days
    const horizonDays = 30;
    let totalCreated = 0;

    for (const doctor of doctors) {
      const toCreate = [];
      const existingSlots = await prisma.slot.findMany({
        where: {
          doctorId: doctor.id,
          startTime: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()), // Start of today locally
            lte: new Date(Date.now() + horizonDays * 86400000)
          }
        },
        select: { startTime: true }
      });
      const existingSet = new Set(existingSlots.map(s => s.startTime.toISOString()));

      for (let dayOffset = 0; dayOffset <= horizonDays; dayOffset++) {
        // We use UTC methods but treat them as local time representation for +5 timezone
        // Or simply construct the date string in +05:00 timezone
        const d = new Date(Date.now() + dayOffset * 86400000);
        // Convert 'd' to Tashkent time to know the day and date
        const tashkentTime = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Tashkent' }));
        const year = tashkentTime.getFullYear();
        const month = String(tashkentTime.getMonth() + 1).padStart(2, '0');
        const date = String(tashkentTime.getDate()).padStart(2, '0');
        const dayOfWeek = tashkentTime.getDay(); // 0 is Sunday

        if (dayOfWeek === 0) continue; // Skip Sunday

        const dateString = `${year}-${month}-${date}`; // e.g., 2026-05-22

        // Morning Shift: 09:00 - 13:00 (ends before 13:00)
        // Afternoon Shift: 14:00 - 18:00 (ends before 18:00)
        const times = [
          '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
          '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
        ];

        for (const time of times) {
          const slotStart = new Date(`${dateString}T${time}:00+05:00`);
          
          if (slotStart <= now) continue; // Don't generate slots in the past

          // Check if slot overlaps with any leave
          let isLeave = false;
          for (const leave of doctor.leaves) {
            if (slotStart >= leave.startTime && slotStart < leave.endTime) {
              isLeave = true;
              break;
            }
          }

          if (isLeave) continue; // Skip this slot due to leave

          if (!existingSet.has(slotStart.toISOString())) {
            toCreate.push({
              doctorId: doctor.id,
              startTime: slotStart,
              duration: 30
            });
            existingSet.add(slotStart.toISOString());
          }
        }
      }

      if (toCreate.length > 0) {
        const result = await prisma.slot.createMany({
          data: toCreate,
          skipDuplicates: true
        });
        totalCreated += result.count;
      }
    }

    return NextResponse.json({ success: true, created: totalCreated, message: `Generated ${totalCreated} slots for ${doctors.length} doctors.` });

  } catch (error) {
    console.error('[cron/generate-slots]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

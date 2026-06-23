import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSlotsForDoctor } from '@/lib/slot-generator';

// This endpoint can be triggered by a Vercel Cron or called manually
// GET /api/cron/generate-slots
export async function GET(request: NextRequest) {
  // Protect against unauthorized triggering
  const secret = request.headers.get('x-cron-secret') ?? request.headers.get('authorization');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Get all active doctors
    const doctors = await prisma.doctor.findMany({
      where: { isActive: true },
      include: { leaves: true }
    });

    const now = new Date();
    let totalCreated = 0;

    for (const doctor of doctors) {
      totalCreated += await generateSlotsForDoctor(doctor.id, doctor.clinicId, 30);
    }


    for (const doctor of doctors) {
      // existing slot logic...
      
      if (doctor.telegramChatId) {
        const tashkentNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tashkent' }));
        for (const leave of doctor.leaves) {
          const tashkentEnd = new Date(leave.endTime.toLocaleString('en-US', { timeZone: 'Asia/Tashkent' }));
          
          if (tashkentNow.getFullYear() === tashkentEnd.getFullYear() &&
              tashkentNow.getMonth() === tashkentEnd.getMonth() &&
              tashkentNow.getDate() === tashkentEnd.getDate()) {
              
              try {
                const { getBot } = await import('@/lib/telegram');
                const bot = getBot();
                const text = `⏰ *Eslatma:*\n\nDam olish kuningiz tugamoqda. Ertaga ishga chiqishingiz kerak!\n\n🏥 Klinika: *Habibullo-Hilola*`;
                await bot.sendMessage(doctor.telegramChatId, text, { parse_mode: 'Markdown' });
              } catch(e) {
                console.error('[Cron Leave Reminder Error]', e);
              }
          }
        }
      }
    }

    return NextResponse.json({ success: true, created: totalCreated, message: `Generated ${totalCreated} slots for ${doctors.length} doctors.` });

  } catch (error) {
    console.error('[cron/generate-slots]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 
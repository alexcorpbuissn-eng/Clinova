/**
 * GET /api/public/doctors/:id/slots
 *
 * Returns available future slots for a doctor.
 * If procedureId is passed as a query param, filters out slots
 * where the slot duration is shorter than the procedure duration.
 *
 * Example: GET /api/public/doctors/abc/slots?procedureId=xyz
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const procedureId = req.nextUrl.searchParams.get('procedureId');
  const customDuration = req.nextUrl.searchParams.get('duration');

  let procedureDuration: number | null = null;

  if (customDuration && !isNaN(Number(customDuration))) {
    procedureDuration = Number(customDuration);
  } else if (procedureId) {
    const procedure = await prisma.procedure.findUnique({
      where: { id: procedureId },
      select: { durationMinutes: true },
    });
    if (procedure) procedureDuration = procedure.durationMinutes;
  }

  // Limit patient horizon to exactly 7 days from now
  const horizonDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const slots = await prisma.slot.findMany({
    where: {
      doctorId: id,
      isAvailable: true,
      startTime: { 
        gt: new Date(),
        lte: horizonDate 
      },
    },
    orderBy: { startTime: 'asc' },
  });

  // Filter slots if a procedure is selected to ensure we have enough consecutive slots
  let filteredSlots = slots;
  if (procedureDuration !== null) {
    const N = Math.ceil(procedureDuration / 30);
    filteredSlots = slots.filter(slot => {
      let canFit = true;
      const baseTime = new Date(slot.startTime).getTime();
      for (let i = 1; i < N; i++) {
        const nextTime = new Date(baseTime + i * 30 * 60 * 1000);
        const hasNext = slots.some(s => new Date(s.startTime).getTime() === nextTime.getTime());
        if (!hasNext) {
          canFit = false;
          break;
        }
      }
      return canFit;
    });
  }

  // Enrich with computed endTime for display purposes
  const enriched = filteredSlots.map((s: any) => ({
    id: s.id,
    startTime: s.startTime,
    endTime: new Date(s.startTime.getTime() + (procedureDuration || s.duration) * 60_000),
    duration: procedureDuration || s.duration,
  }));

  return NextResponse.json({ success: true, slots: enriched });
}

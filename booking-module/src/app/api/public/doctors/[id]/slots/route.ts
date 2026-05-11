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
  { params }: { params: { id: string } }
) {
  const procedureId = req.nextUrl.searchParams.get('procedureId');

  let procedureDuration: number | null = null;

  if (procedureId) {
    const procedure = await prisma.procedure.findUnique({
      where: { id: procedureId },
      select: { durationMinutes: true },
    });
    if (procedure) procedureDuration = procedure.durationMinutes;
  }

  const slots = await prisma.slot.findMany({
    where: {
      doctorId: params.id,
      isAvailable: true,
      startTime: { gt: new Date() },
      // If a procedure was selected, only return slots long enough
      ...(procedureDuration !== null
        ? { duration: { gte: procedureDuration } }
        : {}),
    },
    orderBy: { startTime: 'asc' },
  });

  // Enrich with computed endTime for display purposes
  const enriched = slots.map((s) => ({
    id: s.id,
    startTime: s.startTime,
    endTime: new Date(s.startTime.getTime() + s.duration * 60_000),
    duration: s.duration,
  }));

  return NextResponse.json({ success: true, slots: enriched });
}

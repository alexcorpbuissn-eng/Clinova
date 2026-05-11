/**
 * GET /api/public/doctors/:id/procedures
 *
 * Returns active procedures for a doctor with their durations.
 * Used by the frontend to populate Step 2 procedure dropdown.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const procedures = await prisma.procedure.findMany({
    where: { doctorId: params.id, isActive: true },
    select: { id: true, name: true, durationMinutes: true },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ success: true, procedures });
}

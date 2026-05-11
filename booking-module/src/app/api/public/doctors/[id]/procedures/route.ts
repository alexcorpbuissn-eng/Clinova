import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const procedures = await prisma.procedure.findMany({
    where: { doctorId: id, isActive: true },
    select: { id: true, name: true, durationMinutes: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json({ success: true, procedures });
}

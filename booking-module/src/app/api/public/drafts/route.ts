import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/public/drafts?patientId=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId');

  if (!patientId) {
    return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
  }

  try {
    const drafts = await prisma.savedDraft.findMany({
      where: { 
        patientId,
        status: 'PENDING'
      },
      include: {
        doctor: { select: { firstName: true, lastName: true, specialty: true } },
        procedure: { select: { id: true, name: true, price: true, durationMinutes: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, drafts });
  } catch (error: any) {
    console.error('[get drafts]', error);
    return NextResponse.json({ error: 'Ichki xatolik yuz berdi' }, { status: 500 });
  }
}

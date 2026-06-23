import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { requireClinicAccess } from '@/lib/clinic-guard';

async function requireStaff(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(authHeader.split(' ')[1]);
  if (payload?.role === 'ADMIN' || payload?.role === 'RECEPTION') return payload;
  return null;
}

// POST /api/reception/drafts
export async function POST(request: NextRequest) {
  const session = await requireClinicAccess(request);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'RECEPTION')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { doctorId, patientId, procedureId, customDuration } = body;

  if (!doctorId || !patientId || !procedureId) {
    return NextResponse.json(
      { error: 'doctorId, patientId, and procedureId are required' },
      { status: 400 }
    );
  }

  try {
    const draft = await prisma.savedDraft.create({
      data: {
        doctorId,
        patientId,
        procedureId,
        customDuration: customDuration ? parseInt(customDuration, 10) : null,
        status: 'PENDING',
        clinicId: session.clinicId as string,
      },
      include: {
        doctor: { select: { firstName: true, lastName: true, specialty: true } },
        procedure: { select: { name: true, price: true, durationMinutes: true } },
        patient: { select: { firstName: true, lastName: true, phone: true } }
      }
    });

    return NextResponse.json({ success: true, draft }, { status: 201 });
  } catch (error: any) {
    console.error('[create draft]', error);
    return NextResponse.json({ error: 'Ichki xatolik yuz berdi' }, { status: 500 });
  }
}

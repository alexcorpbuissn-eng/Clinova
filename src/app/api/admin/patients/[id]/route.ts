import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

async function requireStaff(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(authHeader.split(' ')[1]);
  if (!payload) return null;
  if (payload.role === 'ADMIN' || payload.role === 'RECEPTION' || payload.role === 'DOCTOR') {
    return payload;
  }
  return null;
}

// GET /api/admin/patients/[id] — Fetch detailed profile and history for a patient
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await requireStaff(request);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            slot: true,
            doctor: { select: { firstName: true, lastName: true, specialty: true } },
            procedure: { select: { name: true } }
          },
          orderBy: { slot: { startTime: 'desc' } }
        },
        visits: {
          include: {
            doctor: { select: { firstName: true, lastName: true, specialty: true } }
          },
          orderBy: { startTime: 'desc' }
        }
      }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Bemor topilmadi' }, { status: 404 });
    }

    return NextResponse.json({ success: true, patient });
  } catch (err) {
    console.error('Error fetching patient history:', err);
    return NextResponse.json({ error: 'Bemor tarixini yuklashda xatolik yuz berdi' }, { status: 500 });
  }
}

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { requireClinicAccess } from '@/lib/clinic-guard';
import { generateSlotsForDoctor } from '@/lib/slot-generator';

async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(authHeader.split(' ')[1]);
  return payload?.role === 'ADMIN' ? payload : null;
}

// GET /api/admin/doctors — List all doctors including inactive
export async function GET(request: NextRequest) {
  if (!await requireAdmin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const doctors = await prisma.doctor.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ success: true, doctors });
}

// POST /api/admin/doctors — Add a new doctor
export async function POST(request: NextRequest) {
  const session = await requireClinicAccess(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { firstName, lastName, specialty, bio, photoUrl, telegramUsername, workStartTime, workEndTime, breakStartTime, breakEndTime, workingDays } = await request.json();
    if (!firstName || !lastName || !specialty) {
      return NextResponse.json({ error: 'firstName, lastName, specialty are required' }, { status: 400 });
    }

    let telegramChatId = null;
    let cleanUsername = null;

    if (telegramUsername) {
      cleanUsername = telegramUsername.replace('@', '').trim();
      const patient = await prisma.patient.findFirst({
        where: {
          telegramUsername: {
            equals: cleanUsername,
            mode: 'insensitive'
          }
        }
      });
      if (patient && patient.telegramChatId) {
        telegramChatId = patient.telegramChatId;
      }
    }

    const doctor = await prisma.doctor.create({
      data: { 
        firstName, 
        lastName, 
        specialty, 
        bio, 
        photoUrl,
        telegramUsername: cleanUsername,
        telegramChatId,
        workStartTime: workStartTime || "09:00",
        workEndTime: workEndTime || "18:00",
        breakStartTime: breakStartTime || "13:00",
        breakEndTime: breakEndTime || "14:00",
        workingDays: workingDays || [1, 2, 3, 4, 5, 6],
        clinicId: session.clinicId as string,
      },
    });

    // Auto-generate initial slots for the new doctor
    await generateSlotsForDoctor(doctor.id, doctor.clinicId);

    return NextResponse.json({ success: true, doctor, chatFound: !!telegramChatId }, { status: 201 });
  } catch (error: any) {
    console.error('Doctor POST Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

async function requireDoctorOrAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(authHeader.split(' ')[1]);
  if (!payload) return null;
  if (payload.role === 'DOCTOR' || payload.role === 'ADMIN') return payload;
  return null;
}

// GET /api/doctor/patients
// Returns patients associated with this doctor (via completed/scheduled appointments or visits)
export async function GET(request: NextRequest) {
  const payload = await requireDoctorOrAdmin(request);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let doctorId = payload.doctorId as string;
  if (payload.role === 'ADMIN') {
    const qDocId = request.nextUrl.searchParams.get('doctorId');
    if (qDocId) doctorId = qDocId;
  }

  if (!doctorId || doctorId === 'ADMIN_GLOBAL') {
    return NextResponse.json({ success: true, patients: [] });
  }

  try {
    // Query patients that have had appointments with this doctor
    const appointments = await prisma.appointment.findMany({
      where: { doctorId },
      select: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            telegramPhone: true
          }
        }
      }
    });

    // Deduplicate patients
    const patientMap = new Map();
    for (const appt of appointments) {
      if (appt.patient) {
        patientMap.set(appt.patient.id, appt.patient);
      }
    }

    const patients = Array.from(patientMap.values());
    return NextResponse.json({ success: true, patients });
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

// POST /api/doctor/patients
// Creates a new patient or returns existing one by phone
export async function POST(request: NextRequest) {
  const payload = await requireDoctorOrAdmin(request);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { firstName, lastName, phone } = body;

    if (!firstName || !lastName || !phone) {
      return NextResponse.json({ error: 'Barcha maydonlarni to\'ldiring' }, { status: 400 });
    }

    const cleanPhone = '+' + phone.replace(/\D/g, '');

    // Check if patient exists by phone or telegramPhone
    let patient = await prisma.patient.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { telegramPhone: cleanPhone }
        ]
      }
    });

    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          firstName,
          lastName,
          phone: cleanPhone,
          telegramPhone: cleanPhone,
          isVerified: true
        }
      });
    }

    return NextResponse.json({ success: true, patient });
  } catch (error: any) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: 'Bemor yaratishda xatolik yuz berdi' }, { status: 500 });
  }
}

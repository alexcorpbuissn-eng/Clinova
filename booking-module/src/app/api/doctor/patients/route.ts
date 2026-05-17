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

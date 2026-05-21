import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/public/complaints
// Accepts { patientId, message }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, message } = body;

    if (!patientId) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    if (!message || message.trim() === '') {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return NextResponse.json({ success: false, error: 'Bemor topilmadi' }, { status: 404 });
    }

    const complaint = await prisma.complaint.create({
      data: {
        patientId: patient.id,
        message: message.trim(),
        status: 'PENDING'
      }
    });

    return NextResponse.json({ success: true, complaint });
  } catch (error: any) {
    console.error('[POST complaint error]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET /api/public/complaints
// Requires header X-Dev-Password
export async function GET(req: NextRequest) {
  try {
    const devPassword = req.headers.get('X-Dev-Password');
    
    // The password approved by the user
    if (devPassword !== 'yamada554551') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const complaints = await prisma.complaint.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            telegramPhone: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, complaints });
  } catch (error: any) {
    console.error('[GET complaints error]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

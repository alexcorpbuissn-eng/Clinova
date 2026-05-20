import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json({ success: false, error: 'Patient ID required' }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        telegramPhone: true,
        phone: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ success: false, error: 'Patient not found' }, { status: 404 });
    }

    const visits = await prisma.visit.findMany({
      where: { patientId: patientId, status: 'COMPLETED' },
      select: { price: true },
    });

    const totalVisits = visits.length;
    const totalPaid = visits.reduce((sum, v) => sum + (v.price || 0), 0);

    return NextResponse.json({ success: true, patient, stats: { totalVisits, totalPaid } });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, firstName, lastName, telegramPhone } = body;

    if (!patientId || !firstName || !lastName || !telegramPhone) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    // Clean phone numbers
    const cleanTgPhone = telegramPhone.replace(/\s+/g, '').replace(/[^+\d]/g, '');

    // Get current patient to see if phone changed
    const currentPatient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!currentPatient) {
      return NextResponse.json({ success: false, error: 'Patient not found' }, { status: 404 });
    }

    let phoneChanged = false;

    if (currentPatient.telegramPhone !== cleanTgPhone) {
      // Check if new number is already taken
      const existing = await prisma.patient.findUnique({
        where: { telegramPhone: cleanTgPhone },
      });

      if (existing) {
        return NextResponse.json({ success: false, error: "Bu raqam allaqachon ro'yxatdan o'tgan." }, { status: 400 });
      }

      phoneChanged = true;
    }

    // Update the patient
    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        telegramPhone: cleanTgPhone,
        phone: cleanTgPhone, // keep them synced for simplicity if they edit the main number
      },
    });

    return NextResponse.json({
      success: true,
      phoneChanged,
      patient: updatedPatient,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

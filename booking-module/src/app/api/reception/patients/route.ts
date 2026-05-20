import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

async function requireStaffOrDoctor(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(authHeader.split(' ')[1]);
  if (payload?.role === 'ADMIN' || payload?.role === 'RECEPTION' || payload?.role === 'DOCTOR') return payload;
  return null;
}

// POST /api/reception/patients — create offline patient or return existing
export async function POST(req: NextRequest) {
  const user = await requireStaffOrDoctor(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { firstName, lastName, phone, telegramPhone } = await req.json();

  if (!firstName || !lastName || !phone) {
    return NextResponse.json({ error: 'firstName, lastName, phone are required fields' }, { status: 400 });
  }

  const cleanPhone = String(phone).trim();
  const cleanTgPhone = telegramPhone ? String(telegramPhone).trim() : null;

  // Check if patient exists by phone
  const existing = await prisma.patient.findFirst({
    where: { phone: cleanPhone },
    include: {
      visits: { orderBy: { createdAt: 'desc' }, take: 5 },
      appointments: { orderBy: { createdAt: 'desc' }, take: 5 }
    }
  });

  if (existing) {
    // Sync name and telegram phone if provided
    const updated = await prisma.patient.update({
      where: { id: existing.id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ...(cleanTgPhone ? { telegramPhone: cleanTgPhone } : {})
      },
      include: {
        visits: { orderBy: { createdAt: 'desc' }, take: 5 },
        appointments: { orderBy: { createdAt: 'desc' }, take: 5 }
      }
    });
    return NextResponse.json({ patient: updated, isNew: false });
  }

  // Create new offline patient
  const patient = await prisma.patient.create({
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: cleanPhone,
      telegramPhone: cleanTgPhone,
      source: 'WALKIN',
      isVerified: false,
    }
  });

  return NextResponse.json({ patient, isNew: true }, { status: 201 });
}

// GET /api/reception/patients?phone=... — search patients
export async function GET(req: NextRequest) {
  const user = await requireStaffOrDoctor(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const phone = req.nextUrl.searchParams.get('phone');
  const name = req.nextUrl.searchParams.get('name');

  if (!phone && !name) {
    return NextResponse.json({ error: 'phone or name parameter is required' }, { status: 400 });
  }

  const patients = await prisma.patient.findMany({
    where: {
      OR: [
        phone ? { phone: { contains: phone } } : {},
        phone ? { telegramPhone: { contains: phone } } : {},
        name ? { firstName: { contains: name, mode: 'insensitive' } } : {},
        name ? { lastName: { contains: name, mode: 'insensitive' } } : {},
      ]
    },
    include: {
      visits: { orderBy: { createdAt: 'desc' }, take: 3 },
    },
    take: 10
  });

  return NextResponse.json({ patients });
}

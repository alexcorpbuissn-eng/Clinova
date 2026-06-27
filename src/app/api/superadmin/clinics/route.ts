import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClinicAccess } from '@/lib/clinic-guard';
import { logSystemEvent } from '@/lib/logger';

// GET /api/superadmin/clinics
export async function GET(request: NextRequest) {
  const session = await requireClinicAccess(request);
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const clinics = await prisma.clinic.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { appointments: true, doctors: true, users: true }
        }
      }
    });
    return NextResponse.json({ success: true, clinics });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch clinics' }, { status: 500 });
  }
}

// POST /api/superadmin/clinics — create clinic + first admin user
export async function POST(request: NextRequest) {
  const session = await requireClinicAccess(request);
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { name, slug, address, phone, adminPhone } = body;

  if (!name || !slug || !adminPhone) {
    return NextResponse.json(
      { error: 'name, slug, and adminPhone are required' },
      { status: 400 }
    );
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: 'slug must be lowercase letters, numbers, and hyphens only' },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.clinic.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Slug already taken' }, { status: 409 });
    }

    const existingUser = await prisma.user.findUnique({ where: { telegramPhone: adminPhone } });
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this phone already exists' }, { status: 409 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({
        data: { name, slug, address: address || null, phone: phone || null, isActive: true, plan: 'TRIAL' }
      });

      const user = await tx.user.create({
        data: { telegramPhone: adminPhone, role: 'ADMIN', clinicId: clinic.id }
      });

      return { clinic, adminUserId: user.id };
    });

    await logSystemEvent('INFO', 'BACKEND', `Yangi klinika yaratildi: ${name}`, { clinicId: result.clinic.id, slug, adminPhone });

    return NextResponse.json({
      success: true,
      clinic: result.clinic,
      admin: {
        userId: result.adminUserId,
        telegramPhone: adminPhone,
        note: 'Admin can now log in via Telegram OTP with this phone number'
      }
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create clinic' }, { status: 500 });
  }
}

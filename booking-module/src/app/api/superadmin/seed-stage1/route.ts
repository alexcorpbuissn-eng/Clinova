/**
 * POST /api/superadmin/seed-stage1
 *
 * Одноразовый эндпоинт для запуска Stage 1 seed через HTTP.
 * Нужен потому что DATABASE_URL доступен только на Vercel, а не локально.
 *
 * Защита: заголовок  X-Seed-Secret: <SEED_RUN_SECRET из env Vercel>
 *
 * После успешного запуска — УДАЛИ этот файл!
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-seed-secret');
  if (!secret || secret !== process.env.SEED_RUN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Создать или найти клинику
    const clinic = await prisma.clinic.upsert({
      where: { slug: 'habibullo-hilola' },
      update: {},
      create: {
        name: 'Habibullo-Hilola',
        slug: 'habibullo-hilola',
        timezone: 'Asia/Tashkent',
        isActive: true,
        plan: 'TRIAL',
      },
    });

    const cid = clinic.id;

    // 2. Привязать все записи к клинике (только те, у кого clinicId пуст)
    const [doctors, users, procedures, slots, leaves, appointments, visits, complaints, drafts, purchases] =
      await Promise.all([
        prisma.doctor.updateMany({ where: { clinicId: null }, data: { clinicId: cid } }),
        prisma.user.updateMany({ where: { clinicId: null, role: { not: 'SUPER_ADMIN' } }, data: { clinicId: cid } }),
        prisma.procedure.updateMany({ where: { clinicId: null }, data: { clinicId: cid } }),
        prisma.slot.updateMany({ where: { clinicId: null }, data: { clinicId: cid } }),
        prisma.leave.updateMany({ where: { clinicId: null }, data: { clinicId: cid } }),
        prisma.appointment.updateMany({ where: { clinicId: null }, data: { clinicId: cid } }),
        prisma.visit.updateMany({ where: { clinicId: null }, data: { clinicId: cid } }),
        prisma.complaint.updateMany({ where: { clinicId: null }, data: { clinicId: cid } }),
        prisma.savedDraft.updateMany({ where: { clinicId: null }, data: { clinicId: cid } }),
        prisma.purchase.updateMany({ where: { clinicId: null }, data: { clinicId: cid } }),
      ]);

    return NextResponse.json({
      success: true,
      clinic: { id: clinic.id, name: clinic.name, slug: clinic.slug },
      updated: {
        doctors: doctors.count,
        users: users.count,
        procedures: procedures.count,
        slots: slots.count,
        leaves: leaves.count,
        appointments: appointments.count,
        visits: visits.count,
        complaints: complaints.count,
        savedDrafts: drafts.count,
        purchases: purchases.count,
      },
    });
  } catch (error) {
    console.error('Seed Stage 1 error:', error);
    return NextResponse.json({ error: 'Seed failed', details: String(error) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClinicAccess } from '@/lib/clinic-guard';
import { getBot } from '@/lib/telegram';

async function requireAdminSession(request: NextRequest) {
  const session = await requireClinicAccess(request);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') || !session.clinicId) {
    return null;
  }
  return session;
}

// GET /api/admin/users
export async function GET(request: NextRequest) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { clinicId: session.clinicId },
    orderBy: { createdAt: 'desc' }
  });

  const phones = users.map(u => u.telegramPhone);
  const patients = await prisma.patient.findMany({
    where: { telegramPhone: { in: phones } },
    select: {
      telegramPhone: true,
      firstName: true,
      lastName: true
    }
  });

  const patientMap: Record<string, string> = {};
  for (const p of patients) {
    if (p.telegramPhone) {
      patientMap[p.telegramPhone] = `${p.firstName} ${p.lastName}`;
    }
  }

  const usersWithName = users.map(u => ({
    ...u,
    name: u.name || patientMap[u.telegramPhone] || null
  }));

  return NextResponse.json({ success: true, users: usersWithName });
}

// POST /api/admin/users
export async function POST(request: NextRequest) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { telegramPhone, role, doctorId, name } = body;

    if (!telegramPhone || !role) {
      return NextResponse.json({ error: 'Telefon raqam va rol majburiy' }, { status: 400 });
    }

    if (role === 'DOCTOR' && !doctorId) {
      return NextResponse.json({ error: 'Shifokor roli uchun shifokorni tanlash majburiy' }, { status: 400 });
    }

    if (role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        select: { clinicId: true }
      });
      if (!doctor || doctor.clinicId !== session.clinicId) {
        return NextResponse.json({ error: 'Shifokor topilmadi' }, { status: 404 });
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { telegramPhone },
      select: { id: true, role: true, clinicId: true }
    });

    if (existingUser?.role === 'SUPER_ADMIN' || (existingUser?.clinicId && existingUser.clinicId !== session.clinicId)) {
      return NextResponse.json({ error: 'Bu telefon raqam boshqa klinikaga biriktirilgan' }, { status: 409 });
    }

    const user = existingUser
      ? await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role,
          name: name || null,
          doctorId: role === 'DOCTOR' ? doctorId : null,
          clinicId: session.clinicId
        }
      })
      : await prisma.user.create({
        data: {
          telegramPhone,
          clinicId: session.clinicId,
          role,
          name: name || null,
          doctorId: role === 'DOCTOR' ? doctorId : null
        }
      });

    let telegramChatIdToUse = null;

    // If assigning doctor, update the Doctor model with telegramChatId
    if (role === 'DOCTOR' && doctorId) {
      const patient = await prisma.patient.findUnique({ where: { telegramPhone } });
      if (patient && patient.telegramChatId) {
        telegramChatIdToUse = patient.telegramChatId;
        await prisma.doctor.update({
          where: { id: doctorId },
          data: { 
            telegramChatId: patient.telegramChatId,
            telegramUsername: patient.telegramUsername
          }
        });
      }
    }

    // Notify user via Telegram DM if they have verified/registered
    try {
      const patient = await prisma.patient.findUnique({
        where: { telegramPhone }
      });
      if (patient && patient.telegramChatId) {
        const bot = getBot();
        const roleNames: Record<string, string> = {
          ADMIN: 'Administrator 🛡️',
          RECEPTION: 'Qabulxona xodimi (Receptionist) 📋',
          DOCTOR: 'Shifokor (Doctor) 👨‍⚕️',
          INVENTORY: 'Ta\'minotchi (Inventory) 📦'
        };
        const text = `🎉 *Tabriklaymiz!*\n\nSizga tizimda yangi lavozim berildi:\n\n👤 Rol: *${roleNames[role] || role}*\n\nEndi siz o'z telefon raqamingiz bilan xodimlar sahifasiga kirishingiz mumkin!`;
        await bot.sendMessage(patient.telegramChatId, text, { parse_mode: 'Markdown' });
      }
    } catch (tgErr) {
      console.error('Failed to send role update telegram message:', tgErr);
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

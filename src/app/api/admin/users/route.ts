import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

import { getBot } from '@/lib/telegram';

async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(authHeader.split(' ')[1]);
  return (payload?.role === 'ADMIN' || payload?.role === 'SUPER_ADMIN') ? payload : null;
}

// GET /api/admin/users
export async function GET(request: NextRequest) {
  if (!await requireAdmin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
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
  if (!await requireAdmin(request)) {
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

    // Upsert user role instead of failing on duplicate phone
    const user = await prisma.user.upsert({
      where: { telegramPhone },
      update: {
        role,
        name: name || null,
        doctorId: role === 'DOCTOR' ? doctorId : null
      },
      create: {
        telegramPhone,
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

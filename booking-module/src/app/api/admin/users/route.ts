import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

import { getBot } from '@/lib/telegram';

async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(authHeader.split(' ')[1]);
  return payload?.role === 'ADMIN' ? payload : null;
}

// GET /api/admin/users
export async function GET(request: NextRequest) {
  if (!await requireAdmin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ success: true, users });
}

// POST /api/admin/users
export async function POST(request: NextRequest) {
  if (!await requireAdmin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { telegramPhone, role, doctorId } = body;

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
        doctorId: role === 'DOCTOR' ? doctorId : null
      },
      create: {
        telegramPhone,
        role,
        doctorId: role === 'DOCTOR' ? doctorId : null
      }
    });

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
          DOCTOR: 'Shifokor (Doctor) 👨‍⚕️'
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

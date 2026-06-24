import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const groupChatId = process.env.TELEGRAM_GROUP_CHAT_ID;
  if (!groupChatId) return NextResponse.json({ error: 'env var not set' }, { status: 400 });

  await prisma.clinic.update({
    where: { id: 'a826d7e9-84fc-403b-b090-8db7e61bec89' },
    data: { telegramGroupChatId: groupChatId }
  });

  return NextResponse.json({ success: true });
}

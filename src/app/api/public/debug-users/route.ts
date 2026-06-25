import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const users = await prisma.user.updateMany({
    where: { role: 'SUPER_ADMIN' },
    data: { role: 'ADMIN' }
  });
  return NextResponse.json({ message: 'Role changed to ADMIN', users });
}

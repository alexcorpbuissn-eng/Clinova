import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ONE-TIME ENDPOINT — DELETE THIS FILE AFTER RUNNING
// Creates the platform SUPER_ADMIN user
export async function POST(request: NextRequest) {
  // Guard: only run if no SUPER_ADMIN exists yet
  const existing = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (existing) {
    return NextResponse.json({ error: 'SUPER_ADMIN already exists' }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      telegramPhone: '+998998571527',
      password: 'yamada554551',
      role: 'SUPER_ADMIN',
      clinicId: null,
    }
  });

  return NextResponse.json({
    success: true,
    userId: user.id,
    note: 'DELETE src/app/api/superadmin/seed-superadmin/ now'
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// TEMPORARY: One-time setup endpoint to ensure superadmin exists in this DB
// DELETE THIS FILE AFTER USE
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== 'clinova-setup-2025') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Check if user exists
    let user = await prisma.user.findFirst({
      where: { telegramPhone: '+998998571527' }
    });

    if (!user) {
      // Ensure clinic exists first
      await prisma.clinic.upsert({
        where: { id: 'habibullo-hilola' },
        update: {},
        create: {
          id: 'habibullo-hilola',
          name: 'Habibullo-Hilola',
          slug: 'habibullo-hilola',
        }
      });

      // Create the user
      user = await prisma.user.create({
        data: {
          telegramPhone: '+998998571527',
          role: 'SUPER_ADMIN',
          password: '12345678',
          clinicId: 'habibullo-hilola',
        }
      });
      return NextResponse.json({ created: true, user });
    } else {
      // Update role and password
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'SUPER_ADMIN', password: '12345678' }
      });
      return NextResponse.json({ updated: true, user });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Runs daily — deactivates clinics 7 days past planExpiresAt
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const graceCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const result = await prisma.clinic.updateMany({
    where: {
      isActive: true,
      planExpiresAt: { lt: graceCutoff }
    },
    data: { isActive: false }
  });

  console.log(`[cron/check-plan-expiry] Deactivated ${result.count} expired clinics`);
  return NextResponse.json({ success: true, deactivated: result.count });
}

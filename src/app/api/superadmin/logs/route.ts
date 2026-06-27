import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  // Require SUPER_ADMIN token
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (payload.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const clinicId = searchParams.get('clinicId') || undefined;
  const level = searchParams.get('level') || undefined;
  const limit = parseInt(searchParams.get('limit') || '100');

  try {
    const where: any = {};
    if (level) where.level = level;
    // clinicId filter: look inside the `details` JSON string for the clinic
    if (clinicId) where.details = { contains: clinicId };

    const logs = await prisma.systemLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('Failed to fetch system logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

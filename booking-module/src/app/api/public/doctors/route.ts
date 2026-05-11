import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        specialty: true,
        bio: true,
        photoUrl: true,
      },
    });
    
    return NextResponse.json({ success: true, doctors });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

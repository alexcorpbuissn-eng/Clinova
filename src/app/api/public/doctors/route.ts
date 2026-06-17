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
        leaves: {
          where: {
            endTime: { gt: new Date() }
          }
        }
      },
    });
    
    const enrichedDoctors = doctors.map(doc => {
      const now = new Date();
      // Check if any leave spans over the current time
      const currentlyOnLeave = doc.leaves.some(l => now >= l.startTime && now <= l.endTime);
      return {
        ...doc,
        isOnLeave: currentlyOnLeave
      };
    });

    return NextResponse.json({ success: true, doctors: enrichedDoctors });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

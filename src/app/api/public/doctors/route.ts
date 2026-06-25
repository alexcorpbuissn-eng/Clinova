import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('clinic');

  if (!slug) {
    return NextResponse.json(
      { success: false, error: 'Missing clinic parameter. Use ?clinic=your-clinic-slug' },
      { status: 400 }
    );
  }

  try {
    const clinic = await prisma.clinic.findUnique({
      where: { slug },
      select: { id: true, name: true, logoUrl: true, isActive: true },
    });

    if (!clinic || !clinic.isActive) {
      return NextResponse.json(
        { success: false, error: 'Clinic not found' },
        { status: 404 }
      );
    }

    const doctors = await prisma.doctor.findMany({
      where: { clinicId: clinic.id, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        specialty: true,
        bio: true,
        photoUrl: true,
        leaves: {
          where: { endTime: { gt: new Date() } }
        }
      },
    });

    const enrichedDoctors = doctors.map(doc => {
      const now = new Date();
      const currentlyOnLeave = doc.leaves.some(l => now >= l.startTime && now <= l.endTime);
      return { ...doc, isOnLeave: currentlyOnLeave };
    });

    return NextResponse.json({
      success: true,
      clinic: { name: clinic.name, logoUrl: clinic.logoUrl },
      doctors: enrichedDoctors,
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}


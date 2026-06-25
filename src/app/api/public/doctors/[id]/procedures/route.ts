import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const slug = req.nextUrl.searchParams.get('clinic');

  if (!slug) {
    return NextResponse.json({ success: false, error: 'Missing clinic parameter' }, { status: 400 });
  }

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: { clinic: { select: { slug: true } } }
    });

    if (!doctor) {
      return NextResponse.json({ success: true, procedures: [] });
    }

    // Security: ensure this doctor belongs to the requested clinic
    if (doctor.clinic.slug !== slug) {
      return NextResponse.json({ success: false, error: 'Doctor not found in this clinic' }, { status: 403 });
    }

    let procedures;
    const isDentist = doctor.specialty.toLowerCase().includes('stom') || doctor.specialty.toLowerCase().includes('dent');

    if (isDentist) {
      // Shared Dentist Procedures: pooled across all dentists in the same clinic
      procedures = await prisma.procedure.findMany({
        where: {
          clinicId: doctor.clinicId,
          doctor: {
            OR: [
              { specialty: { contains: 'Stomatolog', mode: 'insensitive' } },
              { specialty: { contains: 'Dentist', mode: 'insensitive' } }
            ]
          },
          isActive: true
        },
        select: { id: true, name: true, durationMinutes: true, price: true },
        orderBy: { name: 'asc' },
      });
    } else {
      // Normal specialty procedures
      procedures = await prisma.procedure.findMany({
        where: { doctorId: id, isActive: true },
        select: { id: true, name: true, durationMinutes: true, price: true },
        orderBy: { name: 'asc' },
      });
    }

    // De-duplicate procedures by name
    const seenNames = new Set();
    const uniqueProcedures = [];
    for (const p of procedures) {
      if (!seenNames.has(p.name.trim().toLowerCase())) {
        seenNames.add(p.name.trim().toLowerCase());
        uniqueProcedures.push(p);
      }
    }

    return NextResponse.json({ success: true, procedures: uniqueProcedures });
  } catch (error) {
    console.error('Error fetching doctor procedures:', error);
    return NextResponse.json({ error: 'Failed to fetch procedures' }, { status: 500 });
  }
}


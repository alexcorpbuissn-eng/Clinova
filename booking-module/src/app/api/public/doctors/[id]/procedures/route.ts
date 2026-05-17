import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id }
    });

    if (!doctor) {
      return NextResponse.json({ success: true, procedures: [] });
    }

    let procedures;
    const isDentist = doctor.specialty.toLowerCase().includes('stom') || doctor.specialty.toLowerCase().includes('dent');

    if (isDentist) {
      // Shared Dentist Procedures: Dentist clinic-wide procedures are pooled together
      procedures = await prisma.procedure.findMany({
        where: {
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

    // De-duplicate procedures by name to keep them clean for sharing
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

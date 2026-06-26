import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const clinics = await prisma.clinic.findMany();
  const doctors = await prisma.doctor.findMany();
  return NextResponse.json({ clinics, doctors });
}

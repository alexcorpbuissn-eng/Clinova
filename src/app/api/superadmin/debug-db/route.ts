import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[];');
    return NextResponse.json({ success: true, message: 'Column added successfully' });
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      return NextResponse.json({ success: true, message: 'Column already exists' });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

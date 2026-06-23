import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { requireClinicAccess } from '@/lib/clinic-guard';

async function requireInventoryOrAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(authHeader.split(' ')[1]);
  if (payload?.role === 'ADMIN' || payload?.role === 'INVENTORY') {
    return payload;
  }
  return null;
}

// GET /api/inventory/purchases
export async function GET(request: NextRequest) {
  const user = await requireInventoryOrAdmin(request);
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const purchases = await prisma.purchase.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, purchases });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

// POST /api/inventory/purchases
export async function POST(request: NextRequest) {
  const session = await requireClinicAccess(request);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'INVENTORY')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { itemName, price, sellerName } = body;

    if (!itemName || !price || !sellerName) {
      return NextResponse.json({ error: 'Barcha maydonlarni to\'ldirish majburiy' }, { status: 400 });
    }

    const purchase = await prisma.purchase.create({
      data: {
        itemName,
        price: Number(price),
        sellerName,
        recordedBy: null,
        clinicId: session.clinicId as string,
      }
    });

    return NextResponse.json({ success: true, purchase });
  } catch (error) {
    console.error('Error creating purchase:', error);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

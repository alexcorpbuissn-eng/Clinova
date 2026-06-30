import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClinicAccess } from '@/lib/clinic-guard';

async function requireAdmin(request: NextRequest) {
  const session = await requireClinicAccess(request);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') || !session.clinicId) return null;
  return session;
}

// DELETE /api/admin/users/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    
    // Prevent deleting the last admin
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
    }
    if (user.role === 'SUPER_ADMIN' || user.clinicId !== session.clinicId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN', clinicId: session.clinicId } });
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Yagona adminni o\'chirish mumkin emas' }, { status: 400 });
      }
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
// PATCH /api/admin/users/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { role, doctorId } = await request.json();

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
    }
    if (user.role === 'SUPER_ADMIN' || user.clinicId !== session.clinicId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (doctorId) {
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        select: { clinicId: true }
      });
      if (!doctor || doctor.clinicId !== session.clinicId) {
        return NextResponse.json({ error: 'Shifokor topilmadi' }, { status: 404 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role: role || user.role,
        doctorId: doctorId !== undefined ? doctorId : user.doctorId
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}

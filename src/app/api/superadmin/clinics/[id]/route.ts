import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClinicAccess } from '@/lib/clinic-guard';
import { logSystemEvent } from '@/lib/logger';

// PATCH /api/superadmin/clinics/[id] — update plan or isActive
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireClinicAccess(request);
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { isActive, plan, planExpiresAt, name, address, phone } = body;

  const updateData: Record<string, unknown> = {};
  if (isActive !== undefined) updateData.isActive = isActive;
  if (plan !== undefined) updateData.plan = plan;
  if (planExpiresAt !== undefined) updateData.planExpiresAt = planExpiresAt ? new Date(planExpiresAt) : null;
  if (name !== undefined) updateData.name = name;
  if (address !== undefined) updateData.address = address;
  if (phone !== undefined) updateData.phone = phone;

  try {
    const clinic = await prisma.clinic.update({
      where: { id },
      data: updateData,
    });

    await logSystemEvent('INFO', 'BACKEND', `Klinika ma'lumotlari yangilandi: ${clinic.name}`, { clinicId: id, updateData });

    return NextResponse.json({ success: true, clinic });
  } catch (error) {
    console.error('Error updating clinic:', error);
    return NextResponse.json({ error: 'Failed to update clinic' }, { status: 500 });
  }
}

// DELETE /api/superadmin/clinics/[id] — deactivate (soft delete via isActive=false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireClinicAccess(request);
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    // Soft delete — just deactivate
    const clinic = await prisma.clinic.update({
      where: { id },
      data: { isActive: false }
    });

    await logSystemEvent('WARN', 'BACKEND', `Klinika faoliyati to'xtatildi: ${clinic.name}`, { clinicId: id });

    return NextResponse.json({ success: true, clinic });
  } catch (error) {
    console.error('Error deactivating clinic:', error);
    return NextResponse.json({ error: 'Failed to deactivate clinic' }, { status: 500 });
  }
}

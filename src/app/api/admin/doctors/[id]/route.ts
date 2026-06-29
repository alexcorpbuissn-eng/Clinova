import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { generateSlotsForDoctor } from '@/lib/slot-generator';
import { requireClinicAccess } from '@/lib/clinic-guard';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await requireClinicAccess(request);
  if (!session || session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const doctorToUpdate = await prisma.doctor.findUnique({ where: { id } });
  if (!doctorToUpdate) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
  if (doctorToUpdate.clinicId !== session.clinicId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const data = await request.json();
    const allowedFields = ['firstName', 'lastName', 'specialty', 'bio', 'photoUrl', 'isActive', 'telegramUsername', 'workStartTime', 'workEndTime', 'breakStartTime', 'breakEndTime', 'workingDays'];
    const updateData: Record<string, any> = {};
    for (const key of allowedFields) {
      if (key in data) updateData[key] = data[key];
    }

    if (updateData.telegramUsername) {
      updateData.telegramUsername = updateData.telegramUsername.replace('@', '').trim();
      const patient = await prisma.patient.findFirst({
        where: {
          telegramUsername: {
            equals: updateData.telegramUsername,
            mode: 'insensitive'
          }
        }
      });
      if (patient && patient.telegramChatId) {
        updateData.telegramChatId = patient.telegramChatId;
      }
    }

    const doctor = await prisma.doctor.update({ where: { id }, data: updateData });
    
    // Auto-generate slots based on new schedule
    if (updateData.workStartTime || updateData.workEndTime || updateData.breakStartTime || updateData.breakEndTime || updateData.workingDays || updateData.isActive) {
      await generateSlotsForDoctor(doctor.id, doctor.clinicId);
    }

    return NextResponse.json({ success: true, doctor, chatFound: !!updateData.telegramChatId });
  } catch (error: any) {
    console.error('Doctor PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await requireClinicAccess(request);
  if (!session || session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const doctorToDelete = await prisma.doctor.findUnique({ where: { id } });
  if (!doctorToDelete || doctorToDelete.clinicId !== session.clinicId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Delete all slots, procedures, and leaves first since they are strictly tied to the doctor
    await prisma.slot.deleteMany({ where: { doctorId: id } });
    await prisma.procedure.deleteMany({ where: { doctorId: id } });
    await prisma.leave.deleteMany({ where: { doctorId: id } });
    await prisma.savedDraft.deleteMany({ where: { doctorId: id } });
    await prisma.appointment.deleteMany({ where: { doctorId: id } });

    await prisma.doctor.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Bu shifokorni butunlay o'chirib bo'lmaydi, chunki uning tarixida to'lovlar (tashriflar) mavjud. Iltimos, uni o'chirish o'rniga 'Faolsizlantirish' (qizil tugma) orqali nofaol holatga o'tkazing." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Xatolik yuz berdi: " + error.message }, { status: 500 });
  }
}

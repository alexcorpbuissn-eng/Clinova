import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/resend';

// PATCH /api/doctor/appointments/:id — Mark COMPLETED or CANCELLED
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const doctorId = request.headers.get('x-doctor-id') ?? '';
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { status } = await request.json();
  if (!['COMPLETED', 'CANCELLED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const appointment = await prisma.appointment.findFirst({
    where: { id: params.id, doctorId },
    include: { slot: true, doctor: true },
  });

  if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updates: any = { status, cancelToken: null };
  await prisma.$transaction([
    prisma.appointment.update({ where: { id: params.id }, data: updates }),
    ...(status === 'CANCELLED'
      ? [prisma.slot.update({ where: { id: appointment.slotId }, data: { isAvailable: true } })]
      : []),
  ]);

  // If doctor cancels → email patient
  if (status === 'CANCELLED') {
    const formattedDate = new Date(appointment.slot.startTime).toLocaleDateString('uz-UZ', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    const formattedTime = new Date(appointment.slot.startTime).toLocaleTimeString('uz-UZ', {
      hour: '2-digit', minute: '2-digit',
    });

    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#fff;padding:30px;border-radius:12px;">
        <h2 style="color:#e11d48;">Shifokor qabulni bekor qildi</h2>
        <p>Hurmatli <strong>${appointment.patientFirst}</strong>,</p>
        <p>Dr. <strong>${appointment.doctor.firstName} ${appointment.doctor.lastName}</strong> siz bilan bo'lishi kerak bo'lgan <strong>${formattedDate}, ${formattedTime}</strong> dagi qabulni bekor qildi.</p>
        <p>Yangi vaqtga yozilish uchun: <a href="${process.env.NEXT_PUBLIC_APP_URL}/booking">Qabulga yozilish</a></p>
      </div>
    `;
    await sendEmail({ to: appointment.patientEmail, subject: 'Qabul bekor qilindi | Habibullo-Hilola', html });
  }

  return NextResponse.json({ success: true });
}

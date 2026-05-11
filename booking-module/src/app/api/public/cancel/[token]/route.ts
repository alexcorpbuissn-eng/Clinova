import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/resend';

// GET /api/public/cancel/:token — Validate the token and show appointment info
export async function GET(request: Request, { params }: { params: { token: string } }) {
  const { token } = params;

  const appointment = await prisma.appointment.findUnique({
    where: { cancelToken: token },
    include: { doctor: true, slot: true },
  });

  if (!appointment || appointment.status !== 'SCHEDULED') {
    return NextResponse.json({ success: false, error: 'Invalid or expired cancellation link.' }, { status: 404 });
  }

  // Check if it's within 2 hours of the appointment
  const now = new Date();
  const apptTime = new Date(appointment.slot.startTime);
  const twoHoursBefore = new Date(apptTime.getTime() - 2 * 60 * 60 * 1000);

  if (now >= twoHoursBefore) {
    return NextResponse.json({
      success: false,
      error: 'Qabulni bekor qilish muddati o\'tib ketdi (qabuldan 2 soat oldin).',
    }, { status: 410 });
  }

  return NextResponse.json({
    success: true,
    appointment: {
      id: appointment.id,
      patientFirst: appointment.patientFirst,
      patientLast: appointment.patientLast,
      slotTime: appointment.slot.startTime,
      doctorName: `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
      specialty: appointment.doctor.specialty,
    },
  });
}

// POST /api/public/cancel/:token — Process the actual cancellation
export async function POST(request: Request, { params }: { params: { token: string } }) {
  const { token } = params;

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { cancelToken: token },
      include: { doctor: true, slot: true },
    });

    if (!appointment || appointment.status !== 'SCHEDULED') {
      return NextResponse.json({ success: false, error: 'Invalid or expired cancellation link.' }, { status: 404 });
    }

    const now = new Date();
    const apptTime = new Date(appointment.slot.startTime);
    const twoHoursBefore = new Date(apptTime.getTime() - 2 * 60 * 60 * 1000);

    if (now >= twoHoursBefore) {
      return NextResponse.json({ success: false, error: 'Cancellation window has passed.' }, { status: 410 });
    }

    // Cancel in a transaction: free the slot + update appointment status + invalidate token
    await prisma.$transaction([
      prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'CANCELLED', cancelToken: null },
      }),
      prisma.slot.update({
        where: { id: appointment.slotId },
        data: { isAvailable: true },
      }),
    ]);

    // Notify both patient and doctor
    const formattedDate = new Date(appointment.slot.startTime).toLocaleDateString('uz-UZ', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    const formattedTime = new Date(appointment.slot.startTime).toLocaleTimeString('uz-UZ', {
      hour: '2-digit', minute: '2-digit',
    });

    const cancelHtml = `
      <div style="font-family: sans-serif; max-width:480px; margin:0 auto; background:#fff; padding:30px; border-radius:12px;">
        <h2 style="color:#e11d48;">Qabul Bekor Qilindi</h2>
        <p>Hurmatli <strong>${appointment.patientFirst}</strong>,</p>
        <p>Dr. <strong>${appointment.doctor.firstName} ${appointment.doctor.lastName}</strong> bilan <strong>${formattedDate}, ${formattedTime}</strong> da bo'lgan qabulingiz bekor qilindi.</p>
        <p style="color:#64748b; font-size:14px;">Qayta yozilish uchun havolani bosing: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking">Qabulga yozilish</a></p>
      </div>
    `;

    await sendEmail({ to: appointment.patientEmail, subject: 'Qabul bekor qilindi | Habibullo-Hilola', html: cancelHtml });

    return NextResponse.json({ success: true, message: 'Qabul muvaffaqiyatli bekor qilindi.' });
  } catch (error) {
    console.error('Cancellation error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

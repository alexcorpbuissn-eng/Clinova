import { prisma } from '@/lib/prisma';

export async function generateSlotsForDoctor(doctorId: string, clinicId: string, horizonDays: number = 30) {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { leaves: true }
  });

  if (!doctor || !doctor.isActive) return 0;

  const now = new Date();
  let totalCreated = 0;

  const toCreate = [];
  const existingSlots = await prisma.slot.findMany({
    where: {
      doctorId: doctor.id,
      startTime: {
        gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()), // Start of today locally
        lte: new Date(Date.now() + horizonDays * 86400000)
      }
    },
    select: { startTime: true }
  });
  const existingSet = new Set(existingSlots.map(s => s.startTime.toISOString()));

  const workDaysSet = new Set(doctor.workingDays || [1, 2, 3, 4, 5, 6]);

  // Helper to parse time strings like "09:00" into minutes
  const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  const workStartMin = parseTime(doctor.workStartTime || "09:00");
  const workEndMin = parseTime(doctor.workEndTime || "18:00");
  const breakStartMin = parseTime(doctor.breakStartTime || "13:00");
  const breakEndMin = parseTime(doctor.breakEndTime || "14:00");

  for (let dayOffset = 0; dayOffset <= horizonDays; dayOffset++) {
    const d = new Date(Date.now() + dayOffset * 86400000);
    const tashkentTime = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Tashkent' }));
    
    const year = tashkentTime.getFullYear();
    const month = String(tashkentTime.getMonth() + 1).padStart(2, '0');
    const date = String(tashkentTime.getDate()).padStart(2, '0');
    const dayOfWeek = tashkentTime.getDay(); // 0 is Sunday

    if (!workDaysSet.has(dayOfWeek)) continue; // Skip non-working days

    const dateString = `${year}-${month}-${date}`;

    // Generate 30-min intervals between workStartMin and workEndMin
    for (let currentMin = workStartMin; currentMin < workEndMin; currentMin += 30) {
      // Skip break times
      if (currentMin >= breakStartMin && currentMin < breakEndMin) continue;

      const h = Math.floor(currentMin / 60).toString().padStart(2, '0');
      const m = (currentMin % 60).toString().padStart(2, '0');
      const time = `${h}:${m}`;

      const slotStart = new Date(`${dateString}T${time}:00+05:00`);
      
      if (slotStart <= now) continue;

      let isLeave = false;
      for (const leave of doctor.leaves) {
        if (slotStart >= leave.startTime && slotStart < leave.endTime) {
          isLeave = true;
          break;
        }
      }

      if (isLeave) continue;

      if (!existingSet.has(slotStart.toISOString())) {
        toCreate.push({
          doctorId: doctor.id,
          clinicId,
          startTime: slotStart,
          duration: 30
        });
        existingSet.add(slotStart.toISOString());
      }
    }
  }

  if (toCreate.length > 0) {
    const result = await prisma.slot.createMany({
      data: toCreate,
      skipDuplicates: true
    });
    totalCreated += result.count;
  }

  return totalCreated;
}

import dotenv from 'dotenv';
dotenv.config();

import { prisma } from './src/lib/prisma';

async function main() {
  console.log('Clearing existing data...');
  await prisma.appointment.deleteMany(); 
  await prisma.procedure.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating Admin User...');
  await prisma.user.create({
    data: {
      telegramPhone: '+998998571527',
      role: 'ADMIN'
    }
  });

  console.log('Creating Doctors...');
  const lor1 = await prisma.doctor.create({ data: { firstName: 'M.T.', lastName: 'Urazov', specialty: 'LOR' } });
  const lor2 = await prisma.doctor.create({ data: { firstName: 'X.A.', lastName: 'Yusupov', specialty: 'LOR' } });
  
  const dent1 = await prisma.doctor.create({ data: { firstName: 'Stomatolog', lastName: '1', specialty: 'Stomatolog' } });
  const dent2 = await prisma.doctor.create({ data: { firstName: 'Stomatolog', lastName: '2', specialty: 'Stomatolog' } });
  const dent3 = await prisma.doctor.create({ data: { firstName: 'Stomatolog', lastName: '3', specialty: 'Stomatolog' } });

  const lors = [lor1, lor2];
  const dents = [dent1, dent2, dent3];

  const lorProcedures = [
    { name: 'Консультация (50 000)', durationMinutes: 15 },
    { name: 'Промывание горла (40 000)', durationMinutes: 20 },
    { name: 'Промывание носа (40 000)', durationMinutes: 20 },
    { name: 'Промывание медикаментами горла+носа (60 000)', durationMinutes: 30 },
    { name: 'Ингаляция (30 000)', durationMinutes: 15 },
    { name: 'Лимфатроп (60 000)', durationMinutes: 20 },
    { name: 'Видеоэндоскоп (50 000)', durationMinutes: 30 },
    { name: 'Извлечение инородного тела из уха, горла, носа (60 000)', durationMinutes: 30 },
    { name: 'Абсцесс паротонзилярный (250 000)', durationMinutes: 45 },
    { name: 'Прокол с катетеризацией гайморовой пазухи (300 000)', durationMinutes: 60 }
  ];

  for (const doc of lors) {
    for (const proc of lorProcedures) {
      await prisma.procedure.create({ data: { doctorId: doc.id, name: proc.name, durationMinutes: proc.durationMinutes } });
    }
  }

  const dentProcedures = [
    // Surgical
    { name: 'Хирургия: Консультация (60 000)', durationMinutes: 15 },
    { name: 'Удаление постоянного зуба (300 000)', durationMinutes: 45 },
    { name: 'Удаление зуба мудрости (450 000)', durationMinutes: 60 },
    { name: 'Удаление молочного зуба (165 000)', durationMinutes: 30 },
    { name: 'Постановка импланта "OSSTEM" (3 850 000)', durationMinutes: 90 },
    { name: 'Синус лифтинг (4 400 000)', durationMinutes: 90 },
    // Orthopedic
    { name: 'Ортопедия: Снятие коронки (165 000)', durationMinutes: 30 },
    { name: 'Металлокерамическая коронка (850 000)', durationMinutes: 60 },
    { name: 'Коронка из диоксида циркония (2 000 000)', durationMinutes: 60 },
    { name: 'Виниры (2 800 000)', durationMinutes: 90 },
    { name: 'Бюгельный протез с кламмерами (5 500 000)', durationMinutes: 60 },
    // Therapeutic
    { name: 'Терапия: Цемент (150 000)', durationMinutes: 45 },
    { name: 'Терапия: Комполайт (200 000)', durationMinutes: 45 },
    { name: 'Лечение пульпита 1 канал: Цемент (250 000)', durationMinutes: 60 },
    { name: 'Снятие зубных отложений (400 000)', durationMinutes: 45 },
    { name: 'Отбеливание зоны улыбки (1 500 000)', durationMinutes: 90 }
  ];

  for (const doc of dents) {
    for (const proc of dentProcedures) {
      await prisma.procedure.create({ data: { doctorId: doc.id, name: proc.name, durationMinutes: proc.durationMinutes } });
    }
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

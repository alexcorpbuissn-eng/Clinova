/**
 * SAAS Stage 1 Seed — Non-Destructive
 *
 * Что делает:
 * 1. Создаёт первую клинику "Habibullo-Hilola"
 * 2. Привязывает ВСЕ существующие записи к этой клинике (clinicId)
 * 3. НЕ удаляет никакие данные
 *
 * Запуск (из директории booking-module):
 *   npx tsx prisma/seed-saas-stage1.ts
 *
 * Безопасно запускать повторно — upsert'ы идемпотентны.
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 SAAS Stage 1 Seed — начинаем...\n');

  // ── 1. Создать или найти клинику ─────────────────────────────────────────
  console.log('1️⃣  Создаём клинику "Habibullo-Hilola"...');
  const clinic = await prisma.clinic.upsert({
    where: { slug: 'habibullo-hilola' },
    update: {},
    create: {
      name: 'Habibullo-Hilola',
      slug: 'habibullo-hilola',
      timezone: 'Asia/Tashkent',
      isActive: true,
      plan: 'TRIAL',
    },
  });
  console.log(`   ✅ Клиника ID: ${clinic.id}\n`);

  const cid = clinic.id;

  // ── 2. Привязать врачей ──────────────────────────────────────────────────
  console.log('2️⃣  Привязываем врачей...');
  const doctorsUpdated = await prisma.doctor.updateMany({
    where: { clinicId: null },
    data: { clinicId: cid },
  });
  console.log(`   ✅ Обновлено врачей: ${doctorsUpdated.count}\n`);

  // ── 3. Привязать пользователей (кроме SUPER_ADMIN без клиники) ───────────
  console.log('3️⃣  Привязываем пользователей...');
  const usersUpdated = await prisma.user.updateMany({
    where: { clinicId: null, role: { not: 'SUPER_ADMIN' } },
    data: { clinicId: cid },
  });
  console.log(`   ✅ Обновлено пользователей: ${usersUpdated.count}\n`);

  // ── 4. Привязать процедуры ───────────────────────────────────────────────
  console.log('4️⃣  Привязываем процедуры...');
  const proceduresUpdated = await prisma.procedure.updateMany({
    where: { clinicId: null },
    data: { clinicId: cid },
  });
  console.log(`   ✅ Обновлено процедур: ${proceduresUpdated.count}\n`);

  // ── 5. Привязать слоты ───────────────────────────────────────────────────
  console.log('5️⃣  Привязываем слоты...');
  const slotsUpdated = await prisma.slot.updateMany({
    where: { clinicId: null },
    data: { clinicId: cid },
  });
  console.log(`   ✅ Обновлено слотов: ${slotsUpdated.count}\n`);

  // ── 6. Привязать отпуска врачей ──────────────────────────────────────────
  console.log('6️⃣  Привязываем отпуска врачей...');
  const leavesUpdated = await prisma.leave.updateMany({
    where: { clinicId: null },
    data: { clinicId: cid },
  });
  console.log(`   ✅ Обновлено отпусков: ${leavesUpdated.count}\n`);

  // ── 7. Привязать записи на приём ─────────────────────────────────────────
  console.log('7️⃣  Привязываем записи на приём (appointments)...');
  const appointmentsUpdated = await prisma.appointment.updateMany({
    where: { clinicId: null },
    data: { clinicId: cid },
  });
  console.log(`   ✅ Обновлено записей: ${appointmentsUpdated.count}\n`);

  // ── 8. Привязать визиты ──────────────────────────────────────────────────
  console.log('8️⃣  Привязываем визиты...');
  const visitsUpdated = await prisma.visit.updateMany({
    where: { clinicId: null },
    data: { clinicId: cid },
  });
  console.log(`   ✅ Обновлено визитов: ${visitsUpdated.count}\n`);

  // ── 9. Привязать жалобы ──────────────────────────────────────────────────
  console.log('9️⃣  Привязываем жалобы...');
  const complaintsUpdated = await prisma.complaint.updateMany({
    where: { clinicId: null },
    data: { clinicId: cid },
  });
  console.log(`   ✅ Обновлено жалоб: ${complaintsUpdated.count}\n`);

  // ── 10. Привязать черновики записей ──────────────────────────────────────
  console.log('🔟  Привязываем черновики записей (SavedDraft)...');
  const draftsUpdated = await prisma.savedDraft.updateMany({
    where: { clinicId: null },
    data: { clinicId: cid },
  });
  console.log(`   ✅ Обновлено черновиков: ${draftsUpdated.count}\n`);

  // ── 11. Привязать закупки ────────────────────────────────────────────────
  console.log('1️⃣1️⃣ Привязываем закупки (Purchase)...');
  const purchasesUpdated = await prisma.purchase.updateMany({
    where: { clinicId: null },
    data: { clinicId: cid },
  });
  console.log(`   ✅ Обновлено закупок: ${purchasesUpdated.count}\n`);

  // ── Итог ─────────────────────────────────────────────────────────────────
  console.log('✅ Seed завершён успешно!');
  console.log('─────────────────────────────────────────────────');
  console.log(`   Клиника:       ${clinic.name} (${clinic.slug})`);
  console.log(`   ID клиники:    ${clinic.id}`);
  console.log(`   Врачей:        ${doctorsUpdated.count}`);
  console.log(`   Пользователей: ${usersUpdated.count}`);
  console.log(`   Процедур:      ${proceduresUpdated.count}`);
  console.log(`   Слотов:        ${slotsUpdated.count}`);
  console.log(`   Записей:       ${appointmentsUpdated.count}`);
  console.log(`   Визитов:       ${visitsUpdated.count}`);
  console.log('─────────────────────────────────────────────────');
  console.log('\n👉 Следующий шаг: изменить String? → String в schema.prisma и сделать второй db push.');
}

main()
  .catch((e) => {
    console.error('❌ Seed завершился с ошибкой:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

# 🚀 ПЛАН ТРАНСФОРМАЦИИ В SaaS — ФИНАЛЬНАЯ ВЕРСИЯ v2.0
### Мастер-документ для ИИ-агентов | Обновлено: 2026-06-17

---

## ⚠️ ЧИТАЙ ЭТОТ ФАЙЛ ПЕРВЫМ. НЕ НАЧИНАЙ КОДИТЬ, ПОКА НЕ ПРОЧИТАЛ ДО КОНЦА.

---

## 📌 ЖЕЛЕЗНЫЕ ПРАВИЛА (нарушение = остановить работу и сообщить владельцу)

1. **НИКОГДА не используй `prisma migrate dev`** — только `npx prisma db push`. Это продакшн база на Neon.tech. `migrate dev` создаёт файлы миграций которые сломают деплой на Vercel.
2. **НИКОГДА не редактируй `.html` файлы напрямую** — редактируй только `*_logic_clean.js`, затем запускай `node public/build_*.js`.
3. **После КАЖДОГО изменения `schema.prisma`** — немедленно `npx prisma db push`.
4. **После каждой завершённой задачи** — `git add -A && git commit -m "..." && git push origin main`.
5. **Не меняй `.env`** без явного разрешения владельца.
6. **Тайм-зона везде** — `Asia/Tashkent` (UTC+5).
7. **Перед стартом любой задачи** — прочитай AI_HANDOFF.md и верхние 50 строк AI_CHANGELOG.md.

---

## 🏥 ЧТО СУЩЕСТВУЕТ СЕЙЧАС

Монолитное приложение клиники **Habibullo-Hilola** (стоматология + ЛОР, Ташкент). Один Vercel проект, одна база Neon PostgreSQL, один Telegram-бот.

### Текущий стек (НЕ МЕНЯТЬ без разрешения)
```
Framework:  Next.js (App Router ТОЛЬКО для API)
Database:   PostgreSQL на Neon.tech, ORM: Prisma
Frontend:   Чистый HTML/Vanilla JS в /public/ — НЕТ React в UI
Hosting:    Vercel (один проект на всё)
Auth:       JWT (jose), хранятся в localStorage
Notify:     Telegram Bot API
Timezone:   Asia/Tashkent (UTC+5)
```

### Файловая структура (ключевые файлы)
```
/booking-module
├── prisma/schema.prisma          ← Единственный источник правды для БД
├── src/app/api/                  ← Весь backend (Next.js App Router)
│   ├── admin/                    ← Защищённые эндпоинты (роль ADMIN)
│   ├── doctor/                   ← Защищённые эндпоинты (роль DOCTOR)
│   ├── reception/                ← Защищённые эндпоинты (роль RECEPTION)
│   ├── inventory/                ← Защищённые эндпоинты (роль INVENTORY)
│   ├── public/                   ← Открытые эндпоинты (бронирование)
│   └── cron/                     ← Vercel Cron Jobs
├── src/lib/
│   ├── prisma.ts                 ← Singleton Prisma клиент
│   ├── auth.ts                   ← JWT (verifyToken, signToken)
│   ├── telegram.ts               ← Singleton Telegram бот
│   └── slot-generator.ts         ← Генерация слотов
├── public/
│   ├── build_admin.js            ← ГЕНЕРАТОР: создаёт admin.html
│   ├── build_reception.js        ← ГЕНЕРАТОР: создаёт reception.html
│   ├── build_doctor.js           ← ГЕНЕРАТОР: создаёт doctor.html
│   ├── build_booking.js          ← ГЕНЕРАТОР: создаёт booking.html
│   ├── build_secondary.js        ← ГЕНЕРАТОР: about.html, services.html
│   ├── admin_logic_clean.js      ← ИСХОДНИК логики для admin (редактировать здесь)
│   ├── reception_logic_clean.js  ← ИСХОДНИК логики для reception
│   ├── doctor_logic_clean.js     ← ИСХОДНИК логики для doctor
│   └── booking_logic_clean.js    ← ИСХОДНИК логики для booking
├── AI_HANDOFF.md                 ← Читать первым при старте
├── AI_CHANGELOG.md               ← Журнал изменений (только верхние 50 строк)
└── SAAS_TRANSFORMATION_PLAN.md   ← ЭТОТ ФАЙЛ
```

---

## 💡 СТРАТЕГИЧЕСКАЯ ЦЕЛЬ

Превратить монолит одной клиники в **мультиарендный (Multi-Tenant) SaaS-продукт**, где одна кодовая база и одна база данных обслуживают сотни независимых клиник. Каждая клиника видит **только свои данные**.

### Как выглядит готовый продукт
- **Платформа:** `app.clinova.uz` — единый домен для ВСЕХ клиник (API + панели персонала + бронирование)
- **Бронирование пациента:** `app.clinova.uz/book/habibullo-hilola` — уникальная ссылка для каждой клиники по slug
- **Сайты клиник:** остаются на их собственном хостинге. Кнопка "Записаться" на сайте клиники — редирект на `app.clinova.uz/book/[slug]`. Страница бронирования автоматически подгружает логотип, название и цвета клиники — пациент видит брендированную страницу, а не безликую платформу.
- **SuperAdmin панель:** `app.clinova.uz/superadmin` — управление всеми клиниками (только для владельца платформы)
- **Сайт клиники НЕ переезжает на нашу платформу** — только бронирование. `index.html`, `about.html`, `services.html` остаются как есть для клиники Habibullo-Hilola.

### Деплой-модель (критически важно понимать)
Один `git push` в ветку `main` → Vercel перебилдит проект → **ВСЕ клиники получают обновление одновременно**. Это преимущество (фиксишь баг — все сразу исправлено) и риск (сломанный деплой роняет всех). Поэтому обязательна ветка `staging` — см. Шаг 1.8.

---

## 🔑 КЛЮЧЕВОЙ ПРИНЦИП: Multi-Tenancy

**Каждая запись в БД, кроме `Patient` и `Otp`, жёстко привязана к `clinicId`.**

### Почему `Patient` — глобальный (без `clinicId`)
Пациент — это человек с телефоном, а не "пациент клиники А". Один человек может записаться в несколько клиник. Глобальный пациент означает: один раз верифицировался через Telegram → может записываться в любую клинику на платформе без повторной верификации. Клиники видят только **Appointment** (записи) своих пациентов через `Appointment.clinicId` — изоляция гарантирована без `clinicId` на самом пациенте.

### Правило нулевой утечки данных
> ⛔ **КРИТИЧНО:** Ни один API-запрос не должен возвращать данные без фильтра `where: { clinicId: session.clinicId }`. Нарушение = критическая уязвимость безопасности.
>
> Исключения: публичные эндпоинты бронирования (clinicId берётся из slug URL), SuperAdmin эндпоинты (видят всё намеренно).

---

## 📋 ПЛАН РЕАЛИЗАЦИИ

---

### ═══════════════════════════════════════════
### ЭТАП 1: ФУНДАМЕНТ
### Статус: 🔴 НЕ НАЧАТ
### ═══════════════════════════════════════════

**Цель:** Добавить концепцию "клиника" в БД и авторизацию. Существующие данные сохранить. Текущий функционал не сломать.

---

#### Шаг 1.1 — Переименовать опасный файл

```bash
mv prisma/seed-clinic.ts prisma/seed-clinic.DANGEROUS-DO-NOT-USE.ts
```

Существующий `seed-clinic.ts` УДАЛЯЕТ ВСЕ ДАННЫЕ. Переименовать немедленно чтобы никто случайно не запустил.

---

#### Шаг 1.2 — Добавить модель `Clinic` в `prisma/schema.prisma`

Добавить В САМЫЙ ВЕРХ схемы (перед моделью `Doctor`):

```prisma
model Clinic {
  id                   String     @id @default(uuid())
  name                 String
  slug                 String     @unique
  logoUrl              String?
  address              String?
  phone                String?
  telegramBotToken     String?
  telegramBotUsername  String?
  timezone             String     @default("Asia/Tashkent")
  isActive             Boolean    @default(true)
  plan                 ClinicPlan @default(TRIAL)
  planExpiresAt        DateTime?

  doctors       Doctor[]
  users         User[]
  appointments  Appointment[]
  visits        Visit[]
  purchases     Purchase[]
  procedures    Procedure[]
  leaves        Leave[]
  slots         Slot[]
  complaints    Complaint[]
  savedDrafts   SavedDraft[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum ClinicPlan {
  TRIAL
  BASIC
  PRO
  ENTERPRISE
}
```

В `enum Role` добавить `SUPER_ADMIN` первым:
```prisma
enum Role {
  SUPER_ADMIN
  ADMIN
  DOCTOR
  RECEPTION
  INVENTORY
}
```

---

#### Шаг 1.3 — Добавить `clinicId` ко ВСЕМ нужным моделям

Добавить в каждую из этих моделей: `Doctor`, `User`, `Appointment`, `Visit`, `Purchase`, `Procedure`, `Leave`, `Slot`, `Complaint`, `SavedDraft`.

**НЕ добавлять в:** `Patient`, `Otp` — они глобальные.

Паттерн для каждой модели:
```prisma
clinicId  String?
clinic    Clinic?   @relation(fields: [clinicId], references: [id])

@@index([clinicId])
```

`String?` (nullable) — это временно для безопасной миграции. Станет `String` после seed-скрипта (Шаг 1.5).

---

#### Шаг 1.4 — Применить изменения к БД

```bash
npx prisma db push
```

Проверить: команда завершилась без ошибок. Если есть ошибки — остановиться и сообщить.

---

#### Шаг 1.5 — Создать и запустить `prisma/seed-saas-stage1.ts`

Создать НОВЫЙ файл (не трогать переименованный dangerous файл).

Скрипт должен выполнять следующее:

```typescript
// 1. Проверить, существует ли клиника с slug "habibullo-hilola"
//    Если да — использовать её id, не создавать снова
// 2. Если нет — создать:
//    name: "Habibullo-Hilola", slug: "habibullo-hilola", plan: "BASIC"
// 3. Обновить ВСЕ записи в каждой таблице — проставить clinicId:
//    Doctor, User, Appointment, Visit, Purchase, Procedure, Leave, Slot, Complaint, SavedDraft
//    Использовать updateMany({ where: { clinicId: null }, data: { clinicId: clinic.id } })
// 4. Вывести в консоль количество обновлённых записей по каждой таблице
// 5. НЕ трогать Patient, Otp
```

Запустить:
```bash
npx ts-node prisma/seed-saas-stage1.ts
```

Убедиться что вывод показывает ненулевые числа обновлённых записей. Если какая-то таблица показала 0 — разобраться почему.

---

#### Шаг 1.6 — Сделать `clinicId` обязательным (NOT NULL)

Только после успешного seed-скрипта. Изменить во всех моделях:
```prisma
// БЫЛО:
clinicId  String?
clinic    Clinic?  @relation(...)

// СТАЛО:
clinicId  String
clinic    Clinic   @relation(...)
```

```bash
npx prisma db push
```

Если `db push` выдаёт ошибку о null-значениях — значит seed-скрипт не заполнил все записи. Вернуться к Шагу 1.5.

---

#### Шаг 1.7 — Обновить `src/lib/auth.ts`

```typescript
export interface JWTPayload {
  userId:    string;
  role:      string;
  clinicId?: string;   // undefined только для SUPER_ADMIN
  doctorId?: string;
}
```

Обновить `signToken` — принимает и включает `clinicId`.
Обновить все маршруты логина — при создании токена включать `user.clinicId` из БД.

---

#### Шаг 1.8 — Создать `src/lib/clinic-guard.ts`

```typescript
import { verifyToken } from './auth';
import { NextRequest, NextResponse } from 'next/server';

export async function requireClinicAccess(
  request: NextRequest,
  allowedRoles: string[]
): Promise<{ session: any } | { error: NextResponse }> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };

  const payload = await verifyToken(token);
  if (!payload) return { error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) };

  if (!allowedRoles.includes(payload.role)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  if (payload.role !== 'SUPER_ADMIN' && !payload.clinicId) {
    return { error: NextResponse.json({ error: 'No clinic context' }, { status: 403 }) };
  }

  return { session: payload };
}
```

Этот файл пока не применяется к существующим маршрутам — это делается в Этапе 2.

---

#### Шаг 1.9 — Создать ветку `staging`

```bash
git checkout -b staging
git push origin staging
```

Подключить ветку `staging` к отдельному Vercel проекту с отдельной Neon БД (для тестов). Сообщить владельцу — это делает он в Vercel Dashboard, не агент.

---

#### ✅ Чеклист завершения Этапа 1

- [ ] `seed-clinic.ts` переименован в `.DANGEROUS-DO-NOT-USE.ts`
- [ ] Модель `Clinic` и enum `ClinicPlan` добавлены в схему
- [ ] `SUPER_ADMIN` добавлен в enum `Role`
- [ ] `clinicId` добавлен во все нужные модели (10 штук: Doctor, User, Appointment, Visit, Purchase, Procedure, Leave, Slot, Complaint, SavedDraft)
- [ ] `npx prisma db push` выполнен после Шага 1.3
- [ ] `seed-saas-stage1.ts` создан и выполнен успешно
- [ ] `clinicId` переведён в NOT NULL и `db push` повторён
- [ ] `src/lib/auth.ts` обновлён (clinicId в JWT)
- [ ] `src/lib/clinic-guard.ts` создан
- [ ] Ветка `staging` создана
- [ ] Существующий функционал работает (войти в admin, reception, doctor — проверить)
- [ ] Запись в AI_CHANGELOG.md добавлена

---

### ═══════════════════════════════════════════
### ЭТАП 2: ИЗОЛЯЦИЯ API
### Статус: 🔴 НЕ НАЧАТ (зависит от Этапа 1)
### ═══════════════════════════════════════════

**Цель:** Обновить все API-маршруты — каждый запрос фильтрует данные по `clinicId`.

#### Паттерн обновления (применять к каждому маршруту)

```typescript
// ДО:
export async function GET(request: NextRequest) {
  if (!await requireAdmin(request)) return NextResponse.json({}, { status: 403 });
  const doctors = await prisma.doctor.findMany();
}

// ПОСЛЕ:
export async function GET(request: NextRequest) {
  const { session, error } = await requireClinicAccess(request, ['ADMIN']);
  if (error) return error;

  const doctors = await prisma.doctor.findMany({
    where: { clinicId: session.clinicId }  // ← ОБЯЗАТЕЛЬНО в каждом запросе
  });
}
```

#### Полный список файлов для обновления

```
src/app/api/admin/doctors/route.ts
src/app/api/admin/doctors/[id]/route.ts
src/app/api/admin/appointments/route.ts
src/app/api/admin/appointments/[id]/route.ts
src/app/api/admin/patients/route.ts
src/app/api/admin/procedures/route.ts
src/app/api/admin/procedures/[id]/route.ts
src/app/api/admin/visits/route.ts
src/app/api/admin/visits/[id]/route.ts
src/app/api/admin/purchases/route.ts
src/app/api/admin/purchases/[id]/route.ts
src/app/api/admin/slots/route.ts
src/app/api/admin/stats/route.ts
src/app/api/admin/leaves/route.ts
src/app/api/admin/leaves/[id]/route.ts
src/app/api/admin/users/route.ts
src/app/api/admin/users/[id]/route.ts
src/app/api/admin/uploads/route.ts
src/app/api/doctor/[...все маршруты]
src/app/api/reception/[...все маршруты]
src/app/api/inventory/[...все маршруты]
src/lib/slot-generator.ts           ← принимать clinicId и добавлять в создаваемые слоты
```

#### Публичные эндпоинты (особый случай — без авторизации)

```typescript
// clinicId берётся из slug параметра URL, не из JWT
const clinic = await prisma.clinic.findUnique({ where: { slug: params.clinic } });
if (!clinic || !clinic.isActive) return NextResponse.json({ error: 'Not found' }, { status: 404 });

const doctors = await prisma.doctor.findMany({
  where: { clinicId: clinic.id, isActive: true }
});
```

Новый маршрут добавить:
```
GET /api/public/clinic/[slug]   ← информация о клинике (имя, логотип, телефон, адрес)
```

#### ✅ Чеклист завершения Этапа 2

- [ ] Все маршруты в `src/app/api/admin/` обновлены
- [ ] Все маршруты в `src/app/api/doctor/` обновлены
- [ ] Все маршруты в `src/app/api/reception/` обновлены
- [ ] Все маршруты в `src/app/api/inventory/` обновлены
- [ ] `slot-generator.ts` принимает clinicId
- [ ] `/api/public/clinic/[slug]` создан
- [ ] Тест изоляции: войти как Admin клиники А — видны ТОЛЬКО её данные
- [ ] Запись в AI_CHANGELOG.md добавлена

---

### ═══════════════════════════════════════════
### ЭТАП 3: БЕЛЫЙ ЛЕЙБЛ ДЛЯ БРОНИРОВАНИЯ
### Статус: 🔴 НЕ НАЧАТ (зависит от Этапа 2)
### ═══════════════════════════════════════════

**Цель:** Страница бронирования для каждой клиники выглядит как "их" страница.

#### Как это работает
1. Пациент кликает "Записаться" на сайте клиники → редирект на `app.clinova.uz/book/habibullo-hilola`
2. Страница делает `GET /api/public/clinic/habibullo-hilola` → получает имя, логотип, контакты
3. Рендерит страницу с брендингом клиники (логотип в шапке, название)
4. Все запросы врачей/слотов добавляют `?clinic=habibullo-hilola`
5. При создании записи — `clinicId` берётся из данных клиники, не из URL

#### Изменения в `public/booking_logic_clean.js`
- Считывать `slug` из URL пути: `window.location.pathname.split('/book/')[1]`
- Первым запросом загружать данные клиники и применять логотип/заголовок
- Все запросы к API добавлять `?clinic=[slug]`
- После редактирования: `node public/build_booking.js`

---

### ═══════════════════════════════════════════
### ЭТАП 4: SUPERADMIN ПАНЕЛЬ
### Статус: 🔴 НЕ НАЧАТ (зависит от Этапа 2)
### ═══════════════════════════════════════════

#### Новые API маршруты
```
src/app/api/superadmin/clinics/route.ts         ← GET список, POST создать клинику
src/app/api/superadmin/clinics/[id]/route.ts    ← PATCH (план, isActive), DELETE
src/app/api/superadmin/stats/route.ts           ← Общая статистика по всем клиникам
```

Все superadmin маршруты: проверяют `role === 'SUPER_ADMIN'` и НЕ фильтруют по `clinicId`.

#### POST /api/superadmin/clinics — автоматически
1. Создать запись `Clinic`
2. Создать первого `User` с `role=ADMIN`, привязать к этой клинике, задать временный пароль
3. Вернуть временный пароль в ответе (единственный раз)

#### Frontend
- `public/build_superadmin.js` → генерирует `public/superadmin.html`
- Функции: список клиник, создание клиники, статистика, управление тарифами

---

### ═══════════════════════════════════════════
### ЭТАП 5: TELEGRAM — МУЛЬТИКЛИНИКА
### Статус: 🔴 НЕ НАЧАТ (зависит от Этапа 4)
### ═══════════════════════════════════════════

**Выбор: единый бот платформы (для старта)**

Один бот обслуживает все клиники. В каждом сообщении пациенту указывается название клиники: «Ваша запись в *Habibullo-Hilola* подтверждена».

Индивидуальные боты для клиник — только по запросу клиента на PRO/ENTERPRISE плане. Поле `Clinic.telegramBotToken` уже в схеме. Реализация: `telegram.ts` переписать на `Map<clinicId, TelegramBot>`.

---

## 🗃️ ФИНАЛЬНАЯ СХЕМА ДАННЫХ

```
Clinic (1)
  ├── Users (N)         role: ADMIN | DOCTOR | RECEPTION | INVENTORY
  ├── Doctors (N)
  │     ├── Procedures (N)
  │     ├── Slots (N)
  │     ├── Leaves (N)
  │     └── SavedDrafts (N)
  ├── Appointments (N)
  ├── Visits (N)
  ├── Purchases (N)
  └── Complaints (N)

Patient (глобальный, БЕЗ clinicId)
  └── Appointments (N)  ← изоляция через Appointment.clinicId

SuperAdmin (role=SUPER_ADMIN, clinicId=null)
  └── видит ВСЕ без фильтрации

Otp (глобальный, БЕЗ clinicId)
```

---

## 🧪 ТЕСТЫ ПЕРЕД КАЖДЫМ ДЕПЛОЕМ В MAIN

1. Войти как Admin Клиники А → врачи/записи Клиники Б НЕ видны
2. Войти как Admin Клиники Б → врачи/записи Клиники А НЕ видны
3. Открыть `/book/habibullo-hilola` → видны только врачи этой клиники
4. Создать тестовую запись → `clinicId` корректен в БД
5. Войти как SUPER_ADMIN → видны все клиники
6. Все панели Habibullo-Hilola работают как раньше
7. Telegram-уведомление → правильное название клиники в тексте

---

## 📊 ПРИОРИТЕТЫ

| # | Этап | Описание | Оценка |
|---|------|----------|--------|
| 🔴 P0 | 1.1–1.4 | Clinic модель + clinicId nullable + db push | ~1 ч |
| 🔴 P0 | 1.5–1.6 | Seed скрипт + NOT NULL + db push | ~1 ч |
| 🔴 P0 | 1.7–1.9 | JWT + clinic-guard + staging ветка | ~1 ч |
| 🟠 P1 | 2 | Изоляция всех API маршрутов | ~5 ч |
| 🟠 P1 | 3 | Белый лейбл бронирования | ~2 ч |
| 🟡 P2 | 4 | SuperAdmin панель | ~4 ч |
| 🟡 P2 | 5 | Telegram мультиклиника | ~2 ч |

---

## ⚠️ КРИТИЧЕСКИЕ РИСКИ И РЕШЕНИЯ

**Риск: потеря данных при миграции**
Решение: Шаги 1.3 → 1.5 → 1.6 строго по порядку. `clinicId` nullable → seed → NOT NULL. Никогда не пропускать seed перед переходом к NOT NULL.

**Риск: один баг роняет все клиники**
Решение: обязательная ветка `staging` (Шаг 1.9). Все изменения тестируются там перед `main`.

**Риск: утечка данных между клиниками**
Решение: после Этапа 2 вручную пройти по каждому API, убедиться в наличии `clinicId` фильтра. Запустить тесты из раздела выше (пункты 1–4).

**Риск: случайный запуск опасного seed**
Решение: Шаг 1.1 — немедленное переименование файла.

---

## 📝 КАК ОБНОВЛЯТЬ ЭТОТ ДОКУМЕНТ

При завершении каждого этапа:
1. Изменить статус на `✅ ВЫПОЛНЕНО — [дата]`
2. Добавить список созданных/изменённых файлов
3. Отметить любые отклонения от плана

---

*Версия 2.0 | Переработано: 2026-06-17*
*Версия 1.0 создана: 2026-06-15 (Antigravity, Google DeepMind)*

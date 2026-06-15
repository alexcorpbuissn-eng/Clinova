# 🚀 ПЛАН ТРАНСФОРМАЦИИ В SaaS-ПРОДУКТ
### Мастер-документ для ИИ-агентов | Версия 1.0 | Дата: 2026-06-15

---

## 📌 ОБЯЗАТЕЛЬНО ПРОЧИТАТЬ ПЕРВЫМ

Этот файл — **главный стратегический документ** проекта. Если ты — ИИ-агент, работающий с этим репозиторием, этот файл объясняет не только *что* нужно сделать, но и *почему* и *как именно* это должно быть реализовано. Не начинай кодить, не прочитав его целиком.

---

## 🏥 КОНТЕКСТ: ЧТО СУЩЕСТВУЕТ СЕЙЧАС

### Текущее приложение: Клиника «Habibullo-Hilola»
Это **монолитное веб-приложение** — полноценная система управления медицинской клиникой (стоматология и ЛОР отделения в Ташкенте, Узбекистан). Оно включает:

- **Публичный сайт клиники** (`/public/index.html`, `about.html`, `services.html`) — маркетинговые страницы
- **Система онлайн-бронирования** (`/public/booking.html`) — пациенты записываются к врачам
- **Верификация через Telegram** — OTP-код приходит от Telegram-бота
- **Панель администратора** (`/public/admin.html`) — управление врачами, расписанием, финансами
- **Портал врача** (`/public/doctor.html`) — врач видит своё расписание и записи
- **Стойка регистратуры** (`/public/reception.html`) — оператор управляет визитами пациентов в реальном времени
- **Склад/Инвентаризация** (`/public/inventory.html`) — учет закупок и расходов клиники

### Технологический стек (НЕИЗМЕНЕН, не меняй без разрешения владельца!)
```
Framework:     Next.js 15 (App Router ТОЛЬКО для API!)
Database:      PostgreSQL на Neon.tech, ORM: Prisma
Frontend:      Чистый HTML/Vanilla JS/CSS в папке /public/
               НЕТ React компонентов в UI! 
Hosting:       Vercel (для API и статики)
Notifications: Telegram Bot API (node-telegram-bot-api)
Timezone:      Asia/Tashkent (UTC+5)
Auth:          JWT токены, хранятся в localStorage
```

### Файловая архитектура
```
/booking-module
├── prisma/schema.prisma         ← Схема БД (ЕДИНСТВЕННЫЙ источник правды для структуры данных)
├── src/
│   ├── app/api/                 ← ВСЕ Backend API (Next.js App Router)
│   │   ├── admin/               ← Защищенные эндпоинты для роли ADMIN
│   │   │   ├── appointments/    ← CRUD для приемов
│   │   │   ├── doctors/         ← CRUD для врачей
│   │   │   ├── leaves/          ← Управление отгулами врачей
│   │   │   ├── patients/        ← Управление пациентами
│   │   │   ├── procedures/      ← Управление процедурами
│   │   │   ├── purchases/       ← Учет закупок
│   │   │   ├── slots/           ← Управление слотами расписания
│   │   │   ├── stats/           ← Статистика и доходы по врачам
│   │   │   ├── uploads/         ← Загрузка фото врачей
│   │   │   ├── users/           ← Управление пользователями (роли)
│   │   │   └── visits/          ← Журнал визитов
│   │   ├── cron/                ← Задания по расписанию (Vercel Cron)
│   │   │   └── generate-slots/  ← Автогенерация слотов на 30 дней вперед
│   │   ├── doctor/              ← Защищенные эндпоинты для роли DOCTOR
│   │   ├── inventory/           ← Защищенные эндпоинты для роли INVENTORY
│   │   ├── public/              ← Открытые эндпоинты (для booking.html без авторизации)
│   │   ├── reception/           ← Защищенные эндпоинты для роли RECEPTION
│   │   └── telegram/            ← Webhook для Telegram бота
│   └── lib/
│       ├── prisma.ts            ← Singleton клиент Prisma
│       ├── auth.ts              ← JWT верификация (verifyToken, signToken)
│       ├── telegram.ts          ← Singleton экземпляр Telegram бота
│       └── slot-generator.ts   ← Утилита генерации слотов для врача
├── public/                      ← Весь Frontend (HTML/JS/CSS)
│   ├── build_admin.js           ← СКРИПТ: генерирует admin.html из admin_logic_clean.js
│   ├── build_reception.js       ← СКРИПТ: генерирует reception.html
│   ├── build_doctor.js          ← СКРИПТ: генерирует doctor.html
│   ├── build_booking.js         ← СКРИПТ: генерирует booking.html
│   ├── build_secondary.js       ← СКРИПТ: генерирует about.html, services.html
│   ├── admin_logic_clean.js     ← Исходник логики (JS) для admin.html
│   ├── reception_logic_clean.js ← Исходник логики (JS) для reception.html
│   ├── doctor_logic_clean.js    ← Исходник логики (JS) для doctor.html
│   ├── booking_logic_clean.js   ← Исходник логики (JS) для booking.html
│   ├── style.css                ← Глобальные стили
│   └── ... (остальные HTML и медиафайлы)
├── AI_HANDOFF.md                ← Инструкции для нового агента (читать первым)
├── AI_CHANGELOG.md              ← Журнал изменений (читай верхние 50 строк)
└── SAAS_TRANSFORMATION_PLAN.md  ← ЭТОТ ФАЙЛ (стратегический план)
```

---

## 💡 СТРАТЕГИЧЕСКАЯ ЦЕЛЬ

**Превратить монолит «одна клиника — один сервер» в многопользовательский SaaS-продукт (Multi-Tenant), где одна система управляет сотнями независимых клиник.**

### Видение продукта
- Назвать продукт, например, **ShifoCRM** или **ClinoPlatform** (название уточнить у владельца)
- Веб-сайт продукта (`landing.shifocrm.uz`) — рекламирует систему потенциальным клиникам
- Приложение (`app.shifocrm.uz`) — работает для ВСЕХ клиник через единую кодовую базу
- Каждая клиника входит со своим логином и видит ТОЛЬКО СВОИ данные
- Онлайн-запись для пациентов каждой клиники доступна по уникальной ссылке: `app.shifocrm.uz/book/clinic-slug`
- Владелец продукта (ты) управляет всеми клиниками через SuperAdmin панель

---

## 🔑 КЛЮЧЕВАЯ КОНЦЕПЦИЯ: Multi-Tenancy (Принцип изоляции)

### Что это значит на практике?
Каждая запись в базе данных (врач, пациент, приём, слот) должна быть **жёстко привязана к `clinicId`**. Без этого поля данные будут «общими» для всех.

### Как работает авторизация в Multi-Tenant системе?
1. Пользователь (реципшн/врач/admin клиники) вводит логин + пароль.
2. Система проверяет: «К какой клинике относится этот пользователь?»
3. JWT-токен, который система выдаёт, содержит `clinicId` этого пользователя.
4. **КАЖДЫЙ** API-запрос фильтрует данные через `where: { clinicId: token.clinicId }`.

### Правило «нулевой утечки данных»
> ⛔ **КРИТИЧЕСКИ ВАЖНО:** Ни один API-запрос в Multi-Tenant системе не должен возвращать данные без фильтра `clinicId`. Нарушение этого правила — критическая уязвимость безопасности.

---

## 📋 ПЛАН РЕАЛИЗАЦИИ (Пошаговый, по приоритетам)

### ═══════════════════════════════════════════
### ЭТАП 1: Фундамент (Foundation) 
### ═══════════════════════════════════════════
> **Цель:** Добавить концепцию «Клиника» в базу данных и логику авторизации. Ничего не сломать в текущей работе клиники «Habibullo-Hilola».

#### Шаг 1.1: Создать модель `Clinic` в Prisma схеме
**Файл:** `prisma/schema.prisma`

Добавить в САМЫЙ ВЕРХ схемы (до модели `Doctor`):
```prisma
model Clinic {
  id          String    @id @default(uuid())
  name        String                          // Название клиники: "Habibullo-Hilola"
  slug        String    @unique               // URL-slug: "habibullo-hilola" 
  logoUrl     String?                         // URL логотипа клиники
  address     String?                         // Адрес клиники
  phone       String?                         // Контактный телефон клиники
  telegramBotToken  String?                   // Свой Telegram Bot Token (опционально)
  telegramBotUsername String?                 // @username бота (для виджета)
  timezone    String    @default("Asia/Tashkent") // Часовой пояс
  isActive    Boolean   @default(true)
  plan        ClinicPlan @default(TRIAL)      // Тарифный план
  planExpiresAt DateTime?                     // Дата окончания плана
  
  // Связи
  doctors       Doctor[]
  patients      Patient[]
  appointments  Appointment[]
  visits        Visit[]
  purchases     Purchase[]
  users         User[]
  procedures    Procedure[]
  leaves        Leave[]
  slots         Slot[]
  complaints    Complaint[]
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum ClinicPlan {
  TRIAL       // Пробный период (14 дней)
  BASIC       // Базовый тариф
  PRO         // Профессиональный
  ENTERPRISE  // Корпоративный
}
```

#### Шаг 1.2: Добавить `clinicId` ко ВСЕМ существующим моделям
Добавить в каждую модель (`Doctor`, `Patient`, `Appointment`, `Visit`, `Purchase`, `Procedure`, `Leave`, `Slot`, `Complaint`, `User`, `Otp`):
```prisma
clinicId    String
clinic      Clinic    @relation(fields: [clinicId], references: [id])

@@index([clinicId])  // Индекс для быстрой фильтрации
```

**ВАЖНО для `Otp`:** OTP не привязывается к `clinicId` — он глобальный (один пациент может записаться в разные клиники через один номер телефона).

#### Шаг 1.3: Добавить роль SuperAdmin
**Файл:** `prisma/schema.prisma` — в enum `Role` добавить:
```prisma
enum Role {
  SUPER_ADMIN  // Владелец платформы — видит ВСЕ клиники
  ADMIN        // Администратор ОДНОЙ клиники
  DOCTOR
  RECEPTION
  INVENTORY
}
```

#### Шаг 1.4: Создать первую клинику (seed-скрипт)
**Файл:** `prisma/seed-clinic.ts` (уже существует, обновить его!)

Скрипт должен:
1. Создать запись `Clinic` с name="Habibullo-Hilola", slug="habibullo-hilola"
2. Всем существующим записям в базе (`Doctor`, `Patient`, `Appointment`, `Visit` и т.д.) присвоить этот `clinicId`
3. После выполнения — все существующие данные автоматически «принадлежат» первой клинике

**Команда после изменения схемы:**
```bash
npx prisma db push
npx ts-node prisma/seed-clinic.ts
```

#### Шаг 1.5: Обновить JWT-токен и middleware авторизации
**Файл:** `src/lib/auth.ts`

Добавить `clinicId` в payload JWT-токена:
```typescript
// В функции signToken:
interface TokenPayload {
  userId: string;
  role: Role;
  clinicId: string;       // ← ДОБАВИТЬ
  doctorId?: string;
}
```

**Файл:** `src/lib/clinic-guard.ts` (СОЗДАТЬ НОВЫЙ)
```typescript
// Middleware-утилита, которую будут использовать ВСЕ API-маршруты
export async function requireClinicAccess(request: NextRequest) {
  // 1. Верифицировать JWT
  // 2. Вернуть { userId, role, clinicId }
  // 3. Если нет clinicId — вернуть 403
}
```

---

### ═══════════════════════════════════════════
### ЭТАП 2: Изоляция API (API Isolation)
### ═══════════════════════════════════════════
> **Цель:** Обновить ВСЕ существующие API-маршруты так, чтобы они фильтровали данные по `clinicId`.

#### Список файлов для обновления:
Каждый из этих файлов должен использовать `clinicGuard` и добавлять `clinicId` в каждый Prisma-запрос:

```
src/app/api/admin/doctors/route.ts
src/app/api/admin/doctors/[id]/route.ts
src/app/api/admin/appointments/route.ts
src/app/api/admin/patients/route.ts
src/app/api/admin/procedures/route.ts
src/app/api/admin/visits/route.ts
src/app/api/admin/purchases/route.ts
src/app/api/admin/slots/route.ts
src/app/api/admin/stats/route.ts
src/app/api/admin/leaves/route.ts
src/app/api/admin/users/route.ts
src/app/api/doctor/...
src/app/api/reception/...
src/app/api/inventory/...
src/app/api/public/doctors/route.ts    ← Публичный! Фильтрует по clinicId из параметра URL
src/app/api/public/slots/route.ts      ← Публичный! Аналогично
src/lib/slot-generator.ts             ← Добавить clinicId в создаваемые слоты
```

**Пример обновления маршрута (паттерн для ВСЕХ):**
```typescript
// БЫЛО (текущий код):
export async function GET(request: NextRequest) {
  if (!await requireAdmin(request)) return NextResponse.json({...}, {status: 403});
  const doctors = await prisma.doctor.findMany();  // ← БЕЗ ФИЛЬТРА — ОПАСНО
  ...
}

// СТАЛО (после обновления):
export async function GET(request: NextRequest) {
  const session = await requireClinicAccess(request); // ← новый guard
  if (!session || session.role !== 'ADMIN') return NextResponse.json({...}, {status: 403});
  const doctors = await prisma.doctor.findMany({
    where: { clinicId: session.clinicId }  // ← ОБЯЗАТЕЛЬНЫЙ ФИЛЬТР
  });
  ...
}
```

---

### ═══════════════════════════════════════════
### ЭТАП 3: SuperAdmin Панель
### ═══════════════════════════════════════════
> **Цель:** Создать отдельный интерфейс для владельца платформы, где можно управлять всеми клиниками.

#### Что нужно создать:

**Frontend файлы:**
- `public/superadmin.html` — Главная панель SuperAdmin
- `public/build_superadmin.js` — Скрипт-генератор

**API маршруты:**
- `src/app/api/superadmin/clinics/route.ts` — GET (список всех клиник), POST (создать клинику)
- `src/app/api/superadmin/clinics/[id]/route.ts` — PATCH (изменить план, заблокировать), DELETE
- `src/app/api/superadmin/stats/route.ts` — Общая статистика по всем клиникам

**Функциональность SuperAdmin панели:**
1. Список всех клиник с тарифными планами и статусами
2. Создание новой клиники + автоматическое создание первого пользователя (Admin клиники)
3. Просмотр статистики: количество врачей, пациентов, дохода по каждой клинике
4. Управление тарифными планами и датами истечения
5. Возможность войти «от имени» любой клиники (impersonate) для техподдержки

---

### ═══════════════════════════════════════════
### ЭТАП 4: Публичная Страница Бронирования
### ═══════════════════════════════════════════
> **Цель:** Сделать систему бронирования универсальной — каждая клиника получает свою уникальную ссылку для онлайн-записи.

#### Текущая проблема:
Сейчас `public/booking.html` жёстко настроен на одну клинику. API запросы идут без указания, для какой клиники нужны врачи и слоты.

#### Решение:
Изменить URL-структуру для публичного бронирования:
```
БЫЛО:  https://site.uz/booking.html
СТАЛО: https://app.shifocrm.uz/book/habibullo-hilola
       или https://site.uz/book/habibullo-hilola  (если у клиники своей домен)
```

**Как это работает:**
1. Пациент переходит по ссылке `app.shifocrm.uz/book/habibullo-hilola`
2. Система по `slug="habibullo-hilola"` находит клинику в базе
3. Загружает врачей и слоты ТОЛЬКО этой клиники
4. При бронировании запись создаётся с `clinicId` этой клиники

**API для публичного бронирования** (изменить существующие):
```
GET /api/public/clinic/[slug]          ← Информация о клинике
GET /api/public/doctors?clinic=slug    ← Врачи клиники
GET /api/public/slots?doctorId=x&clinic=slug  ← Слоты врача
POST /api/public/book                  ← Создать запись (clinicId берётся из slug)
```

---

### ═══════════════════════════════════════════
### ЭТАП 5: Telegram Bot — Multi-Clinic
### ═══════════════════════════════════════════
> **Цель:** Сделать Telegram-верификацию и уведомления рабочими для всех клиник.

#### Текущая ситуация:
Один Telegram-бот (`telegram.ts`) — один токен. Все уведомления и OTP идут от одного бота.

#### Два варианта реализации (обсудить с владельцем):

**Вариант A: Единый бот (ПРОЩЕ, рекомендуется для начала)**
- Один бот `@ShifoCRM_bot` обслуживает все клиники
- При отправке уведомления пациенту, в тексте всегда указывается название клиники: «Ваша запись в *Habibullo-Hilola* подтверждена»
- OTP-коды также приходят от единого бота

**Вариант B: Собственный бот для каждой клиники (СЛОЖНЕЕ, но премиально)**
- В настройках клиники (`Clinic.telegramBotToken`) хранится токен её собственного бота
- `src/lib/telegram.ts` нужно переписать так, чтобы принимать `clinicId` и динамически использовать нужный токен
- Для этого вместо глобального singleton `bot`, использовать `Map<clinicId, TelegramBot>`

---

### ═══════════════════════════════════════════
### ЭТАП 6: Landing Page Продукта
### ═══════════════════════════════════════════
> **Цель:** Создать отдельный маркетинговый сайт, отделённый от операционной системы.

#### ВАЖНО: Сайт клиники «Habibullo-Hilola» остаётся
Текущие файлы `public/index.html`, `about.html`, `services.html` — это сайт КОНКРЕТНОЙ клиники, не продукта. Их НЕ ТРОГАЕМ.

#### Что нужно создать:
Отдельный репозиторий или поддомен (`landing.shifocrm.uz`) с маркетинговым сайтом, который:
- Описывает возможности платформы ShifoCRM
- Имеет страницу с ценами (тарифными планами)
- Содержит форму заявки «Подключить мою клинику»
- При клике «Войти» — редирект на `app.shifocrm.uz/login`

---

## 🗂️ СХЕМА ДАННЫХ ПОСЛЕ ТРАНСФОРМАЦИИ

```
Clinic (1)
  ├── Users (N)        ← role: ADMIN, DOCTOR, RECEPTION, INVENTORY
  ├── Doctors (N)      ← clinicId обязателен
  │     ├── Procedures (N)
  │     ├── Slots (N)
  │     ├── Leaves (N)
  │     └── Appointments (N)
  ├── Patients (N)     ← пациент может быть в нескольких клиниках!
  │     └── Appointments (N)
  ├── Visits (N)
  ├── Purchases (N)
  └── Complaints (N)

SuperAdmin (роль без clinicId) ← видит ВСЕ данные без фильтрации
```

**Важный нюанс с Patient:**
Один человек (по номеру телефона/Telegram) может записаться в РАЗНЫЕ клиники. Вариантов два:
1. **Глобальный пациент** — `Patient` не имеет `clinicId`. Одна запись пациента на всю платформу. Разные клиники видят разные `Appointment` этого пациента, но не друг друга.
2. **Локальный пациент** — `Patient` имеет `clinicId`. Один человек создаёт разные профили в разных клиниках.

**Рекомендация:** Использовать **Глобального пациента** (без `clinicId` в `Patient`). Это удобнее для пациента — один раз верифицировался через Telegram и можно записываться куда угодно.

---

## ⚙️ ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ К КОДУ

### Правила, которые ОБЯЗАНЫ соблюдать все агенты:

1. **Никаких изменений в `schema.prisma` без `npx prisma db push`** — обязательно после каждого изменения схемы
2. **Все изменения frontend** — редактировать `*_logic_clean.js` файлы, а затем запускать соответствующий `build_*.js` скрипт для генерации `.html`. Никогда не редактировать `.html` напрямую.
3. **Порядок работы с frontend:**
   ```bash
   # Изменить admin_logic_clean.js, затем:
   node public/build_admin.js
   # Аналогично для reception, doctor, booking
   ```
4. **Git workflow:** После каждого завершенного шага — коммит + push в `main`
5. **Переменные окружения** (`.env`) — не менять без явного согласования с владельцем
6. **Тайм-зона** — везде использовать `Asia/Tashkent` (UTC+5). Никогда не полагаться на UTC-время напрямую в отображении

### Структура нового environment переменных (`.env.example` нужно обновить):
```
# Database
DATABASE_URL=...

# Auth
JWT_SECRET=...

# Telegram — основной бот платформы
TELEGRAM_BOT_TOKEN=...

# SuperAdmin credentials
SUPER_ADMIN_PHONE=+998...
SUPER_ADMIN_PASSWORD_HASH=...

# Cron protection
CRON_SECRET=...

# Environment
NODE_ENV=production
```

---

## 🧪 ТЕСТИРОВАНИЕ

### Перед каждым деплоем проверять:
1. Врач Клиники А НЕ виден при входе под Клиникой Б
2. Бронирование через публичную ссылку `/book/clinic-slug` создаёт запись с правильным `clinicId`
3. Telegram-бот отправляет уведомление с правильным названием клиники
4. SuperAdmin видит все клиники, обычный Admin — только свою
5. Существующие данные клиники «Habibullo-Hilola» не потеряны после миграции

---

## 📊 ПРИОРИТЕТЫ (В КАКОМ ПОРЯДКЕ РАБОТАТЬ)

| Приоритет | Этап | Описание | Трудоёмкость |
|-----------|------|----------|--------------|
| 🔴 P0 | Этап 1 | Добавить `Clinic` модель + `clinicId` ко всем таблицам | ~4 часа |
| 🔴 P0 | Этап 1 | Seed-скрипт: привязать все данные к Clinic №1 | ~1 час |
| 🔴 P0 | Этап 2 | Обновить middleware авторизации (clinic-guard) | ~2 часа |
| 🟠 P1 | Этап 2 | Обновить все API-маршруты (clinicId фильтры) | ~6 часов |
| 🟠 P1 | Этап 3 | SuperAdmin панель (basic) | ~4 часа |
| 🟡 P2 | Этап 4 | Публичное бронирование по slug | ~3 часа |
| 🟡 P2 | Этап 5 | Multi-Clinic Telegram бот | ~2 часа |
| 🟢 P3 | Этап 6 | Landing page продукта | ~6 часов |

---

## ⚠️ КРИТИЧЕСКИЕ РИСКИ И КАК ИХ ИЗБЕЖАТЬ

### Риск 1: Потеря данных при миграции
**Проблема:** При добавлении `clinicId NOT NULL` к существующим записям — база выдаст ошибку, потому что у старых записей нет этого значения.
**Решение:** 
1. Сначала добавить поле как `clinicId String?` (nullable)
2. Запустить seed-скрипт, который заполнит `clinicId` для всех существующих записей
3. Затем сделать поле обязательным `clinicId String` (NOT NULL)

### Риск 2: Слом текущего функционала
**Проблема:** Пока обновляем API, существующая клиника «Habibullo-Hilola» может перестать работать.
**Решение:** Работать по принципу «backward-compatible» — добавлять `clinicId` в фильтры, но сделать так, чтобы старые токены без `clinicId` всё ещё работали (с fallback на ID клиники №1) в течение переходного периода.

### Риск 3: Утечка данных
**Проблема:** Один забытый API без фильтра `clinicId` — и все клиники видят данные друг друга.
**Решение:** Создать тест (TypeScript скрипт или ручная проверка) который проходит по всем API-маршрутам и проверяет наличие `clinicId` фильтра.

---

## 📝 ПРОМПТ ДЛЯ ИИ-АГЕНТА

Ниже находится точный промпт, который нужно передать новому ИИ-агенту, который начнёт реализацию этого плана:

---

```
Ты — опытный full-stack разработчик, работающий над превращением монолитного веб-приложения клиники в масштабируемый SaaS-продукт.

ПРОЕКТ: booking-module (Next.js 15 + Prisma + PostgreSQL Neon + Vanilla HTML/JS frontend)
РЕПОЗИТОРИЙ: d:\AI_Workplace\Habbullo-Hilola\booking-module

ОБЯЗАТЕЛЬНЫЙ ПОРЯДОК ЧТЕНИЯ ДОКУМЕНТОВ (сделай это ПРЕЖДЕ всего):
1. Прочитай AI_HANDOFF.md — базовые правила проекта
2. Прочитай первые 50 строк AI_CHANGELOG.md — что делали последние агенты  
3. Прочитай SAAS_TRANSFORMATION_PLAN.md (ЭТОТ ФАЙЛ) — стратегия полностью
4. Просмотри prisma/schema.prisma — текущая схема данных
5. Просмотри src/lib/auth.ts — текущая авторизация

ТВОЯ ТЕКУЩАЯ ЗАДАЧА: [УКАЖИ КОНКРЕТНЫЙ ЭТАП, например: "Выполни Этап 1 из SAAS_TRANSFORMATION_PLAN.md"]

ТЕХНИЧЕСКИЕ ПРАВИЛА (нарушать нельзя):
- Frontend: редактируй только *_logic_clean.js файлы, затем запускай node public/build_*.js 
- БД: после каждого изменения schema.prisma — запускай npx prisma db push
- Не используй cat/grep в bash — используй инструменты view_file и grep_search
- После каждой задачи — git add -A && git commit -m "..." && git push origin main
- Тайм-зона: Asia/Tashkent (UTC+5)
- При каждой работе с API — добавляй clinicId фильтр во все Prisma запросы

ГЛАВНЫЙ ПРИНЦИП: Не ломай то, что уже работает для клиники "Habibullo-Hilola". Всегда работай backward-compatible.

После завершения работы добавь запись в верх файла AI_CHANGELOG.md в формате:
## [ДАТА] - [краткое описание]
- пункт 1
- пункт 2
```

---

## 🔄 КАК ОБНОВЛЯТЬ ЭТОТ ДОКУМЕНТ

Этот файл — живой документ. При выполнении каждого этапа:
1. Отметь завершённые шаги как `✅ ВЫПОЛНЕНО`
2. Добавь ссылки на конкретные файлы, которые были созданы/изменены
3. Добавь любые новые открытия или изменения в архитектуре

---

*Документ создан: 2026-06-15*  
*Автор: Antigravity (AI Agent, Google DeepMind)*  
*Владелец продукта: [Имя владельца — уточнить]*

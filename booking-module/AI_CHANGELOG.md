# AI Agent Changelog (Журнал изменений)

**Правила для ИИ-агентов при работе с этим файлом:**
1. Добавляйте новые записи в **САМЫЙ ВЕРХ** этого файла (сразу под этими правилами).
2. Формат: `## [Дата] - [Краткое описание задачи]`, а затем пункты списком.
3. Если этот файл превышает 300 строк, извлеките нижние 200 строк и переместите их в файл `AI_CHANGELOG_ARCHIVE.md`.
4. **При чтении:** Читайте только верхние 50 строк этого файла, чтобы понять самый свежий контекст. Не тратьте токены на старые логи.

---

## 2026-06-14 - Admin Jadvallar UI Fix
**Author:** Antigravity
- Fixed a bug where clicking "Jadvalni boshqarish" (Manage Schedule) on the Jadvallar tab did nothing. Restored the missing schedule grid HTML layout (`admin-schedule-container`) inside `build_admin.js` which was causing the script to crash.
- Fixed an additional bug where the schedule grid would show "Yuklashda xatolik yuz berdi" (Loading error). This was caused by the time labels column (`admin-time-labels`) being accidentally overwritten and deleted from the DOM. Separated it from `admin-grid-columns` to restore correct functionality.

## 2026-06-14 - Редизайн Reception Portal
**Автор:** Antigravity
- Полностью переработан UI страницы Reception: старые таблицы (Upcoming, Missed, In Progress) заменены на современные карточки.
- Использована библиотека TomSelect для выпадающего списка "Shifokor".
- Устранены отступы по краям для максимального использования пространства на широких экранах (`w-full` вместо `max-w-[1280px]`).
- Добавлены красивые Empty States для вкладки "Muolajada" вместо полного скрытия блока при отсутствии активных сеансов.
- Все изменения скомпилированы через скрипт-генератор `build_reception.js` в `reception.html`.


## 2026-06-13 - Редизайн интерфейса (Clinova)
**Автор:** Antigravity
- Начало работы над редизайном интерфейса Clinova (8 экранов: admin, doctor, patient, reception и др.) согласно `DESIGN.md`.

## 2026-06-13 - UI Фиксы, Загрузка Фото и Устранение Багов
- **Расписание врачей:** Изменено ограничение времени с 20:00 до 18:00 (переменная `END_HOUR` с 19 на 17 в `admin.html` и `doctor.html`).
- **UI Улучшения:** Добавлена плавная анимация (CSS Accordion) для кнопки "Batafsil" (Подробнее) на странице услуг вместо открытия нового окна.
- **Сохраненные записи (Черновики):** Исправлен баг в `booking.html`, из-за которого переход по черновику зависал на 1-м шаге. Теперь система корректно переводит на 2-й шаг (выбор времени).
- **API Черновиков:** Добавлен `id: true` для доктора в `api/public/drafts/route.ts` для корректной подгрузки свободных слотов.
- **Фото врачей (Vercel Fix):** Серверная логика загрузки файлов заменена на клиентскую (Canvas Base64 компрессия до 600px в `admin.html`), чтобы обойти ограничения read-only файловой системы Vercel.
- **Уведомления админки:** Исправлена ошибка `ReferenceError` ("Tarmoq xatosi") при успешном сохранении врача/удалении выходного, возникшая из-за опечатки `showAdminToast` вместо `showToast`.
- **Сборка Next.js:** Устранен сбой сборки на Vercel (`api/admin/purchases/[id]/route.ts`), параметры `params` обновлены до `Promise<{ id: string }>` под стандарт Next.js 15.

## 2026-06-13 - AI Handoff и Архитектурные инструкции
**Автор:** Antigravity (Агент от Google DeepMind)
- Созданы файлы `AI_HANDOFF.md` и `AI_CHANGELOG.md` для обеспечения чистого процесса адаптации (onboarding) новых ИИ-агентов на этом проекте.
- Внедрено правило "Скользящего журнала (Rolling Changelog)", чтобы логи не становились слишком большими и не потребляли лишние лимиты токенов.

## 2026-05-24 - Исправление багов и Окно переноса приемов
**Автор:** Antigravity
- Исправлена ошибка 500 (Internal Server) при обновлении/добавлении врачей за счет синхронизации схемы Prisma (db push) с базой данных Neon в продакшене.
- Заменены все устаревшие вызовы `alert()` в `admin.html` на кастомную систему уведомлений `showToast()`.
- Реализовано абсолютно новое и отдельное **Окно переноса времени (Reschedule Modal)** в `reception.html`, чтобы предотвратить случайную перезапись данных пациента при переносе приема.

## 2026-05-23 - Модуль Инвентаризации (Ta'minotchi / Снабженец)
**Автор:** Antigravity
- Создана роль `INVENTORY` и обновлена схема Prisma: добавлена модель `Purchase` (Закупки).
- Создана панель управления `inventory.html` для отслеживания расходов клиники и закупок оборудования/материалов.
- Интегрирован обзор инвентаризации напрямую в главную панель администратора `admin.html`.

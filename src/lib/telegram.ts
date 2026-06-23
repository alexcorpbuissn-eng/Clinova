/**
 * src/lib/telegram.ts — Multi-tenant Telegram bot support.
 *
 * Architecture:
 * - Platform bot (TELEGRAM_BOT_TOKEN env var) handles OTP — clinic-agnostic.
 * - Per-clinic bot: if Clinic.telegramBotToken is set, uses that bot.
 *   Otherwise falls back to the platform bot.
 * - Clinic names and group chat IDs come from the DB, not env vars.
 */

import TelegramBot from 'node-telegram-bot-api';
import { prisma } from './prisma';

// ─── Bot cache (per token) ────────────────────────────────────────────────────
const _botCache = new Map<string, TelegramBot>();

function getBotByToken(token: string): TelegramBot {
  if (!_botCache.has(token)) {
    _botCache.set(token, new TelegramBot(token, { polling: false }));
  }
  return _botCache.get(token)!;
}

/** Platform bot — used for OTP (clinic-agnostic) */
export function getBot(): TelegramBot {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set.');
  return getBotByToken(token);
}

/** Per-clinic bot — falls back to platform bot if clinic has no token */
export async function getClinicBot(clinicId: string): Promise<TelegramBot> {
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { telegramBotToken: true }
  });
  const token = clinic?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('No Telegram bot token available.');
  return getBotByToken(token);
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\s|-/g, '');
  return digits.startsWith('+') ? digits : `+${digits}`;
}

export function toTashkentTime(utcDate: Date): string {
  return utcDate.toLocaleTimeString('uz-UZ', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent',
  });
}

export function toTashkentDate(utcDate: Date): string {
  return utcDate.toLocaleDateString('uz-UZ', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Tashkent',
  });
}

export function getBotDeepLink(telegramPhone: string): string {
  const username = process.env.TELEGRAM_BOT_USERNAME;
  if (!username) throw new Error('TELEGRAM_BOT_USERNAME is not set.');
  const param = normalisePhone(telegramPhone).replace('+', '');
  return `https://t.me/${username}?start=${param}`;
}

function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ─── Inbound: OTP flow (platform bot — no clinicId needed) ───────────────────

export async function processStartCommand(
  rawPhone: string,
  chatId: string,
  username?: string
): Promise<void> {
  const telegramPhone = normalisePhone(rawPhone);

  await prisma.patient.upsert({
    where: { telegramPhone },
    update: { telegramChatId: chatId, telegramUsername: username || null },
    create: {
      telegramPhone,
      telegramChatId: chatId,
      telegramUsername: username || null,
      firstName: '',
      lastName: '',
      phone: telegramPhone,
      isVerified: false,
    },
  });

  await generateAndSendOtp(telegramPhone, chatId);
}

export async function generateAndSendOtp(telegramPhone: string, chatId: string): Promise<void> {
  const bot = getBot();

  await prisma.otp.updateMany({
    where: { telegramPhone, used: false },
    data: { used: true },
  });

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otp.create({ data: { telegramPhone, code, expiresAt } });

  const text =
    `🔐 *Clinova tasdiqlash kodi*\n\n` +
    `Sizning bir martalik kodingiz:\n\n` +
    `*${code}*\n\n` +
    `⏱ Kod *10 daqiqa* davomida amal qiladi.\n` +
    `Agar siz so'rov yubormagan bo'lsangiz — ushbu xabarni e'tiborsiz qoldiring.`;

  await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
}

// ─── Reminders ────────────────────────────────────────────────────────────────

export interface ReminderPayload {
  chatId: string;
  doctorName: string;
  appointmentTime: Date;
  clinicId: string;
  clinicName: string;
}

export async function sendReminder24h(payload: ReminderPayload): Promise<boolean> {
  const bot = await getClinicBot(payload.clinicId);
  const time = toTashkentTime(payload.appointmentTime);

  const text =
    `📅 *Eslatma:* Ertaga *${time}* da ` +
    `Dr. *${payload.doctorName}* bilan uchrashuvingiz bor.\n` +
    `🏥 Klinika: *${payload.clinicName}*`;

  try {
    await bot.sendMessage(payload.chatId, text, { parse_mode: 'Markdown' });
    return true;
  } catch (err) {
    console.error('[Telegram] sendReminder24h error:', err);
    return false;
  }
}

export async function sendReminder2h(payload: ReminderPayload): Promise<boolean> {
  const bot = await getClinicBot(payload.clinicId);
  const time = toTashkentTime(payload.appointmentTime);

  const text =
    `⏰ *Eslatma:* *${time}* da uchrashuvingiz *2 soatdan keyin.*\n` +
    `👨⚕️ Dr. *${payload.doctorName}*\n` +
    `🏥 Klinika: *${payload.clinicName}*`;

  try {
    await bot.sendMessage(payload.chatId, text, { parse_mode: 'Markdown' });
    return true;
  } catch (err) {
    console.error('[Telegram] sendReminder2h error:', err);
    return false;
  }
}

// ─── Group notification ───────────────────────────────────────────────────────

export interface GroupNotificationPayload {
  patientFirst: string;
  patientLast: string;
  phone: string;
  doctorName: string;
  procedureName: string;
  appointmentTime: Date;
  description?: string | null;
  telegramChatId?: string | null;
  clinicId: string;
  clinicName: string;
}

export async function sendGroupNotification(
  payload: GroupNotificationPayload
): Promise<boolean> {
  // Look up group chat ID from DB
  const clinic = await prisma.clinic.findUnique({
    where: { id: payload.clinicId },
    select: { telegramGroupChatId: true, telegramBotToken: true }
  });

  const groupChatId = clinic?.telegramGroupChatId || process.env.TELEGRAM_GROUP_CHAT_ID;
  if (!groupChatId) {
    console.warn('[Telegram] No group chat ID for clinic:', payload.clinicId);
    return false;
  }

  const token = clinic?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;
  const bot = getBotByToken(token);

  const date = toTashkentDate(payload.appointmentTime);
  const time = toTashkentTime(payload.appointmentTime);
  const description = payload.description?.trim() || "Ko'rsatilmagan";
  const patientName = `${payload.patientFirst} ${payload.patientLast}`;
  const patientLink = payload.telegramChatId
    ? `[${patientName}](tg://user?id=${payload.telegramChatId})`
    : `*${patientName}*`;

  const text =
    `🆕 *Yangi yozuv!*\n\n` +
    `👤 Bemor: ${patientLink}\n` +
    `📞 Telefon: \`${payload.phone}\`\n` +
    `👨⚕️ Shifokor: *Dr. ${payload.doctorName}*\n` +
    `🦷 Protsedura: *${payload.procedureName}*\n` +
    `📅 Sana: *${date}*\n` +
    `🕐 Vaqt: *${time}*\n` +
    `📝 Muammo: ${description}\n` +
    `🏥 Klinika: *${payload.clinicName}*`;

  try {
    await bot.sendMessage(groupChatId, text, { parse_mode: 'Markdown' });
    return true;
  } catch (err) {
    console.error('[Telegram] sendGroupNotification error:', err);
    return false;
  }
}

// ─── Patient confirmation ─────────────────────────────────────────────────────

export interface ConfirmationPayload {
  chatId: string;
  doctorName: string;
  procedureName: string;
  appointmentTime: Date;
  clinicId: string;
  clinicName: string;
}

export async function sendPatientConfirmation(payload: ConfirmationPayload): Promise<boolean> {
  const bot = await getClinicBot(payload.clinicId);
  const date = toTashkentDate(payload.appointmentTime);
  const time = toTashkentTime(payload.appointmentTime);

  const text =
    `✅ *Qabulingiz muvaffaqiyatli band qilindi!*\n\n` +
    `👨⚕️ Shifokor: *Dr. ${payload.doctorName}*\n` +
    `🦷 Protsedura: *${payload.procedureName}*\n` +
    `📅 Sana: *${date}*\n` +
    `🕐 Vaqt: *${time}*\n\n` +
    `🏥 Klinika: *${payload.clinicName}*\n` +
    `Iltimos, belgilangan vaqtdan 10 daqiqa oldin kelishni unutmang.`;

  try {
    await bot.sendMessage(payload.chatId, text, { parse_mode: 'Markdown' });
    return true;
  } catch (err) {
    console.error('[Telegram] sendPatientConfirmation error:', err);
    return false;
  }
}

/**
 * src/lib/telegram.ts
 *
 * All Telegram bot operations — single source of truth.
 *
 * Architecture:
 *  - The bot runs in polling=false (safe for serverless / Vercel).
 *  - INBOUND messages (e.g. /start) are received via a registered
 *    Telegram webhook → POST /api/telegram/webhook
 *  - OUTBOUND messages (OTP, reminders, group notifications) are
 *    sent from API route handlers using the helpers below.
 *
 * OTP flow:
 *  1. Website shows patient: https://t.me/<BOT>?start=<phone>
 *  2. Patient taps START → Telegram sends POST to our webhook
 *  3. Webhook handler calls processStartCommand(phone, chatId)
 *     → generates OTP, stores in DB, sends DM to patient
 *  4. Patient types code on website → POST /api/public/verify-otp
 */

import TelegramBot from 'node-telegram-bot-api';
import { prisma } from './prisma';

// ─── Singleton (send-only, no polling) ───────────────────────────────────────
let _bot: TelegramBot | null = null;

export function getBot(): TelegramBot {
  if (!_bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set.');
    _bot = new TelegramBot(token, { polling: false });
  }
  return _bot;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/** Normalise phone to E.164 without spaces, e.g. "+998901234567" */
export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\s|-/g, '');
  return digits.startsWith('+') ? digits : `+${digits}`;
}

/** Format a UTC Date to HH:MM in Tashkent timezone (UTC+5) */
export function toTashkentTime(utcDate: Date): string {
  return utcDate.toLocaleTimeString('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tashkent',
  });
}

/** Format a UTC Date to full date string in Uzbek */
export function toTashkentDate(utcDate: Date): string {
  return utcDate.toLocaleDateString('uz-UZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Tashkent',
  });
}

/** Build the deep-link shown on the booking page Step 3 */
export function getBotDeepLink(telegramPhone: string): string {
  const username = process.env.TELEGRAM_BOT_USERNAME;
  if (!username) throw new Error('TELEGRAM_BOT_USERNAME is not set.');
  // Telegram start parameter only allows A-Z, a-z, 0-9, _, -. We strip '+' to comply.
  const param = normalisePhone(telegramPhone).replace('+', '');
  return `https://t.me/${username}?start=${param}`;
}

/** Generate a cryptographically-adequate 6-digit OTP string */
function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ─────────────────────────────────────────────────────────────────────────────
// INBOUND HANDLER — called from POST /api/telegram/webhook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * processStartCommand
 *
 * Called when the webhook receives a /start <phone> message.
 *
 * Steps:
 *  1. Upsert a Patient record with telegramChatId (unverified)
 *  2. Create a fresh OTP row (invalidates any previous pending code)
 *  3. Send the OTP code via DM
 */
export async function processStartCommand(
  rawPhone: string,
  chatId: string,
  username?: string
): Promise<void> {
  const telegramPhone = normalisePhone(rawPhone);
  const bot = getBot();

  // 1 — persist chatId against this phone (isVerified stays false until code check)
  await prisma.patient.upsert({
    where: { telegramPhone },
    update: { telegramChatId: chatId, telegramUsername: username || null },
    create: {
      telegramPhone,
      telegramChatId: chatId,
      telegramUsername: username || null,
      firstName: '',   // filled during Step 3 form submission
      lastName: '',
      phone: telegramPhone,
      isVerified: false,
    },
  });

  await generateAndSendOtp(telegramPhone, chatId);
}

/**
 * generateAndSendOtp
 *
 * Generates an OTP, invalidates old ones, and sends it directly via Telegram DM.
 * Used by both processStartCommand (new users) and send-otp route (returning users).
 */
export async function generateAndSendOtp(telegramPhone: string, chatId: string): Promise<void> {
  const bot = getBot();

  // invalidate old unused OTPs for this phone
  await prisma.otp.updateMany({
    where: { telegramPhone, used: false },
    data: { used: true },
  });

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.otp.create({ data: { telegramPhone, code, expiresAt } });

  const text =
    `🔐 *Habibullo-Hilola tasdiqlash kodi*\n\n` +
    `Sizning bir martalik kodingiz:\n\n` +
    `*${code}*\n\n` +
    `⏱ Kod *10 daqiqa* davomida amal qiladi.\n` +
    `Agar siz so'rov yubormagan bo'lsangiz — ushbu xabarni e'tiborsiz qoldiring.`;

  await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
}

// ─────────────────────────────────────────────────────────────────────────────
// JOB 2 — PATIENT REMINDERS
// ─────────────────────────────────────────────────────────────────────────────

export interface ReminderPayload {
  chatId: string;
  doctorName: string;
  appointmentTime: Date; // UTC
}

export async function sendReminder24h(payload: ReminderPayload): Promise<boolean> {
  const bot = getBot();
  const time = toTashkentTime(payload.appointmentTime);

  const text =
    `📅 *Eslatma:* Ertaga *${time}* da ` +
    `Dr. *${payload.doctorName}* bilan uchrashuvingiz bor.\n` +
    `🏥 Klinika: *Habibullo-Hilola*`;

  try {
    await bot.sendMessage(payload.chatId, text, { parse_mode: 'Markdown' });
    return true;
  } catch (err) {
    console.error('[Telegram] sendReminder24h error:', err);
    return false;
  }
}

export async function sendReminder2h(payload: ReminderPayload): Promise<boolean> {
  const bot = getBot();
  const time = toTashkentTime(payload.appointmentTime);

  const text =
    `⏰ *Eslatma:* *${time}* da uchrashuvingiz *2 soatdan keyin.*\n` +
    `👨‍⚕️ Dr. *${payload.doctorName}*\n` +
    `🏥 Klinika: *Habibullo-Hilola*`;

  try {
    await bot.sendMessage(payload.chatId, text, { parse_mode: 'Markdown' });
    return true;
  } catch (err) {
    console.error('[Telegram] sendReminder2h error:', err);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// JOB 3 — CLINIC OWNER GROUP NOTIFICATION
// ─────────────────────────────────────────────────────────────────────────────

export interface GroupNotificationPayload {
  patientFirst: string;
  patientLast: string;
  phone: string;
  doctorName: string;
  procedureName: string;
  appointmentTime: Date; // UTC
  description?: string | null;
  telegramChatId?: string | null;
}

export async function sendGroupNotification(
  payload: GroupNotificationPayload
): Promise<boolean> {
  const groupChatId = process.env.TELEGRAM_GROUP_CHAT_ID;
  if (!groupChatId) {
    console.warn('[Telegram] TELEGRAM_GROUP_CHAT_ID not set — skipping group notification.');
    return false;
  }

  const bot = getBot();
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
    `👨‍⚕️ Shifokor: *Dr. ${payload.doctorName}*\n` +
    `🦷 Protsedura: *${payload.procedureName}*\n` +
    `📅 Sana: *${date}*\n` +
    `🕐 Vaqt: *${time}*\n` +
    `📝 Muammo: ${description}`;

  try {
    await bot.sendMessage(groupChatId, text, { parse_mode: 'Markdown' });
    return true;
  } catch (err) {
    console.error('[Telegram] sendGroupNotification error:', err);
    return false;
  }
}

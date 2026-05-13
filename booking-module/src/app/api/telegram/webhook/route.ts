/**
 * POST /api/telegram/webhook
 *
 * Telegram delivers all inbound updates here.
 * Registered once via:
 *   https://api.telegram.org/bot<TOKEN>/setWebhook?url=<YOUR_DOMAIN>/api/telegram/webhook
 *
 * Currently handles:
 *   /start <phone> — save chatId, generate OTP, send DM
 *
 * Security: Telegram signs requests with the bot token in the URL.
 * We verify the request came from Telegram by checking a shared
 * TELEGRAM_WEBHOOK_SECRET header (set during setWebhook with ?secret_token=).
 */

import { NextRequest, NextResponse } from 'next/server';
import { processStartCommand, normalisePhone } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  // ── Optional: verify Telegram webhook secret ──────────────────────────────
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const incoming = req.headers.get('x-telegram-bot-api-secret-token');
    if (incoming !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // ── Extract message ───────────────────────────────────────────────────────
  const message = body?.message;
  if (!message) {
    // Not a message update (could be edited_message, callback_query, etc.) — ignore
    return NextResponse.json({ ok: true });
  }

  const chatId = String(message.chat.id);
  const text: string = message.text ?? '';

  // ── Handle /start <phone> ─────────────────────────────────────────────────
  // Telegram passes the deep-link parameter as "/start <param>"
  if (text.startsWith('/start')) {
    const parts = text.trim().split(/\s+/);
    const rawPhone = parts[1]; // e.g. "%2B998901234567" or "+998901234567"

    if (!rawPhone) {
      // /start with no parameter — generic welcome
      const { getBot } = await import('@/lib/telegram');
      await getBot().sendMessage(
        chatId,
        '👋 Salom! Habibullo-Hilola klinikasiga xush kelibsiz.\n\nQabulga yozilish uchun veb-saytimizga o\'ting.',
        { parse_mode: 'Markdown' }
      );
      return NextResponse.json({ ok: true });
    }

    // If it doesn't start with '+', add it back because we stripped it for the deep link
    let decodedPhone = rawPhone;
    if (!decodedPhone.startsWith('+')) {
      decodedPhone = '+' + decodedPhone;
    }

    try {
      const username = message.from?.username;
      await processStartCommand(decodedPhone, chatId, username);
    } catch (err) {
      console.error('[Webhook] processStartCommand error:', err);
      // Don't throw — always return 200 to Telegram or it will retry
    }

    return NextResponse.json({ ok: true });
  }

  // ── Unrecognised message — acknowledge silently ───────────────────────────
  return NextResponse.json({ ok: true });
}

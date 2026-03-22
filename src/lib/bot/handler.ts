// src/lib/bot/handler.ts
// Đây là trái tim của bot — nhận update từ webhook và dispatch đến đúng handler

import TelegramBot from "node-telegram-bot-api";
import { getBot } from "./client";
import { BotContext } from "./types";
import {
  handleStart,
  handleHelp,
  handlePing,
  handleBroadcast,
  handleStats,
} from "./commands";
import { handleCallback } from "./callbacks";

// Chat ID của admin (set trong .env)
function isAdmin(userId: number): boolean {
  const adminId = process.env.ADMIN_CHAT_ID;
  if (!adminId) return false;
  return userId.toString() === adminId;
}

// Build context từ message
function buildCtx(bot: TelegramBot, msg: TelegramBot.Message): BotContext {
  return {
    bot,
    msg,
    chatId: msg.chat.id,
    userId: msg.from?.id ?? 0,
    text: msg.text ?? "",
    isAdmin: isAdmin(msg.from?.id ?? 0),
  };
}

// ─── Main Dispatcher ──────────────────────────────────────────────────────────

export async function handleUpdate(update: TelegramBot.Update): Promise<void> {
  const bot = getBot();

  // ── Callback Query (inline keyboard button) ──
  if (update.callback_query) {
    await handleCallback(bot, update.callback_query);
    return;
  }

  // ── Message ──
  const msg = update.message;
  if (!msg) return;

  const ctx = buildCtx(bot, msg);
  const text = ctx.text.trim();

  // Commands
  if (text.startsWith("/")) {
    const command = text.split(" ")[0].split("@")[0].toLowerCase();

    switch (command) {
      case "/start":
        await handleStart(ctx);
        break;
      case "/help":
        await handleHelp(ctx);
        break;
      case "/ping":
        await handlePing(ctx);
        break;
      case "/broadcast":
        await handleBroadcast(ctx);
        break;
      case "/stats":
        await handleStats(ctx);
        break;
      default:
        await bot.sendMessage(
          ctx.chatId,
          `❓ Không hiểu lệnh \`${command}\`\\. Gõ /help để xem danh sách lệnh\\.`,
          { parse_mode: "MarkdownV2" }
        );
    }
    return;
  }

  // ── Non-command messages ──
  // TODO: Thêm logic xử lý tin nhắn thường ở đây
  // VD: AI chatbot, keyword matching, conversation state, v.v.

  await bot.sendMessage(
    ctx.chatId,
    "💬 Tôi nhận được tin nhắn của bạn\\. Gõ /help để xem tôi có thể làm gì\\.",
    { parse_mode: "MarkdownV2" }
  );
}

// ─── Error notifier ───────────────────────────────────────────────────────────

export async function notifyAdmin(error: Error | string): Promise<void> {
  const adminId = process.env.ADMIN_CHAT_ID;
  if (!adminId) return;

  try {
    const bot = getBot();
    const message =
      typeof error === "string" ? error : `🚨 *Bot Error*\n\n\`${error.message}\``;
    await bot.sendMessage(adminId, message, { parse_mode: "MarkdownV2" });
  } catch {
    // Không làm gì nếu không gửi được
  }
}

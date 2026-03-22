// src/lib/bot/client.ts
// Bot client dùng webhook mode (bắt buộc cho Vercel/serverless)
// Không dùng polling vì serverless function không sống lâu đủ

import TelegramBot from "node-telegram-bot-api";

let bot: TelegramBot | null = null;

export function getBot(): TelegramBot {
  if (!bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN is not set");
    }
    // webhook: true — tắt polling, chỉ dùng sendMessage/etc
    bot = new TelegramBot(token, { webHook: false });
  }
  return bot;
}

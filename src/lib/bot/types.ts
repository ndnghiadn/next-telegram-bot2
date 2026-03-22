// src/lib/bot/types.ts

import TelegramBot from "node-telegram-bot-api";

export type BotContext = {
  bot: TelegramBot;
  msg: TelegramBot.Message;
  chatId: number;
  userId: number;
  text: string;
  isAdmin: boolean;
};

export type CommandHandler = (ctx: BotContext) => Promise<void>;

export type CallbackHandler = (
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery
) => Promise<void>;

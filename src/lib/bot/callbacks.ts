// src/lib/bot/callbacks.ts
// Xử lý các nút inline keyboard (callback_data)

import TelegramBot from "node-telegram-bot-api";

export async function handleCallback(
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery
) {
  const chatId = query.message?.chat.id;
  const messageId = query.message?.message_id;
  const data = query.data;

  if (!chatId || !messageId || !data) return;

  // Luôn answer callback để Telegram biết đã nhận
  await bot.answerCallbackQuery(query.id);

  switch (data) {
    case "help":
      await bot.editMessageText(
        "📋 *Lệnh có sẵn*\n\n/start \\- Bắt đầu\n/help \\- Trợ giúp\n/ping \\- Kiểm tra độ trễ",
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "MarkdownV2",
          reply_markup: {
            inline_keyboard: [[{ text: "⬅️ Quay lại", callback_data: "back_home" }]],
          },
        }
      );
      break;

    case "status":
      await bot.editMessageText(
        "✅ *Bot đang hoạt động*\n\n⚡ Mode: Webhook\n🌐 Platform: Vercel\n⏱ Uptime: N\\/A \\(serverless\\)",
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "MarkdownV2",
          reply_markup: {
            inline_keyboard: [[{ text: "⬅️ Quay lại", callback_data: "back_home" }]],
          },
        }
      );
      break;

    case "back_home":
      await bot.editMessageText(
        "👋 Xin chào\\! Gõ /help để xem các lệnh có sẵn\\.",
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "MarkdownV2",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "📋 Help", callback_data: "help" },
                { text: "📊 Status", callback_data: "status" },
              ],
            ],
          },
        }
      );
      break;

    default:
      // TODO: Thêm case của bạn vào đây
      await bot.answerCallbackQuery(query.id, {
        text: "Chức năng này chưa được implement",
        show_alert: false,
      });
  }
}

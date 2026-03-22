// src/lib/bot/commands.ts
// Thêm commands của bạn vào đây

import { BotContext } from "./types";

// ─── Public Commands ──────────────────────────────────────────────────────────

export async function handleStart(ctx: BotContext) {
  const { bot, chatId, msg } = ctx;
  const name = msg.from?.first_name ?? "bạn";

  await bot.sendMessage(
    chatId,
    `👋 Xin chào *${name}*\\!\n\nTôi là bot của bạn\\. Gõ /help để xem các lệnh có sẵn\\.`,
    {
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
}

export async function handleHelp(ctx: BotContext) {
  const { bot, chatId, isAdmin } = ctx;

  const publicCommands = `
📋 *Danh sách lệnh*

/start \\- Bắt đầu
/help \\- Xem lệnh này
/ping \\- Kiểm tra bot còn sống không
  `.trim();

  const adminCommands = `

🔐 *Admin Commands*
/broadcast \\<message\\> \\- Gửi tin đến tất cả
/stats \\- Xem thống kê
  `.trim();

  const text = isAdmin
    ? publicCommands + "\n\n" + adminCommands
    : publicCommands;

  await bot.sendMessage(chatId, text, { parse_mode: "MarkdownV2" });
}

export async function handlePing(ctx: BotContext) {
  const { bot, chatId } = ctx;
  const start = Date.now();
  const sent = await bot.sendMessage(chatId, "🏓 Pong\\!", {
    parse_mode: "MarkdownV2",
  });
  const latency = Date.now() - start;
  await bot.editMessageText(`🏓 Pong\\! \\(${latency}ms\\)`, {
    chat_id: chatId,
    message_id: sent.message_id,
    parse_mode: "MarkdownV2",
  });
}

// ─── Admin Commands ───────────────────────────────────────────────────────────

export async function handleBroadcast(ctx: BotContext) {
  const { bot, chatId, text, isAdmin } = ctx;

  if (!isAdmin) {
    await bot.sendMessage(chatId, "⛔ Bạn không có quyền dùng lệnh này\\.", {
      parse_mode: "MarkdownV2",
    });
    return;
  }

  const message = text.replace(/^\/broadcast\s*/i, "").trim();
  if (!message) {
    await bot.sendMessage(chatId, "❌ Cú pháp: `/broadcast <nội dung>`", {
      parse_mode: "MarkdownV2",
    });
    return;
  }

  // TODO: Lấy danh sách user từ DB của bạn và gửi
  // const users = await getUsers();
  // for (const user of users) { await bot.sendMessage(user.chatId, message) }

  await bot.sendMessage(
    chatId,
    `✅ Đã broadcast:\n\n${message.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&")}`,
    { parse_mode: "MarkdownV2" }
  );
}

export async function handleStats(ctx: BotContext) {
  const { bot, chatId, isAdmin } = ctx;

  if (!isAdmin) {
    await bot.sendMessage(chatId, "⛔ Bạn không có quyền\\.", {
      parse_mode: "MarkdownV2",
    });
    return;
  }

  // TODO: Query DB thật của bạn
  const stats = {
    users: 0,
    messages_today: 0,
    uptime: Math.floor(process.uptime()),
  };

  await bot.sendMessage(
    chatId,
    `📊 *Thống kê*\n\n👤 Users: *${stats.users}*\n💬 Tin nhắn hôm nay: *${stats.messages_today}*\n⏱ Uptime: *${stats.uptime}s*`,
    { parse_mode: "MarkdownV2" }
  );
}

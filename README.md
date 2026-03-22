# 🤖 Next.js Telegram Bot — Vercel + Webhook

Next.js 15 + TypeScript + node-telegram-bot-api, chạy 24/7 trên Vercel bằng **Webhook mode**.

## 📁 Cấu trúc

```
src/
├── app/
│   ├── admin/              # Admin UI (trang quản lý bot)
│   │   ├── page.tsx
│   │   └── admin.module.css
│   ├── api/bot/
│   │   ├── webhook/        # POST — nhận updates từ Telegram
│   │   ├── setup/          # GET/POST/DELETE — quản lý webhook
│   │   └── broadcast/      # POST — gửi tin hàng loạt
│   ├── layout.tsx
│   └── page.tsx            # redirect → /admin
├── lib/bot/
│   ├── client.ts           # TelegramBot instance (singleton)
│   ├── types.ts            # TypeScript types
│   ├── handler.ts          # ⭐ Main dispatcher — sửa bot ở đây
│   ├── commands.ts         # Xử lý /commands
│   └── callbacks.ts        # Xử lý inline keyboard buttons
scripts/
└── set-webhook.ts          # CLI để register webhook
```

## 🚀 Deploy lên Vercel (từng bước)

### Bước 1 — Tạo Bot Telegram
1. Mở Telegram, nhắn [@BotFather](https://t.me/BotFather)
2. Gửi `/newbot` → đặt tên → nhận **Bot Token**

### Bước 2 — Setup local
```bash
# Clone / copy project về
npm install

# Copy file env
cp .env.example .env.local

# Điền vào .env.local:
# TELEGRAM_BOT_TOKEN=  ← token từ BotFather
# ADMIN_PASSWORD=      ← mật khẩu vào trang /admin
# WEBHOOK_SECRET=      ← chuỗi random (chạy: openssl rand -hex 32)
# NEXT_PUBLIC_APP_URL= ← để trống, điền sau khi deploy xong
```

### Bước 3 — Deploy lên Vercel
```bash
# Cài Vercel CLI
npm i -g vercel

# Deploy
vercel

# Hoặc: push lên GitHub rồi import tại vercel.com
```

Sau khi deploy, Vercel sẽ cho bạn URL dạng `https://your-app.vercel.app`

### Bước 4 — Điền URL vào env và set Webhook
1. Vào Vercel Dashboard → Settings → Environment Variables
2. Thêm `NEXT_PUBLIC_APP_URL=https://your-app.vercel.app`
3. Redeploy (hoặc dùng cách bên dưới)

**Set webhook qua CLI:**
```bash
# Thêm URL vào .env.local trước
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

npx ts-node scripts/set-webhook.ts
```

**Hoặc set webhook qua Admin UI:**
1. Mở `https://your-app.vercel.app/admin`
2. Nhập ADMIN_PASSWORD
3. Click **▲ set webhook**

### Bước 5 — Test
Mở Telegram → nhắn `/start` với bot của bạn → 🎉

---

## 🛠 Phát triển Bot

### Thêm command mới

**1. Viết handler trong `src/lib/bot/commands.ts`:**
```typescript
export async function handleMyCommand(ctx: BotContext) {
  await ctx.bot.sendMessage(ctx.chatId, "Hello from my command!");
}
```

**2. Register trong `src/lib/bot/handler.ts`:**
```typescript
import { handleMyCommand } from "./commands";

// trong switch(command):
case "/mycommand":
  await handleMyCommand(ctx);
  break;
```

### Thêm inline button

**Trong `src/lib/bot/callbacks.ts`:**
```typescript
case "my_button":
  await bot.editMessageText("Button clicked!", {
    chat_id: chatId,
    message_id: messageId,
  });
  break;
```

**Gửi button từ command:**
```typescript
await bot.sendMessage(chatId, "Choose:", {
  reply_markup: {
    inline_keyboard: [[
      { text: "Click me", callback_data: "my_button" }
    ]]
  }
});
```

### Xử lý tin nhắn thường (non-command)

Trong `src/lib/bot/handler.ts`, tìm comment `// Non-command messages` và thêm logic vào.

---

## 🔧 Dev local

```bash
npm run dev
```

> Lưu ý: Khi dev local, bot sẽ không nhận được updates vì Telegram không gọi được localhost.
> Dùng [ngrok](https://ngrok.com/) để expose localhost:
> ```bash
> ngrok http 3000
> # Lấy URL ngrok → set vào NEXT_PUBLIC_APP_URL → chạy set-webhook
> ```

---

## 📋 API Endpoints

| Endpoint | Method | Mô tả |
|---|---|---|
| `/api/bot/webhook` | POST | Nhận Telegram updates |
| `/api/bot/webhook` | GET | Health check |
| `/api/bot/setup` | GET | Xem webhook info |
| `/api/bot/setup` | POST | Set webhook |
| `/api/bot/setup` | DELETE | Xóa webhook |
| `/api/bot/broadcast` | POST | Gửi tin hàng loạt |

---

## ⚠️ Tại sao không dùng polling trên Vercel?

Vercel là **serverless** — function chỉ sống khi có request, sau đó bị kill. Polling cần process chạy liên tục, không thể làm được. **Webhook** là giải pháp đúng: Telegram chủ động gọi vào API của bạn mỗi khi có tin nhắn mới.

// src/app/api/bot/webhook/route.ts
// Telegram gọi endpoint này mỗi khi có update mới

import { NextRequest, NextResponse } from "next/server";
import { handleUpdate, notifyAdmin } from "@/lib/bot/handler";
import TelegramBot from "node-telegram-bot-api";

// Verify request thật sự từ Telegram via secret token
function verifySecret(req: NextRequest): boolean {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) return true; // Bỏ qua nếu chưa set (dev mode)

  const tokenHeader = req.headers.get("x-telegram-bot-api-secret-token");
  return tokenHeader === secret;
}

export async function POST(req: NextRequest) {
  // Security check
  if (!verifySecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const update: TelegramBot.Update = await req.json();
    await handleUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Webhook] Error processing update:", error);
    await notifyAdmin(error as Error);
    // Luôn trả 200 về Telegram để nó không retry liên tục
    return NextResponse.json({ ok: true });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    bot: "running",
    mode: "webhook",
    timestamp: new Date().toISOString(),
  });
}

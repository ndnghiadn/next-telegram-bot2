// src/app/api/bot/setup/route.ts
// Gọi endpoint này để register/xóa webhook với Telegram

import { NextRequest, NextResponse } from "next/server";

function checkAdminAuth(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-password");
  return auth === process.env.ADMIN_PASSWORD;
}

// GET /api/bot/setup — lấy thông tin webhook hiện tại
export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 500 });
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  const data = await res.json();
  return NextResponse.json(data);
}

// POST /api/bot/setup — set webhook
export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const secret = process.env.WEBHOOK_SECRET;

  if (!token) return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 500 });
  if (!appUrl) return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL not set" }, { status: 500 });

  const webhookUrl = `${appUrl}/api/bot/webhook`;

  const body: Record<string, string> = { url: webhookUrl };
  if (secret) body["secret_token"] = secret;

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json({ ...data, webhook_url: webhookUrl });
}

// DELETE /api/bot/setup — xóa webhook (dùng khi muốn test local với polling)
export async function DELETE(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 500 });

  const res = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
  const data = await res.json();
  return NextResponse.json(data);
}

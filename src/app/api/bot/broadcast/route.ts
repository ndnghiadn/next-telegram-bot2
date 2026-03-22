// src/app/api/bot/broadcast/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getBot } from "@/lib/bot/client";

function checkAdminAuth(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-password");
  return auth === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chatIds, message } = await req.json();

  if (!message || !Array.isArray(chatIds) || chatIds.length === 0) {
    return NextResponse.json({ error: "chatIds[] and message are required" }, { status: 400 });
  }

  const bot = getBot();
  const results = { success: 0, failed: 0 };

  for (const chatId of chatIds) {
    try {
      await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
      results.success++;
    } catch {
      results.failed++;
    }
  }

  return NextResponse.json({ ok: true, ...results });
}

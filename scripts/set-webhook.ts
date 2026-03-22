#!/usr/bin/env ts-node
// scripts/set-webhook.ts
// Chạy: npx ts-node scripts/set-webhook.ts
// Dùng sau khi deploy lần đầu để register webhook URL với Telegram

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const SECRET = process.env.WEBHOOK_SECRET;

if (!TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN is not set in .env.local");
  process.exit(1);
}
if (!APP_URL) {
  console.error("❌ NEXT_PUBLIC_APP_URL is not set in .env.local");
  process.exit(1);
}

const webhookUrl = `${APP_URL}/api/bot/webhook`;

async function main() {
  console.log(`\n🔧 Setting webhook...`);
  console.log(`   URL: ${webhookUrl}\n`);

  const body: Record<string, string> = { url: webhookUrl };
  if (SECRET) body["secret_token"] = SECRET;

  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (data.ok) {
    console.log("✅ Webhook set successfully!");
    console.log(`   ${data.description}`);
  } else {
    console.error("❌ Failed:", data.description);
    process.exit(1);
  }

  // Verify
  const info = await fetch(`https://api.telegram.org/bot${TOKEN}/getWebhookInfo`);
  const infoData = await info.json();
  console.log("\n📋 Current webhook info:");
  console.log(`   URL: ${infoData.result?.url}`);
  console.log(`   Pending updates: ${infoData.result?.pending_update_count}`);
  if (infoData.result?.last_error_message) {
    console.warn(`   ⚠️  Last error: ${infoData.result.last_error_message}`);
  }
  console.log("\n🚀 Bot is live! Try sending /start to your bot.\n");
}

main().catch((e) => {
  console.error("❌ Error:", e.message);
  process.exit(1);
});

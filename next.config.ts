import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node-telegram-bot-api dùng một số Node built-ins
  serverExternalPackages: ["node-telegram-bot-api"],
};

export default nextConfig;

require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "change_this_secret",
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
  telegramMiniAppUrl: process.env.TELEGRAM_MINI_APP_URL || "",
  // Blockchain config
  rpcUrl: process.env.RPC_URL || "",
  privateKey: process.env.PRIVATE_KEY || "",
  factoryAddress:
    process.env.FACTORY_ADDRESS || "0x046700ae667B9bB6855b02D4a5996Dc2dadf400d",
};

require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'change_this_secret',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramMiniAppUrl: process.env.TELEGRAM_MINI_APP_URL || ''};

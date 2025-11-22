const TelegramBot = require("node-telegram-bot-api");
const config = require("../config/config");

let bot = null;

exports.initBot = () => {
  if (!config.telegramBotToken) {
    console.warn(
      "⚠️  TELEGRAM_BOT_TOKEN not set. Skipping bot initialization."
    );
    return null;
  }

  bot = new TelegramBot(config.telegramBotToken, { polling: true });

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "¡Hola! Bienvenido al MultiVault Bot 🚀");
  });

  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      "Comandos disponibles:\n/start - Iniciar bot\n/help - Ver ayuda"
    );
  });

  bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text && text.startsWith("/")) return;

    console.log(`Mensaje recibido de ${chatId}: ${text}`);
  });

  console.log("✅ Telegram bot initialized");
  return bot;
};

exports.getBot = () => bot;

exports.sendMessage = (chatId, text) => {
  if (!bot) {
    throw new Error("Bot not initialized");
  }
  return bot.sendMessage(chatId, text);
};

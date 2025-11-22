const TelegramBot = require("node-telegram-bot-api");
const config = require("../config/config");
require("dotenv").config();

const { CdpClient } = require("@coinbase/cdp-sdk");

const cdp = new CdpClient();

let bot = null;

exports.initBot = () => {
  if (!config.telegramBotToken) {
    console.warn("TELEGRAM_BOT_TOKEN not set. Skipping bot initialization.");
    return null;
  }

  bot = new TelegramBot(config.telegramBotToken, { polling: true });

  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || "there";

    const userId = msg.from.id;

    const userWallet = await cdp.evm.getOrCreateAccount({
      name: `${userId}`,
    });

    const welcomeMessage = `👋 Hey ${firstName} \\!
Welcome to *MultiVault* — the transparent and democratic way to manage money with your group\\.

Your wallet address is \\(click to copy\\):
\`${userWallet.address}\` 

💰 *What is MultiVault?*
It helps families, friends, neighbors or teams pool money **without trusting a single person**\\.  
Everyone can see deposits, vote on expenses, and control the fund together\\.

✨ *What can you do here?*
• Create a community fund  
• Invite members easily  
• Let everyone contribute freely  
• Propose and vote on any expense  
• See all deposits and spending in real time  

💡 *Available Commands:*
\\/app \\- Open MultiVault app  
\\/help \\- Get help and support  
\\/start \\- Show this welcome message  

Ready to dive in\\? Tap the button below 👇`;

    const opts = {
      parse_mode: "MarkdownV2",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🚀 Launch MultiVault",
              web_app: { url: config.telegramMiniAppUrl },
            },
          ],
        ],
      },
    };

    bot.sendMessage(chatId, welcomeMessage, opts);
  });

  bot.onText(/\/app/, (msg) => {
    const chatId = msg.chat.id;

    const appMessage = `🚀 *Opening MultiVault...*

    Tap the button below to launch the app:`;

    const opts = {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🚀 Launch MultiVault",
              web_app: { url: config.telegramMiniAppUrl },
            },
          ],
        ],
      },
    };

    bot.sendMessage(chatId, appMessage, opts);
  });

  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `🆘 *Need Help?*

    *Available Commands:*
    /app - Open the MultiVault app
    /help - Show this help message
    /start - Return to the welcome screen`;

    bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
  });

  bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text && text.startsWith("/")) return;

    console.log(`Message received from ${chatId}: ${text}`);
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

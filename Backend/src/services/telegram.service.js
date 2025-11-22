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

  //Ver saldos,historial
  //crear wallet
  //hacer propuesta
  //votar
  bot.onText(/\/ownwallet/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      // Crear o recuperar wallet
      const userWallet = await cdp.evm.getOrCreateAccount({
        name: `${userId}`,
      });

      // ETH nativo en CDP siempre usa este pseudo-address
      const ETH_NATIVE_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

      // Obtener balances
      const result = await cdp.evm.listTokenBalances({
        address: userWallet.address,
        network: "base-sepolia",
      });

      // Encontrar balance de ETH
      const eth = result.balances.find(
        (b) => b.token.contractAddress === ETH_NATIVE_ADDRESS
      );

      let balanceInEth = 0;

      if (eth) {
        const raw = BigInt(eth.amount.amount);
        const decimals = Number(eth.amount.decimals);
        balanceInEth = Number(raw) / 10 ** decimals;
      }

      // --- Transacciones (si quieres activarlas luego) ---
      // let transactions = [];
      // try {
      //   transactions = await cdp.evm.listTransactions({
      //     address: userWallet.address,
      //     network: "base-sepolia",
      //     limit: 5,
      //   });
      // } catch (err) {
      //   console.log("Error retrieving transactions:", err);
      // }

      // Construcción del mensaje final
      let walletMessage = `💰 *Your Wallet*\n\n`;
      walletMessage += `📍 Address: \`${userWallet.address}\`\n\n`;
      walletMessage += `💵 Balance: *${balanceInEth.toFixed(6)} USDC*\n\n`;

      // Sin transacciones por ahora (comentaste código)
      // walletMessage += `📊 No recent transactions found.`;

      bot.sendMessage(chatId, walletMessage, {
        parse_mode: "Markdown",
      });
    } catch (error) {
      console.error("Error fetching wallet info:", error);

      bot.sendMessage(
        chatId,
        `❌ Error retrieving wallet information. Please try again later.`,
        {
          parse_mode: "Markdown",
        }
      );
    }
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

const TelegramBot = require("node-telegram-bot-api");
const config = require("../config/config");
require("dotenv").config();

const { CdpClient } = require("@coinbase/cdp-sdk");
const { getOrCreateUser, checkWalletAddressesExist } = require("../utils");
const blockchainService = require("./blockchain.service");

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

    const user = await getOrCreateUser(userId, chatId, userWallet.address);

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
/createvault - Create a new community wallet
/myvaults - View your community wallets
/ownwallet - View your personal wallet
/help - Show this help message
/start - Return to the welcome screen`;

    bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
  }); //Ver saldos,historial
  //crear wallet
  //hacer propuesta
  //votar

  // Crear Community Vault
  bot.onText(/\/createvault/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const userWallet = await cdp.evm.getOrCreateAccount({
        name: `${userId}`,
      });

      const instructionsMessage = `🏦 *Create Community Wallet*

To create a new community wallet, reply with the following format:

\`name|address1,address2\`

*Example:*
\`Family Fund|0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb,0x123...\`

*Important:*
• Name: Give your community wallet a descriptive name
• Addresses: Include at least 1 other member address (your address will be added automatically)
• Separate addresses with commas (no spaces)
• All addresses must be registered users in the app

💡 *Note:* Your address (${userWallet.address}) will be included automatically!`;

      bot.sendMessage(chatId, instructionsMessage, {
        parse_mode: "Markdown",
        reply_markup: {
          force_reply: true,
        },
      });
    } catch (error) {
      console.error("Error in /createvault:", error);
      bot.sendMessage(
        chatId,
        "❌ Error preparing vault creation. Please try again."
      );
    }
  });

  // Ver mis vaults
  bot.onText(/\/myvaults/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const userWallet = await cdp.evm.getOrCreateAccount({
        name: `${userId}`,
      });

      const vaultAddresses = await blockchainService.getUserVaults(
        userWallet.address
      );

      if (vaultAddresses.length === 0) {
        bot.sendMessage(
          chatId,
          `📭 *No Community Wallets Found*\n\nYou are not a member of any community wallets yet.\n\nUse /createvault to create your first one!`,
          { parse_mode: "Markdown" }
        );
        return;
      }

      let message = `🏦 *Your Community Wallets* (${vaultAddresses.length})\n\n`;

      for (let i = 0; i < vaultAddresses.length; i++) {
        try {
          const vaultInfo = await blockchainService.getVaultInfo(
            vaultAddresses[i]
          );
          message += `${i + 1}. *${vaultInfo.name}*\n`;
          message += `   💰 Balance: ${vaultInfo.balance} ETH\n`;
          message += `   👥 Members: ${vaultInfo.memberCount}\n`;
          message += `   📝 Proposals: ${vaultInfo.proposalCounter}\n`;
          message += `   📍 Address: \`${vaultInfo.address}\`\n\n`;
        } catch (err) {
          console.error(
            `Error getting vault info for ${vaultAddresses[i]}:`,
            err
          );
          message += `${i + 1}. \`${
            vaultAddresses[i]
          }\`\n   ⚠️ Could not load details\n\n`;
        }
      }

      message += `\n💡 Use the MiniApp to manage your vaults: /app`;

      bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    } catch (error) {
      console.error("Error in /myvaults:", error);
      bot.sendMessage(
        chatId,
        "❌ Error loading your vaults. Please try again later."
      );
    }
  });

  bot.onText(/\/ownwallet/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      // Crear o recuperar wallet
      const userWallet = await cdp.evm.getOrCreateAccount({
        name: `${userId}`,
      });

      // USDC nativo en CDP siempre usa este pseudo-address
      const USDC_NATIVE_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

      // Obtener balances
      const result = await cdp.evm.listTokenBalances({
        address: userWallet.address,
        network: "base-sepolia",
      });

      // Encontrar balance de USDC
      const usdc = result.balances.find(
        (b) => b.token.contractAddress === USDC_NATIVE_ADDRESS
      );

      let balanceInUsdc = 0;

      if (usdc) {
        const raw = BigInt(usdc.amount.amount);
        const decimals = Number(usdc.amount.decimals);
        balanceInUsdc = Number(raw) / 10 ** decimals;
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
      walletMessage += `💵 Balance: *${balanceInUsdc.toFixed(6)} USDC*\n\n`;

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

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text && text.startsWith("/")) return;

    // Check if this is a reply to the createvault command
    if (
      msg.reply_to_message &&
      msg.reply_to_message.text &&
      msg.reply_to_message.text.includes("Create Community Wallet")
    ) {
      try {
        const userId = msg.from.id;

        // Get creator's wallet
        const userWallet = await cdp.evm.getOrCreateAccount({
          name: `${userId}`,
        });

        // Parse the format: name|address1,address2
        const parts = text.split("|");
        if (parts.length !== 2) {
          bot.sendMessage(
            chatId,
            "❌ Invalid format. Please use: `name|address1,address2`",
            { parse_mode: "Markdown" }
          );
          return;
        }

        const name = parts[0].trim();
        let invitedAddresses = parts[1]
          .split(",")
          .map((addr) => addr.trim().toLowerCase());

        if (!name) {
          bot.sendMessage(chatId, "❌ Vault name cannot be empty.");
          return;
        }

        if (invitedAddresses.length < 1) {
          bot.sendMessage(
            chatId,
            "❌ You need at least 1 other member address."
          );
          return;
        }

        // Validate addresses format
        const invalidAddresses = invitedAddresses.filter(
          (addr) => !addr.startsWith("0x") || addr.length !== 42
        );
        if (invalidAddresses.length > 0) {
          bot.sendMessage(
            chatId,
            `❌ Invalid addresses detected. All addresses must start with 0x and be 42 characters long.\n\nInvalid: ${invalidAddresses.join(
              ", "
            )}`
          );
          return;
        }

        // Check if addresses are registered in the database
        bot.sendMessage(chatId, "🔍 Verifying addresses...");

        const addressChecks = await checkWalletAddressesExist(invitedAddresses);
        const unregisteredAddresses = addressChecks.filter(
          (check) => !check.exists
        );

        if (unregisteredAddresses.length > 0) {
          const unregisteredList = unregisteredAddresses
            .map((check) => check.address)
            .join("\n");
          bot.sendMessage(
            chatId,
            `❌ *Registration Required*\n\nThe following addresses are not registered in MultiVault:\n\n${unregisteredList}\n\nAll members must use /start in this bot first to register their wallet.`,
            { parse_mode: "Markdown" }
          );
          return;
        }

        // Add creator's address to the list
        const allAddresses = [
          ...invitedAddresses,
          userWallet.address.toLowerCase(),
        ];

        // Remove duplicates
        const uniqueAddresses = [...new Set(allAddresses)];

        bot.sendMessage(
          chatId,
          "⏳ Creating your community wallet... This may take a moment."
        );

        const result = await blockchainService.createVault(
          name,
          uniqueAddresses
        );

        if (result.success) {
          const successMessage = `✅ *Community Wallet Created!*

*Name:* ${name}
*Members:* ${uniqueAddresses.length}
*Vault Address:* \`${result.vaultAddress}\`
*Transaction:* \`${result.txHash}\`

🎉 Your community wallet is ready! All members can now deposit funds and create proposals.

💡 Use /myvaults to see all your community wallets`;

          bot.sendMessage(chatId, successMessage, { parse_mode: "Markdown" });
        } else {
          bot.sendMessage(
            chatId,
            "❌ Failed to create vault. Please try again."
          );
        }
      } catch (error) {
        console.error("Error creating vault:", error);
        bot.sendMessage(
          chatId,
          `❌ Error creating vault: ${error.message}\n\nPlease check the addresses and try again.`
        );
      }
      return;
    }

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

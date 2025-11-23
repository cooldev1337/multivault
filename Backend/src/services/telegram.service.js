const TelegramBot = require("node-telegram-bot-api");
const config = require("../config/config");
require("dotenv").config();

const { ethers } = require("ethers");
const { CdpClient } = require("@coinbase/cdp-sdk");
const {
  getOrCreateUser,
  checkWalletAddressesExist,
  getUsersByWalletAddresses,
  addMetaToVault,
} = require("../utils");
const blockchainService = require("./blockchain.service");
const { uploadTxtToStorage } = require("../utils/filecoin");

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

    try {
      // Crear owner EOA (solo para firmar)
      const owner = await cdp.evm.getOrCreateAccount({
        name: `${userId}-owner`,
      });

      console.log(`Owner address for user ${userId}: ${owner.address}`);

      // Crear Smart Account (gasless)
      const smartAccount = await cdp.evm.getOrCreateSmartAccount({
        name: `${userId}-v2`,
        owner,
      });

      console.log(`Smart Account for user ${userId}: ${smartAccount.address}`);

      // // Dar USDC gratis (no necesita ETH porque es gasless)
      // try {
      //   await cdp.evm.requestFaucet({
      //     address: smartAccount.address,
      //     network: "base-sepolia",
      //     token: "usdc",
      //   });
      //   // console.log(`USDC faucet sent to Smart Account ${smartAccount.address}`);
      // } catch (faucetError) {
      //   console.error("Error requesting faucet:", faucetError);
      // }

      const user = await getOrCreateUser(userId, chatId, smartAccount.address);

      const welcomeMessage = `👋 Hey ${firstName} \\!
    Welcome to *MultiVault* — the transparent and democratic way to manage money with your group\\.

    Your wallet address is \\(click to copy\\):
    \`${smartAccount.address}\` 

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
    } catch (error) {
      console.error("Error in /start command:", error);
      bot.sendMessage(
        chatId,
        `❌ Error initializing wallet: ${error.message}\n\nPlease contact support.`
      );
    }
  });

  bot.onText(/\/app/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      // Crear owner y Smart Account
      const owner = await cdp.evm.getOrCreateAccount({
        name: `${userId}-owner`,
      });
      const smartAccount = await cdp.evm.getOrCreateSmartAccount({
        name: `${userId}-v2`,
        owner,
      });

      // Asegurar que el usuario exista en la base de datos
      await getOrCreateUser(userId, chatId, smartAccount.address);

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
    } catch (error) {
      console.error("Error in /app:", error);
      bot.sendMessage(chatId, "❌ Error opening app. Please try /start first.");
    }
  });

  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `🆘 *Need Help?*

*Available Commands:*
/app - Open the MultiVault app
/createvault - Create a new community wallet
/myvaults - View your community wallets
/withdraw - Withdraw USDC from your wallet
/ownwallet - View your personal wallet
/propose - Create a withdrawal proposal
/proposals - View proposals in your vaults
/vote - Vote on a proposal
/help - Show this help message
/start - Return to the welcome screen`;

    bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
  });

  // Crear Community Vault
  bot.onText(/\/createvault/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const owner = await cdp.evm.getOrCreateAccount({
        name: `${userId}-owner`,
      });
      const smartAccount = await cdp.evm.getOrCreateSmartAccount({
        name: `${userId}-v2`,
        owner,
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

💡 *Note:* Your address (${smartAccount.address}) will be included automatically!`;

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
      const owner = await cdp.evm.getOrCreateAccount({
        name: `${userId}-owner`,
      });
      const smartAccount = await cdp.evm.getOrCreateSmartAccount({
        name: `${userId}-v2`,
        owner,
      });

      const vaultAddresses = await blockchainService.getUserVaults(
        smartAccount.address
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
          message += `   💰 Balance: ${vaultInfo.balance} USDC\n`;
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
  // Retirar USDC (de wallet personal o a vault comunitario)
  bot.onText(/\/withdraw/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const owner = await cdp.evm.getOrCreateAccount({
        name: `${userId}-owner`,
      });
      const smartAccount = await cdp.evm.getOrCreateSmartAccount({
        name: `${userId}-v2`,
        owner,
      });

      const instructionsMessage = `💸 *Withdraw USDC*

You can withdraw USDC from your personal wallet to any address (including community wallets).

Reply with the format:
\`recipient_address|amount\`

*Examples:*
\`0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb|10\`
(Send 10 USDC to an address)

*Your wallet:* \`${smartAccount.address}\`

💡 *Tip:* Use /myvaults to see your community wallet addresses!`;

      bot.sendMessage(chatId, instructionsMessage, {
        parse_mode: "Markdown",
        reply_markup: {
          force_reply: true,
        },
      });
    } catch (error) {
      console.error("Error in /withdraw:", error);
      bot.sendMessage(
        chatId,
        "❌ Error preparing withdrawal. Please try again."
      );
    }
  });

  bot.onText(/\/ownwallet/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      // Crear owner y Smart Account
      const owner = await cdp.evm.getOrCreateAccount({
        name: `${userId}-owner`,
      });
      const smartAccount = await cdp.evm.getOrCreateSmartAccount({
        name: `${userId}-v2`,
        owner,
      });

      // USDC nativo en CDP siempre usa este pseudo-address
      const USDC_NATIVE_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

      // Obtener balances
      const result = await cdp.evm.listTokenBalances({
        address: smartAccount.address,
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
      let walletMessage = `💰 *Your Smart Wallet* (Gasless)\n\n`;
      walletMessage += `📍 Address: \`${smartAccount.address}\`\n\n`;
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

  // Crear propuesta de retiro
  bot.onText(/\/propose/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const owner = await cdp.evm.getOrCreateAccount({
        name: `${userId}-owner`,
      });
      const smartAccount = await cdp.evm.getOrCreateSmartAccount({
        name: `${userId}-v2`,
        owner,
      });

      const instructionsMessage = `📝 *Create Withdrawal Proposal*

To create a withdrawal proposal, reply with the format:

\`vault_address|recipient|amount|description\`

*Example:*
\`0x123...|0x456...|10|Team payment\`

*Important:*
• Vault Address: The community wallet address (use /myvaults to see)
• Recipient: Address to receive the funds
• Amount: Amount in USDC
• Description: Reason for withdrawal
• Only ONE proposal can be active at a time per vault

💡 All vault members will be notified to vote!`;

      bot.sendMessage(chatId, instructionsMessage, {
        parse_mode: "Markdown",
        reply_markup: {
          force_reply: true,
        },
      });
    } catch (error) {
      console.error("Error in /propose:", error);
      bot.sendMessage(chatId, "❌ Error preparing proposal. Please try again.");
    }
  });

  // Ver propuestas de los vaults
  bot.onText(/\/proposals/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const owner = await cdp.evm.getOrCreateAccount({
        name: `${userId}-owner`,
      });
      const smartAccount = await cdp.evm.getOrCreateSmartAccount({
        name: `${userId}-v2`,
        owner,
      });

      const vaultAddresses = await blockchainService.getUserVaults(
        smartAccount.address
      );

      if (vaultAddresses.length === 0) {
        bot.sendMessage(
          chatId,
          `📭 *No Community Wallets Found*\n\nYou are not a member of any community wallets yet.`,
          { parse_mode: "Markdown" }
        );
        return;
      }

      let message = `📋 *Active Proposals*\n\n`;
      let hasProposals = false;

      for (const vaultAddress of vaultAddresses) {
        try {
          const vaultInfo = await blockchainService.getVaultInfo(vaultAddress);

          if (vaultInfo.proposalCounter > 0) {
            message += `🏦 *${vaultInfo.name}*\n`;
            message += `📍 \`${vaultAddress}\`\n\n`;

            // Revisar cada propuesta (empezando desde 0)
            for (let i = 0; i < vaultInfo.proposalCounter; i++) {
              try {
                const proposal = await blockchainService.getProposalInfo(
                  vaultAddress,
                  i
                );

                if (proposal.status === "PENDING") {
                  hasProposals = true;
                  message += `  📝 *Proposal #${i}*\n`;
                  message += `  Type: ${proposal.type}\n`;
                  message += `  Description: ${proposal.description}\n`;

                  if (proposal.type === "WITHDRAWAL") {
                    message += `  Recipient: \`${proposal.recipient}\`\n`;
                    message += `  Amount: ${proposal.amount} USDC\n`;
                  } else if (proposal.type === "ADD_MEMBER") {
                    message += `  New Member: \`${proposal.newMember}\`\n`;
                  }

                  message += `  👍 Votes For: ${proposal.votesFor}\n`;
                  message += `  👎 Votes Against: ${proposal.votesAgainst}\n`;
                  message += `  Status: ${proposal.status}\n\n`;
                }
              } catch (err) {
                console.error(
                  `Error getting proposal ${i} for ${vaultAddress}:`,
                  err
                );
              }
            }
          }
        } catch (err) {
          console.error(`Error getting vault info for ${vaultAddress}:`, err);
        }
      }

      if (!hasProposals) {
        message += `No pending proposals found.\n\n`;
        message += `💡 Use /propose to create a new proposal!`;
      } else {
        message += `💡 Use /vote to vote on a proposal!`;
      }

      bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    } catch (error) {
      console.error("Error in /proposals:", error);
      bot.sendMessage(
        chatId,
        "❌ Error loading proposals. Please try again later."
      );
    }
  });

  // Votar en una propuesta
  bot.onText(/\/vote/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const owner = await cdp.evm.getOrCreateAccount({
        name: `${userId}-owner`,
      });
      const smartAccount = await cdp.evm.getOrCreateSmartAccount({
        name: `${userId}-v2`,
        owner,
      });

      const instructionsMessage = `🗳️ *Vote on Proposal*

To vote on a proposal, reply with the format:

\`vault_address|proposal_id|yes/no\`

*Example:*
\`0x123...|0|yes\`

*Important:*
• Vault Address: The community wallet address (use /proposals to see)
• Proposal ID: The proposal number
• Vote: Type "yes" to approve or "no" to reject

💡 Use /proposals to see all pending proposals!`;

      bot.sendMessage(chatId, instructionsMessage, {
        parse_mode: "Markdown",
        reply_markup: {
          force_reply: true,
        },
      });
    } catch (error) {
      console.error("Error in /vote:", error);
      bot.sendMessage(chatId, "❌ Error preparing vote. Please try again.");
    }
  });

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text && text.startsWith("/")) return;

    // Check if this is a reply to the withdraw command
    if (
      msg.reply_to_message &&
      msg.reply_to_message.text &&
      msg.reply_to_message.text.includes("Withdraw USDC")
    ) {
      try {
        const userId = msg.from.id;
        const owner = await cdp.evm.getOrCreateAccount({
          name: `${userId}-owner`,
        });
        const smartAccount = await cdp.evm.getOrCreateSmartAccount({
          name: `${userId}-v2`,
          owner,
        });

        // Parse the format: recipient_address|amount
        const parts = text.split("|");
        if (parts.length !== 2) {
          bot.sendMessage(
            chatId,
            "❌ Invalid format. Please use: `recipient_address|amount`\nExample: `0x742...|10`",
            { parse_mode: "Markdown" }
          );
          return;
        }

        const recipientAddress = parts[0].trim();
        const amount = parts[1].trim();

        // Validate recipient address
        if (
          !recipientAddress.startsWith("0x") ||
          recipientAddress.length !== 42
        ) {
          bot.sendMessage(
            chatId,
            "❌ Invalid recipient address. Must start with 0x and be 42 characters long."
          );
          return;
        }

        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
          bot.sendMessage(chatId, "❌ Invalid amount. Must be greater than 0.");
          return;
        }

        bot.sendMessage(
          chatId,
          `⏳ Processing withdrawal of ${amount} USDC to ${recipientAddress}...\n\n✨ GASLESS - No gas fees!`
        );

        // Transferir usando Smart Account (GASLESS)
        try {
          const usdcAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
          const decimals = 6;
          const usdcAmount = ethers.parseUnits(amount, decimals);

          const erc20Interface = new ethers.Interface([
            "function transfer(address to, uint256 value)",
          ]);

          const data = erc20Interface.encodeFunctionData("transfer", [
            recipientAddress,
            usdcAmount,
          ]);

          // GASLESS: sendUserOperation con Smart Account
          const userOp = await cdp.evm.sendUserOperation({
            smartAccount,
            network: "base-sepolia",
            calls: [
              {
                to: usdcAddress,
                data,
                value: 0n,
              },
            ],
          });

          const successMessage = `✅ *Withdrawal Successful!*

*Amount:* ${amount} USDC
*To:* \`${recipientAddress}\`
*UserOperation:* \`${userOp.userOpHash}\`
✨ *Gas Fee:* FREE (Sponsored by Coinbase)

🎉 Your withdrawal has been completed!

💡 Use /ownwallet to check your balance`;

          bot.sendMessage(chatId, successMessage, { parse_mode: "Markdown" });
        } catch (transferError) {
          console.error("Transfer error:", transferError);
          throw transferError;
        }
      } catch (error) {
        console.error("Error processing withdrawal:", error);
        bot.sendMessage(
          chatId,
          `❌ Error processing withdrawal: ${error.message}\n\nPlease make sure you have enough USDC balance.`
        );
      }
      return;
    }

    // Check if this is a reply to the createvault command
    if (
      msg.reply_to_message &&
      msg.reply_to_message.text &&
      msg.reply_to_message.text.includes("Create Community Wallet")
    ) {
      try {
        const userId = msg.from.id;

        // Get creator's Smart Account
        const owner = await cdp.evm.getOrCreateAccount({
          name: `${userId}-owner`,
        });
        const smartAccount = await cdp.evm.getOrCreateSmartAccount({
          name: `${userId}-v2`,
          owner,
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
        const creatorAddress = smartAccount.address.toLowerCase();
        let invitedAddresses = parts[1]
          .split(",")
          .map((addr) => addr.trim().toLowerCase())
          .filter((addr) => addr !== creatorAddress); // Remove creator's address if included

        if (!name) {
          bot.sendMessage(chatId, "❌ Vault name cannot be empty.");
          return;
        }

        if (invitedAddresses.length < 1) {
          bot.sendMessage(
            chatId,
            "❌ You need at least 1 other member address (don't include your own)."
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

        // Add creator's address to the list (already filtered out if user included it)
        const allAddresses = [...invitedAddresses, creatorAddress];

        // uniqueAddresses will have creator + invited members
        const uniqueAddresses = [...new Set(allAddresses)];

        bot.sendMessage(
          chatId,
          "⏳ Creating your community wallet... This is GASLESS ✨"
        );

        const result = await blockchainService.createVault(
          name,
          uniqueAddresses,
          smartAccount,
          cdp
        );

        if (result.success) {
          const successMessage = `✅ *Community Wallet Created!*

*Name:* ${name}
*Members:* ${uniqueAddresses.length}
*Vault Address:* \`${result.vaultAddress || "Processing..."}\`
*UserOperation:* \`${result.userOpHash}\`
*Transaction:* \`${result.txHash}\`
✨ *Gas Fee:* FREE (Sponsored by Coinbase)

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
      
      const uploadResult = await uploadTxtToStorage(JSON.stringify({
        name,
        uniqueAddresses,
        memberCount: uniqueAddresses.length,
        owner: smartAccount.address,
      }));
      await addMetaToVault(userId, result.vaultAddress, uploadResult.pieceCid);
    }

    // Check if this is a reply to the propose command
    if (
      msg.reply_to_message &&
      msg.reply_to_message.text &&
      msg.reply_to_message.text.includes("Create Withdrawal Proposal")
    ) {
      try {
        const userId = msg.from.id;
        const owner = await cdp.evm.getOrCreateAccount({
          name: `${userId}-owner`,
        });
        const smartAccount = await cdp.evm.getOrCreateSmartAccount({
          name: `${userId}-v2`,
          owner,
        });

        // Parse: vault_address|recipient|amount|description
        const parts = text.split("|");
        if (parts.length !== 4) {
          bot.sendMessage(
            chatId,
            "❌ Invalid format. Please use: `vault_address|recipient|amount|description`",
            { parse_mode: "Markdown" }
          );
          return;
        }

        const vaultAddress = parts[0].trim();
        const recipient = parts[1].trim();
        const amount = parts[2].trim();
        const description = parts[3].trim();

        // Validar vault address
        if (!vaultAddress.startsWith("0x") || vaultAddress.length !== 42) {
          bot.sendMessage(
            chatId,
            "❌ Invalid vault address. Must start with 0x and be 42 characters long."
          );
          return;
        }

        // Validar recipient
        if (!recipient.startsWith("0x") || recipient.length !== 42) {
          bot.sendMessage(
            chatId,
            "❌ Invalid recipient address. Must start with 0x and be 42 characters long."
          );
          return;
        }

        // Validar amount
        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
          bot.sendMessage(chatId, "❌ Invalid amount. Must be greater than 0.");
          return;
        }

        // Verificar que el vault existe y obtener info
        const vaultInfo = await blockchainService.getVaultInfo(vaultAddress);

        // Verificar que solo hay una propuesta activa
        let hasPendingProposal = false;
        for (let i = 0; i < vaultInfo.proposalCounter; i++) {
          const proposal = await blockchainService.getProposalInfo(
            vaultAddress,
            i
          );
          if (proposal.status === "PENDING") {
            hasPendingProposal = true;
            bot.sendMessage(
              chatId,
              `❌ *Only One Active Proposal Allowed*\n\nThis vault already has a pending proposal (#${i}).\n\nPlease wait for it to be resolved before creating a new one.\n\nUse /proposals to see details.`,
              { parse_mode: "Markdown" }
            );
            return;
          }
        }

        bot.sendMessage(
          chatId,
          `⏳ Creating proposal GASLESS ✨... This may take a moment.`
        );

        const result = await blockchainService.proposeWithdrawal(
          vaultAddress,
          description,
          recipient,
          amount,
          smartAccount,
          cdp
        );

        if (result.success) {
          // Notificar a todos los miembros del vault
          try {
            const members = await getUsersByWalletAddresses(vaultInfo.members);

            const notificationMessage = `🔔 *New Proposal Created!*

*Vault:* ${vaultInfo.name}
*Proposal ID:* ${result.proposalId}
*Type:* Withdrawal
*Amount:* ${amount} USDC
*Recipient:* \`${recipient}\`
*Description:* ${description}

*Proposed by:* \`${smartAccount.address}\`
*Gas Fee:* FREE (Sponsored by Coinbase) ✨

💡 Use /vote to cast your vote!`;

            // Enviar notificación a cada miembro
            for (const member of members) {
              if (member.user !== userId.toString()) {
                // No notificar al creador
                try {
                  // Usar el tgChatId si existe, sino usar el user id
                  const memberChatId = member.tgChatId || member.user;
                  await bot.sendMessage(memberChatId, notificationMessage, {
                    parse_mode: "Markdown",
                  });
                } catch (notifError) {
                  console.error(
                    `Error sending notification to ${member.user}:`,
                    notifError
                  );
                }
              }
            }
          } catch (notifError) {
            console.error("Error sending notifications:", notifError);
          }

          const successMessage = `✅ *Proposal Created Successfully!*

*Vault:* ${vaultInfo.name}
*Proposal ID:* ${result.proposalId}
*Amount:* ${amount} USDC
*Recipient:* \`${recipient}\`
*UserOp Hash:* \`${result.userOpHash}\`
*Transaction:* \`${result.txHash}\`
*Gas Fee:* FREE (Sponsored by Coinbase) ✨

🔔 All vault members have been notified!

💡 Use /proposals to track voting progress`;

          bot.sendMessage(chatId, successMessage, { parse_mode: "Markdown" });
        } else {
          bot.sendMessage(
            chatId,
            "❌ Failed to create proposal. Please try again."
          );
        }
      } catch (error) {
        console.error("Error creating proposal:", error);
        bot.sendMessage(
          chatId,
          `❌ Error creating proposal: ${error.message}\n\nPlease verify the vault address and try again.`
        );
      }
      return;
    }

    // Check if this is a reply to the vote command
    if (
      msg.reply_to_message &&
      msg.reply_to_message.text &&
      msg.reply_to_message.text.includes("Vote on Proposal")
    ) {
      try {
        const userId = msg.from.id;
        const owner = await cdp.evm.getOrCreateAccount({
          name: `${userId}-owner`,
        });
        const smartAccount = await cdp.evm.getOrCreateSmartAccount({
          name: `${userId}-v2`,
          owner,
        });

        // Parse: vault_address|proposal_id|yes/no
        const parts = text.split("|");
        if (parts.length !== 3) {
          bot.sendMessage(
            chatId,
            "❌ Invalid format. Please use: `vault_address|proposal_id|yes/no`",
            { parse_mode: "Markdown" }
          );
          return;
        }

        const vaultAddress = parts[0].trim();
        const proposalId = parts[1].trim();
        const voteStr = parts[2].trim().toLowerCase();

        // Validar vault address
        if (!vaultAddress.startsWith("0x") || vaultAddress.length !== 42) {
          bot.sendMessage(
            chatId,
            "❌ Invalid vault address. Must start with 0x and be 42 characters long."
          );
          return;
        }

        // Validar proposal ID
        if (isNaN(parseInt(proposalId)) || parseInt(proposalId) < 0) {
          bot.sendMessage(chatId, "❌ Invalid proposal ID. Must be a number.");
          return;
        }

        // Validar vote
        if (voteStr !== "yes" && voteStr !== "no") {
          bot.sendMessage(chatId, "❌ Invalid vote. Must be 'yes' or 'no'.");
          return;
        }

        const inFavor = voteStr === "yes";

        // Verificar que no haya votado ya
        const hasVoted = await blockchainService.hasVoted(
          vaultAddress,
          parseInt(proposalId),
          smartAccount.address
        );

        if (hasVoted) {
          bot.sendMessage(
            chatId,
            "❌ You have already voted on this proposal."
          );
          return;
        }

        bot.sendMessage(
          chatId,
          `⏳ Submitting your vote GASLESS ✨... Please wait.`
        );

        const result = await blockchainService.vote(
          vaultAddress,
          parseInt(proposalId),
          inFavor,
          smartAccount,
          cdp
        );

        if (result.success) {
          // Obtener info actualizada de la propuesta
          const proposal = await blockchainService.getProposalInfo(
            vaultAddress,
            parseInt(proposalId)
          );

          const voteEmoji = inFavor ? "👍" : "👎";
          const successMessage = `✅ *Vote Submitted!*

${voteEmoji} You voted *${inFavor ? "YES" : "NO"}*

*Proposal #${proposalId}*
*Current Results:*
👍 Votes For: ${proposal.votesFor}
👎 Votes Against: ${proposal.votesAgainst}
*Status:* ${proposal.status}

*UserOp Hash:* \`${result.userOpHash}\`
*Transaction:* \`${result.txHash}\`
*Gas Fee:* FREE (Sponsored by Coinbase) ✨

💡 Use /proposals to see all proposals`;

          bot.sendMessage(chatId, successMessage, { parse_mode: "Markdown" });
        } else {
          bot.sendMessage(
            chatId,
            "❌ Failed to submit vote. Please try again."
          );
        }
      } catch (error) {
        console.error("Error voting:", error);
        bot.sendMessage(
          chatId,
          `❌ Error voting: ${error.message}\n\nPlease verify the vault address and proposal ID.`
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


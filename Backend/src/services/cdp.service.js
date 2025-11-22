const { Coinbase, Wallet } = require("@coinbase/coinbase-sdk");
const config = require("../config/config");

let coinbase = null;

/**
 * Initialize Coinbase CDP SDK
 */
exports.initCDP = async () => {
  try {
    if (!config.cdpApiKeyName || !config.cdpApiKeyPrivateKey) {
      console.warn("CDP credentials not set. Skipping CDP initialization.");
      return null;
    }

    // Configure Coinbase SDK with API credentials
    Coinbase.configureFromJson({
      apiKeyName: config.cdpApiKeyName,
      privateKey: config.cdpApiKeyPrivateKey,
    });

    coinbase = Coinbase;

    console.log("✅ Coinbase CDP initialized");
    return coinbase;
  } catch (error) {
    console.error("❌ Error initializing CDP:", error.message);
    throw error;
  }
};

/**
 * Create a new server-signer wallet for a user
 * This creates a wallet managed by Coinbase's servers (no seed phrase needed)
 * @param {string} telegramId - Telegram ID of the user
 * @returns {Promise<{walletId: string, address: string, networkId: string}>}
 */
exports.createWallet = async (telegramId) => {
  try {
    if (!coinbase) {
      await exports.initCDP();
    }

    // Create a server-signer wallet on Base Sepolia testnet
    // Server-signer wallets are managed by CDP servers, no seed phrase needed
    const wallet = await Wallet.create({
      networkId: Coinbase.networks.BaseSepolia,
    });

    // Get the default address
    const address = await wallet.getDefaultAddress();

    console.log(`✅ Server-signer wallet created for Telegram ID ${telegramId}:`, {
      walletId: wallet.getId(),
      address: address.getId(),
    });

    return {
      walletId: wallet.getId(),
      address: address.getId(),
      networkId: wallet.getNetworkId(),
    };
  } catch (error) {
    console.error("❌ Error creating wallet:", error.message);
    throw error;
  }
};

/**
 * Fetch an existing server-signer wallet
 * @param {string} walletId - Wallet ID
 * @returns {Promise<Wallet>}
 */
exports.fetchWallet = async (walletId) => {
  try {
    if (!coinbase) {
      await exports.initCDP();
    }

    // Fetch server-signer wallet from CDP
    const wallet = await Wallet.fetch(walletId);

    console.log(`✅ Wallet fetched: ${walletId}`);
    return wallet;
  } catch (error) {
    console.error("❌ Error fetching wallet:", error.message);
    throw error;
  }
};

/**
 * Get wallet balance
 * @param {string} walletId - Wallet ID
 * @returns {Promise<Object>}
 */
exports.getWalletBalance = async (walletId) => {
  try {
    const wallet = await exports.fetchWallet(walletId);
    const balances = await wallet.listBalances();

    return balances;
  } catch (error) {
    console.error("❌ Error getting wallet balance:", error.message);
    throw error;
  }
};

/**
 * Get wallet address
 * @param {string} walletId - Wallet ID
 * @returns {Promise<string>}
 */
exports.getWalletAddress = async (walletId) => {
  try {
    const wallet = await exports.fetchWallet(walletId);
    const address = await wallet.getDefaultAddress();

    return address.getId();
  } catch (error) {
    console.error("❌ Error getting wallet address:", error.message);
    throw error;
  }
};

exports.getCoinbase = () => coinbase;

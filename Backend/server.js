require("dotenv").config();
const express = require("express");
const config = require("./src/config/config");
const telegramService = require("./src/services/telegram.service");
const blockchainService = require("./src/services/blockchain.service");
const app = express();
const userRoutes = require("./src/routes/user.routes");
const telegramRoutes = require("./src/routes/telegram.routes");
const endpointRoutes = require("./src/routes/endpoint.routes");
const vaultRoutes = require("./src/routes/vault.routes");

// const { CdpClient } = require("@coinbase/cdp-sdk");

// const cdp = new CdpClient();

// Middlewares
app.use(express.json());

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/telegram", telegramRoutes);
app.use("/api/endpoint", endpointRoutes);
app.use("/api/vaults", vaultRoutes);

// Inicializar Telegram Bot
telegramService.initBot();

async function init() {
  //Ejemplo de como Crear cuenta EVM
  // const account = await cdp.evm.createAccount();
  // console.log(`Created EVM account: ${account.address}`);

  // const faucetResponse = await cdp.evm.requestFaucet({
  //   address: account.address,
  //   network: "base-sepolia",
  //   token: "eth",
  // });
  // console.log(
  //   `Requested funds from ETH faucet: https://sepolia.basescan.org/tx/${faucetResponse.transactionHash}`
  // );

  // const namedAccount = await cdp.evm.getOrCreateAccount({
  //   name: "MyAccount",
  // });
  // console.log(`Created account with name ${namedAccount.address}.`);

  // Inicializar blockchain service
  await blockchainService.initialize();

  // Inicializar servidor
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

init();

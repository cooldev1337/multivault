require("dotenv").config();
const express = require("express");
const config = require("./src/config/config");
const telegramService = require("./src/services/telegram.service");
const app = express();
const userRoutes = require("./src/routes/user.routes");
const telegramRoutes = require("./src/routes/telegram.routes");
const { CdpClient } = require("@coinbase/cdp-sdk");

const cdp = new CdpClient();

// Middlewares
app.use(express.json());

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/telegram", telegramRoutes);

// Inicializar Telegram Bot
telegramService.initBot();

async function init() {
  //Ejemplo de como Crear cuenta EVM
  const account = await cdp.evm.createAccount();
  console.log(`Created EVM account: ${account.address}`);

  const faucetResponse = await cdp.evm.requestFaucet({
    address: account.address,
    network: "ethereum-sepolia",
    token: "eth",
  });
  console.log(
    `Requested funds from ETH faucet: https://sepolia.basescan.org/tx/${faucetResponse.transactionHash}`
  );

  // Inicializar servidor
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

init();

require("dotenv").config();
const express = require("express");
const config = require("./src/config/config");
const telegramService = require("./src/services/telegram.service");
const app = express();
const userRoutes = require("./src/routes/user.routes");
const telegramRoutes = require("./src/routes/telegram.routes");
const fileCoinRoute = require("./src/routes/FileCoin.routes");

// Initialize Telegram Bot
//telegramService.initBot();

// Middlewares
app.use(express.json());

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/telegram", telegramRoutes);
app.use("/api/filecoin",fileCoinRoute)


// Inicializar servidor
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

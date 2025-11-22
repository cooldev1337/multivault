const telegramService = require("../services/telegram.service");

// Send a message via the bot (API endpoint)
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, message } = req.body;

    if (!chatId || !message) {
      return res.status(400).json({ error: "chatId and message are required" });
    }

    await telegramService.sendMessage(chatId, message);
    res.json({ success: true, message: "Message sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get bot status
exports.getBotStatus = (req, res) => {
  const bot = telegramService.getBot();
  res.json({
    status: bot ? "active" : "inactive",
    message: bot ? "Bot is running" : "Bot not initialized",
  });
};

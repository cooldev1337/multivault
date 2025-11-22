const express = require("express");
const router = express.Router();
const telegramController = require("../controllers/telegram.controller");

router.post("/send", telegramController.sendMessage);
router.get("/status", telegramController.getBotStatus);

module.exports = router;

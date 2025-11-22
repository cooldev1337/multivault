const express = require("express");
const router = express.Router();
const FileCoinController = require("../controllers/filecoin.controller");

router.get("/buy", FileCoinController.buy);
router.post("/upload", FileCoinController.upload);
router.get("/download", FileCoinController.download);

module.exports = router;

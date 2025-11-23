const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.post("/initialize-wallet", userController.initializeWallet);

module.exports = router;

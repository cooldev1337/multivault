const express = require("express");
const router = express.Router();
const endpointController = require("../controllers/endpoints.controller");

router.post("/getOrCreate", endpointController.getorCreateWallet);
router.get("/ListBalance", endpointController.listTokenBalances);
router.get("/getbalance", endpointController.getBalanceinusdc);

module.exports = router;

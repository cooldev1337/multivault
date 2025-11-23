const express = require("express");
const router = express.Router();
const vaultController = require("../controllers/vault.controller");

// Factory routes
router.post("/create", vaultController.createVault);
router.get("/all", vaultController.getAllVaults);
router.get("/user/:address", vaultController.getUserVaults);
router.get("/user/:address/details", vaultController.getUserVaultsWithDetails);

// Vault info routes
router.get("/:address", vaultController.getVaultInfo);
router.get("/:address/proposals/:proposalId", vaultController.getProposalInfo);
router.get(
  "/:address/proposals/:proposalId/has-voted/:voter",
  vaultController.hasVoted
);

// Vault action routes
router.post("/:address/deposit", vaultController.deposit);
router.post("/:address/propose-withdrawal", vaultController.proposeWithdrawal);
router.post("/:address/propose-add-member", vaultController.proposeAddMember);
router.post("/:address/vote", vaultController.vote);

module.exports = router;

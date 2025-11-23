const blockchainService = require("../services/blockchain.service");

/**
 * Crea una nueva community vault
 * POST /api/vaults/create
 * Body: { name: string, members: string[] }
 */
exports.createVault = async (req, res) => {
  try {
    const { name, members } = req.body;

    if (!name || !members || !Array.isArray(members)) {
      return res.status(400).json({
        success: false,
        error: "Name and members array are required",
      });
    }

    if (members.length < 2) {
      return res.status(400).json({
        success: false,
        error: "At least 2 members are required",
      });
    }

    const result = await blockchainService.createVault(name, members);

    res.json({
      success: true,
      message: "Vault created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in createVault controller:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Obtiene todas las vaults de un usuario
 * GET /api/vaults/user/:address
 */
exports.getUserVaults = async (req, res) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: "User address is required",
      });
    }

    const vaults = await blockchainService.getUserVaults(address);

    res.json({
      success: true,
      data: {
        userAddress: address,
        vaults,
        count: vaults.length,
      },
    });
  } catch (error) {
    console.error("Error in getUserVaults controller:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Obtiene información detallada de las vaults de un usuario
 * GET /api/vaults/user/:address/details
 */
exports.getUserVaultsWithDetails = async (req, res) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: "User address is required",
      });
    }

    const vaultAddresses = await blockchainService.getUserVaults(address);

    const vaultsDetails = await Promise.all(
      vaultAddresses.map(async (vaultAddr) => {
        try {
          return await blockchainService.getVaultInfo(vaultAddr);
        } catch (err) {
          console.error(`Error getting info for vault ${vaultAddr}:`, err);
          return null;
        }
      })
    );

    const validVaults = vaultsDetails.filter((v) => v !== null);

    res.json({
      success: true,
      data: {
        userAddress: address,
        vaults: validVaults,
        count: validVaults.length,
      },
    });
  } catch (error) {
    console.error("Error in getUserVaultsWithDetails controller:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Obtiene todas las vaults creadas
 * GET /api/vaults/all
 */
exports.getAllVaults = async (req, res) => {
  try {
    const vaults = await blockchainService.getAllVaults();

    res.json({
      success: true,
      data: {
        vaults,
        count: vaults.length,
      },
    });
  } catch (error) {
    console.error("Error in getAllVaults controller:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Obtiene información de una vault específica
 * GET /api/vaults/:address
 */
exports.getVaultInfo = async (req, res) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: "Vault address is required",
      });
    }

    const vaultInfo = await blockchainService.getVaultInfo(address);

    res.json({
      success: true,
      data: vaultInfo,
    });
  } catch (error) {
    console.error("Error in getVaultInfo controller:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Obtiene información de una propuesta
 * GET /api/vaults/:address/proposals/:proposalId
 */
exports.getProposalInfo = async (req, res) => {
  try {
    const { address, proposalId } = req.params;

    if (!address || proposalId === undefined) {
      return res.status(400).json({
        success: false,
        error: "Vault address and proposal ID are required",
      });
    }

    const proposalInfo = await blockchainService.getProposalInfo(
      address,
      parseInt(proposalId)
    );

    res.json({
      success: true,
      data: proposalInfo,
    });
  } catch (error) {
    console.error("Error in getProposalInfo controller:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Crea una propuesta de retiro
 * POST /api/vaults/:address/propose-withdrawal
 * Body: { description: string, recipient: string, amount: string }
 */
exports.proposeWithdrawal = async (req, res) => {
  try {
    const { address } = req.params;
    const { description, recipient, amount } = req.body;

    if (!address || !description || !recipient || !amount) {
      return res.status(400).json({
        success: false,
        error: "Vault address, description, recipient and amount are required",
      });
    }

    const result = await blockchainService.proposeWithdrawal(
      address,
      description,
      recipient,
      amount
    );

    res.json({
      success: true,
      message: "Withdrawal proposal created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in proposeWithdrawal controller:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Crea una propuesta para agregar un miembro
 * POST /api/vaults/:address/propose-add-member
 * Body: { description: string, newMember: string }
 */
exports.proposeAddMember = async (req, res) => {
  try {
    const { address } = req.params;
    const { description, newMember } = req.body;

    if (!address || !description || !newMember) {
      return res.status(400).json({
        success: false,
        error: "Vault address, description and new member address are required",
      });
    }

    const result = await blockchainService.proposeAddMember(
      address,
      description,
      newMember
    );

    res.json({
      success: true,
      message: "Add member proposal created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in proposeAddMember controller:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Vota en una propuesta
 * POST /api/vaults/:address/vote
 * Body: { proposalId: number, inFavor: boolean }
 */
exports.vote = async (req, res) => {
  try {
    const { address } = req.params;
    const { proposalId, inFavor } = req.body;

    if (!address || proposalId === undefined || typeof inFavor !== "boolean") {
      return res.status(400).json({
        success: false,
        error:
          "Vault address, proposal ID and vote (inFavor: boolean) are required",
      });
    }

    const result = await blockchainService.vote(
      address,
      parseInt(proposalId),
      inFavor
    );

    res.json({
      success: true,
      message: "Vote registered successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in vote controller:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Deposita ETH en una vault
 * POST /api/vaults/:address/deposit
 * Body: { amount: string }
 */
exports.deposit = async (req, res) => {
  try {
    const { address } = req.params;
    const { amount } = req.body;

    if (!address || !amount) {
      return res.status(400).json({
        success: false,
        error: "Vault address and amount are required",
      });
    }

    const result = await blockchainService.deposit(address, amount);

    res.json({
      success: true,
      message: "Deposit successful",
      data: result,
    });
  } catch (error) {
    console.error("Error in deposit controller:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Verifica si un usuario ha votado en una propuesta
 * GET /api/vaults/:address/proposals/:proposalId/has-voted/:voter
 */
exports.hasVoted = async (req, res) => {
  try {
    const { address, proposalId, voter } = req.params;

    if (!address || proposalId === undefined || !voter) {
      return res.status(400).json({
        success: false,
        error: "Vault address, proposal ID and voter address are required",
      });
    }

    const hasVoted = await blockchainService.hasVoted(
      address,
      parseInt(proposalId),
      voter
    );

    res.json({
      success: true,
      data: {
        hasVoted,
        voter,
        proposalId: parseInt(proposalId),
      },
    });
  } catch (error) {
    console.error("Error in hasVoted controller:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

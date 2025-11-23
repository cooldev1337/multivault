const { ethers } = require("ethers");
const { MULTIVAULT_FACTORY_ABI, MULTIVAULT_ABI } = require("../contracts/abis");
const config = require("../config/config");

class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.factoryContract = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      if (!config.rpcUrl) {
        throw new Error("RPC_URL not configured");
      }
      if (!config.privateKey) {
        throw new Error("PRIVATE_KEY not configured");
      }
      if (!config.factoryAddress) {
        throw new Error("FACTORY_ADDRESS not configured");
      }

      this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
      this.wallet = new ethers.Wallet(config.privateKey, this.provider);

      this.factoryContract = new ethers.Contract(
        config.factoryAddress,
        MULTIVAULT_FACTORY_ABI,
        this.wallet
      );

      this.initialized = true;
      console.log("✅ Blockchain service initialized");
      console.log(`📍 Factory Contract: ${config.factoryAddress}`);
      console.log(`🔗 Network: ${config.rpcUrl}`);

      return true;
    } catch (error) {
      console.error("❌ Error initializing blockchain service:", error.message);
      this.initialized = false;
      return false;
    }
  }

  ensureInitialized() {
    if (!this.initialized) {
      throw new Error(
        "Blockchain service not initialized. Call initialize() first."
      );
    }
  }

  // ==================== Factory Methods ====================

  /**
   * Crea una nueva vault en el contrato Factory
   * @param {string} name - Nombre de la vault
   * @param {string[]} members - Array de direcciones de miembros
   * @returns {Promise<{vaultAddress: string, txHash: string}>}
   */
  async createVault(name, members) {
    this.ensureInitialized();

    try {
      console.log(`Creating vault "${name}" with ${members.length} members...`);

      const tx = await this.factoryContract.createVault(name, members);
      const receipt = await tx.wait();

      // Buscar el evento VaultCreated
      const event = receipt.logs.find((log) => {
        try {
          const parsed = this.factoryContract.interface.parseLog(log);
          return parsed.name === "VaultCreated";
        } catch {
          return false;
        }
      });

      let vaultAddress = null;
      if (event) {
        const parsed = this.factoryContract.interface.parseLog(event);
        vaultAddress = parsed.args.vaultAddress;
      }

      return {
        success: true,
        vaultAddress,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error("Error creating vault:", error);
      throw new Error(`Failed to create vault: ${error.message}`);
    }
  }

  /**
   * Obtiene todas las vaults de un usuario
   * @param {string} userAddress - Dirección del usuario
   * @returns {Promise<string[]>}
   */
  async getUserVaults(userAddress) {
    this.ensureInitialized();

    try {
      const vaults = await this.factoryContract.getUserVaults(userAddress);
      return vaults;
    } catch (error) {
      console.error("Error getting user vaults:", error);
      throw new Error(`Failed to get user vaults: ${error.message}`);
    }
  }

  /**
   * Obtiene todas las vaults creadas
   * @returns {Promise<string[]>}
   */
  async getAllVaults() {
    this.ensureInitialized();

    try {
      const vaults = await this.factoryContract.getAllVaults();
      return vaults;
    } catch (error) {
      console.error("Error getting all vaults:", error);
      throw new Error(`Failed to get all vaults: ${error.message}`);
    }
  }

  /**
   * Obtiene el total de vaults creadas
   * @returns {Promise<number>}
   */
  async getTotalVaults() {
    this.ensureInitialized();

    try {
      const total = await this.factoryContract.getTotalVaults();
      return Number(total);
    } catch (error) {
      console.error("Error getting total vaults:", error);
      throw new Error(`Failed to get total vaults: ${error.message}`);
    }
  }

  /**
   * Verifica si una dirección es una vault válida
   * @param {string} vaultAddress - Dirección de la vault
   * @returns {Promise<boolean>}
   */
  async isValidVault(vaultAddress) {
    this.ensureInitialized();

    try {
      return await this.factoryContract.isValidVault(vaultAddress);
    } catch (error) {
      console.error("Error checking vault validity:", error);
      return false;
    }
  }

  // ==================== Vault Methods ====================

  /**
   * Obtiene información de una vault específica
   * @param {string} vaultAddress - Dirección de la vault
   * @returns {Promise<object>}
   */
  async getVaultInfo(vaultAddress) {
    this.ensureInitialized();

    try {
      const vaultContract = new ethers.Contract(
        vaultAddress,
        MULTIVAULT_ABI,
        this.provider
      );

      const [name, members, balance, proposalCounter] =
        await vaultContract.getVaultInfo();

      return {
        address: vaultAddress,
        name,
        members,
        balance: ethers.formatEther(balance),
        balanceWei: balance.toString(),
        proposalCounter: Number(proposalCounter),
        memberCount: members.length,
      };
    } catch (error) {
      console.error("Error getting vault info:", error);
      throw new Error(`Failed to get vault info: ${error.message}`);
    }
  }

  /**
   * Obtiene información de una propuesta
   * @param {string} vaultAddress - Dirección de la vault
   * @param {number} proposalId - ID de la propuesta
   * @returns {Promise<object>}
   */
  async getProposalInfo(vaultAddress, proposalId) {
    this.ensureInitialized();

    try {
      const vaultContract = new ethers.Contract(
        vaultAddress,
        MULTIVAULT_ABI,
        this.provider
      );

      const proposal = await vaultContract.getProposalInfo(proposalId);

      const proposalTypes = ["WITHDRAWAL", "ADD_MEMBER"];
      const proposalStatuses = ["PENDING", "EXECUTED", "REJECTED"];

      return {
        id: Number(proposal.id),
        type: proposalTypes[proposal.proposalType],
        proposer: proposal.proposer,
        description: proposal.description,
        recipient: proposal.recipient,
        amount: ethers.formatEther(proposal.amount),
        amountWei: proposal.amount.toString(),
        newMember: proposal.newMember,
        votesFor: Number(proposal.votesFor),
        votesAgainst: Number(proposal.votesAgainst),
        status: proposalStatuses[proposal.status],
      };
    } catch (error) {
      console.error("Error getting proposal info:", error);
      throw new Error(`Failed to get proposal info: ${error.message}`);
    }
  }

  /**
   * Crea una propuesta de retiro
   * @param {string} vaultAddress - Dirección de la vault
   * @param {string} description - Descripción de la propuesta
   * @param {string} recipient - Dirección del destinatario
   * @param {string} amount - Cantidad en ETH
   * @returns {Promise<{proposalId: number, txHash: string}>}
   */
  async proposeWithdrawal(vaultAddress, description, recipient, amount) {
    this.ensureInitialized();

    try {
      const vaultContract = new ethers.Contract(
        vaultAddress,
        MULTIVAULT_ABI,
        this.wallet
      );

      const amountWei = ethers.parseEther(amount);
      const tx = await vaultContract.proposeWithdrawal(
        description,
        recipient,
        amountWei
      );
      const receipt = await tx.wait();

      // Buscar el evento ProposalCreated
      const event = receipt.logs.find((log) => {
        try {
          const parsed = vaultContract.interface.parseLog(log);
          return parsed.name === "ProposalCreated";
        } catch {
          return false;
        }
      });

      let proposalId = null;
      if (event) {
        const parsed = vaultContract.interface.parseLog(event);
        proposalId = Number(parsed.args.proposalId);
      }

      return {
        success: true,
        proposalId,
        txHash: receipt.hash,
      };
    } catch (error) {
      console.error("Error proposing withdrawal:", error);
      throw new Error(`Failed to propose withdrawal: ${error.message}`);
    }
  }

  /**
   * Crea una propuesta para agregar un miembro
   * @param {string} vaultAddress - Dirección de la vault
   * @param {string} description - Descripción de la propuesta
   * @param {string} newMember - Dirección del nuevo miembro
   * @returns {Promise<{proposalId: number, txHash: string}>}
   */
  async proposeAddMember(vaultAddress, description, newMember) {
    this.ensureInitialized();

    try {
      const vaultContract = new ethers.Contract(
        vaultAddress,
        MULTIVAULT_ABI,
        this.wallet
      );

      const tx = await vaultContract.proposeAddMember(description, newMember);
      const receipt = await tx.wait();

      const event = receipt.logs.find((log) => {
        try {
          const parsed = vaultContract.interface.parseLog(log);
          return parsed.name === "ProposalCreated";
        } catch {
          return false;
        }
      });

      let proposalId = null;
      if (event) {
        const parsed = vaultContract.interface.parseLog(event);
        proposalId = Number(parsed.args.proposalId);
      }

      return {
        success: true,
        proposalId,
        txHash: receipt.hash,
      };
    } catch (error) {
      console.error("Error proposing add member:", error);
      throw new Error(`Failed to propose add member: ${error.message}`);
    }
  }

  /**
   * Vota en una propuesta
   * @param {string} vaultAddress - Dirección de la vault
   * @param {number} proposalId - ID de la propuesta
   * @param {boolean} inFavor - true para votar a favor, false en contra
   * @returns {Promise<{txHash: string}>}
   */
  async vote(vaultAddress, proposalId, inFavor) {
    this.ensureInitialized();

    try {
      const vaultContract = new ethers.Contract(
        vaultAddress,
        MULTIVAULT_ABI,
        this.wallet
      );

      const tx = await vaultContract.vote(proposalId, inFavor);
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt.hash,
      };
    } catch (error) {
      console.error("Error voting:", error);
      throw new Error(`Failed to vote: ${error.message}`);
    }
  }

  /**
   * Deposita ETH en una vault
   * @param {string} vaultAddress - Dirección de la vault
   * @param {string} amount - Cantidad en ETH
   * @returns {Promise<{txHash: string}>}
   */
  async deposit(vaultAddress, amount) {
    this.ensureInitialized();

    try {
      const vaultContract = new ethers.Contract(
        vaultAddress,
        MULTIVAULT_ABI,
        this.wallet
      );

      const amountWei = ethers.parseEther(amount);
      const tx = await vaultContract.deposit({ value: amountWei });
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt.hash,
        amount,
      };
    } catch (error) {
      console.error("Error depositing:", error);
      throw new Error(`Failed to deposit: ${error.message}`);
    }
  }

  /**
   * Verifica si un usuario ha votado en una propuesta
   * @param {string} vaultAddress - Dirección de la vault
   * @param {number} proposalId - ID de la propuesta
   * @param {string} voterAddress - Dirección del votante
   * @returns {Promise<boolean>}
   */
  async hasVoted(vaultAddress, proposalId, voterAddress) {
    this.ensureInitialized();

    try {
      const vaultContract = new ethers.Contract(
        vaultAddress,
        MULTIVAULT_ABI,
        this.provider
      );

      return await vaultContract.hasVoted(proposalId, voterAddress);
    } catch (error) {
      console.error("Error checking if voted:", error);
      return false;
    }
  }
}

// Singleton instance
const blockchainService = new BlockchainService();

module.exports = blockchainService;

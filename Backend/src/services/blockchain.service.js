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

  async createVault(name, members) {
    this.ensureInitialized();

    try {
      console.log(`Creating vault "${name}" with ${members.length} members...`);

      // Asegurar que el wallet que firma esté en la lista de miembros
      const signerAddress = this.wallet.address.toLowerCase();
      const normalizedMembers = members.map((m) => m.toLowerCase());

      if (!normalizedMembers.includes(signerAddress)) {
        normalizedMembers.push(signerAddress);
        console.log(`Added signer address ${signerAddress} to members list`);
      }

      const tx = await this.factoryContract.createVault(
        name,
        normalizedMembers
      );
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

  async isValidVault(vaultAddress) {
    this.ensureInitialized();

    try {
      return await this.factoryContract.isValidVault(vaultAddress);
    } catch (error) {
      console.error("Error checking vault validity:", error);
      return false;
    }
  }

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

      // Obtener balance de USDC
      const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // USDC en Base Sepolia
      const ERC20_ABI = [
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)",
      ];

      const usdcContract = new ethers.Contract(
        USDC_ADDRESS,
        ERC20_ABI,
        this.provider
      );

      const [usdcBalance, decimals] = await Promise.all([
        usdcContract.balanceOf(vaultAddress),
        usdcContract.decimals(),
      ]);

      const formattedUsdcBalance = ethers.formatUnits(usdcBalance, decimals);

      console.log("Vault Info:", {
        name,
        members,
        ethBalance: balance.toString(),
        usdcBalance: formattedUsdcBalance,
        proposalCounter: proposalCounter.toString(),
      });

      return {
        address: vaultAddress,
        name,
        members,
        balance: formattedUsdcBalance, // Balance de USDC
        balanceWei: usdcBalance.toString(),
        ethBalance: ethers.formatEther(balance), // Balance de ETH nativo por si acaso
        ethBalanceWei: balance.toString(),
        proposalCounter: Number(proposalCounter),
        memberCount: members.length,
      };
    } catch (error) {
      console.error("Error getting vault info:", error);
      throw new Error(`Failed to get vault info: ${error.message}`);
    }
  }

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

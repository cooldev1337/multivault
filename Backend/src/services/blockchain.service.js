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

  async createVault(name, members, smartAccount, cdp) {
    this.ensureInitialized();

    try {
      console.log(`Creating vault "${name}" with ${members.length} members...`);

      // Normalizar addresses
      const normalizedMembers = members.map((m) => m.toLowerCase());

      // Crear la transacción
      const factoryInterface = new ethers.Interface(MULTIVAULT_FACTORY_ABI);
      const data = factoryInterface.encodeFunctionData("createVault", [
        name,
        normalizedMembers,
      ]);

      // GASLESS: El usuario firma con su Smart Account
      const userOp = await cdp.evm.sendUserOperation({
        smartAccount,
        network: "base-sepolia",
        calls: [
          {
            to: config.factoryAddress,
            data,
            value: 0n,
          },
        ],
      });

      console.log(`Vault creation UserOp sent:`, userOp);

      // Esperar a que se mine la transacción
      const receipt = await cdp.evm.waitForUserOperation({
        userOpHash: userOp.userOpHash,
        smartAccountAddress: userOp.smartAccountAddress,
      });

      if (receipt.status !== "complete") {
        throw new Error("UserOperation failed");
      }

      console.log(`Vault creation completed: ${receipt.transactionHash}`);

      // Esperar un poco más para obtener el receipt
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Obtener el receipt de la transacción
      const txReceipt = await this.provider.getTransactionReceipt(
        receipt.transactionHash
      );

      if (!txReceipt) {
        console.log("Receipt not found yet, vault created but address unknown");
        return {
          success: true,
          vaultAddress: null,
          userOpHash: userOp.userOpHash,
          txHash: receipt.transactionHash,
        };
      }

      // Buscar el evento VaultCreated
      const event = txReceipt.logs.find((log) => {
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
        userOpHash: userOp.userOpHash,
        txHash: receipt.transactionHash,
        blockNumber: txReceipt.blockNumber,
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

  async proposeWithdrawal(
    vaultAddress,
    description,
    recipient,
    amount,
    smartAccount,
    cdp
  ) {
    this.ensureInitialized();

    try {
      const vaultContract = new ethers.Contract(
        vaultAddress,
        MULTIVAULT_ABI,
        this.wallet
      );

      const amountWei = ethers.parseEther(amount);

      // Encode the proposeWithdrawal call
      const data = vaultContract.interface.encodeFunctionData(
        "proposeWithdrawal",
        [description, recipient, amountWei]
      );

      // Send as UserOperation (GASLESS)
      const userOp = await cdp.evm.sendUserOperation({
        smartAccount,
        network: "base-sepolia",
        calls: [
          {
            to: vaultAddress,
            data: data,
            value: "0",
          },
        ],
      });

      console.log("UserOperation sent:", userOp);

      // Wait for the UserOperation to be included
      const receipt = await cdp.evm.waitForUserOperation({
        userOpHash: userOp.userOpHash,
        smartAccountAddress: userOp.smartAccountAddress,
      });

      console.log("UserOp receipt:", receipt);

      // Wait a bit for the transaction to be fully processed
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Get the actual transaction receipt to parse events
      const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
      const txReceipt = await provider.getReceipt(receipt.transactionHash);

      // Buscar el evento ProposalCreated
      const event = txReceipt.logs.find((log) => {
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
        userOpHash: userOp.userOpHash,
        txHash: receipt.transactionHash,
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

  async vote(vaultAddress, proposalId, inFavor, smartAccount, cdp) {
    this.ensureInitialized();

    try {
      const vaultContract = new ethers.Contract(
        vaultAddress,
        MULTIVAULT_ABI,
        this.wallet
      );

      // Encode the vote call
      const data = vaultContract.interface.encodeFunctionData("vote", [
        proposalId,
        inFavor,
      ]);

      // Send as UserOperation (GASLESS)
      const userOp = await cdp.evm.sendUserOperation({
        smartAccount,
        network: "base-sepolia",
        calls: [
          {
            to: vaultAddress,
            data: data,
            value: "0",
          },
        ],
      });

      console.log("Vote UserOperation sent:", userOp);

      // Wait for the UserOperation to be included
      const receipt = await cdp.evm.waitForUserOperation({
        userOpHash: userOp.userOpHash,
        smartAccountAddress: userOp.smartAccountAddress,
      });

      console.log("Vote UserOp receipt:", receipt);

      return {
        success: true,
        userOpHash: userOp.userOpHash,
        txHash: receipt.transactionHash,
      };
    } catch (error) {
      console.error("Error voting:", error);
      throw new Error(`Failed to vote: ${error.message}`);
    }
  }

  async depositUSDC(vaultAddress, amount) {
    this.ensureInitialized();

    try {
      const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // USDC en Base Sepolia
      const ERC20_ABI = [
        "function transfer(address to, uint256 amount) returns (bool)",
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)",
      ];

      const usdcContract = new ethers.Contract(
        USDC_ADDRESS,
        ERC20_ABI,
        this.wallet
      );

      // USDC tiene 6 decimales
      const decimals = await usdcContract.decimals();
      const amountInUnits = ethers.parseUnits(amount, decimals);

      // Verificar balance
      const balance = await usdcContract.balanceOf(this.wallet.address);
      if (balance < amountInUnits) {
        throw new Error(
          `Insufficient USDC balance. Have: ${ethers.formatUnits(
            balance,
            decimals
          )}, Need: ${amount}`
        );
      }

      // Transferir USDC al vault
      const tx = await usdcContract.transfer(vaultAddress, amountInUnits);
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt.hash,
        amount,
        token: "USDC",
      };
    } catch (error) {
      console.error("Error depositing USDC:", error);
      throw new Error(`Failed to deposit USDC: ${error.message}`);
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

const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("MultiVault Factory Pattern", function () {
  async function deployFactoryFixture() {
    const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

    const MultiVaultFactory = await ethers.getContractFactory(
      "MultiVaultFactory"
    );
    const factory = await MultiVaultFactory.deploy();

    return { factory, owner, addr1, addr2, addr3, addr4 };
  }

  describe("Factory Deployment", function () {
    it("Should deploy factory successfully", async function () {
      const { factory } = await loadFixture(deployFactoryFixture);
      expect(await factory.getTotalVaults()).to.equal(0);
    });
  });

  describe("Vault Creation via Factory", function () {
    it("Should create a vault with minimum 2 members", async function () {
      const { factory, owner, addr1 } = await loadFixture(deployFactoryFixture);

      const tx = await factory.createVault("Test Vault", [
        owner.address,
        addr1.address,
      ]);
      const receipt = await tx.wait();

      // Verificar evento
      const event = receipt.logs.find((log) => {
        try {
          return factory.interface.parseLog(log).name === "VaultCreated";
        } catch {
          return false;
        }
      });
      expect(event).to.not.be.undefined;

      expect(await factory.getTotalVaults()).to.equal(1);
    });

    it("Should fail with less than 2 members", async function () {
      const { factory, owner } = await loadFixture(deployFactoryFixture);

      await expect(
        factory.createVault("Test Vault", [owner.address])
      ).to.be.revertedWith("Se requieren al menos 2 miembros");
    });

    it("Should fail if creator is not in members list", async function () {
      const { factory, addr1, addr2 } = await loadFixture(deployFactoryFixture);

      await expect(
        factory.createVault("Test Vault", [addr1.address, addr2.address])
      ).to.be.revertedWith("El creador debe estar en la lista de miembros");
    });

    it("Should track user vaults correctly", async function () {
      const { factory, owner, addr1 } = await loadFixture(deployFactoryFixture);

      await factory.createVault("Vault 1", [owner.address, addr1.address]);
      await factory.createVault("Vault 2", [owner.address, addr1.address]);

      const ownerVaults = await factory.getUserVaults(owner.address);
      expect(ownerVaults.length).to.equal(2);
    });
  });

  describe("Deposits", function () {
    it("Should allow members to deposit funds", async function () {
      const { factory, owner, addr1 } = await loadFixture(deployFactoryFixture);

      const tx = await factory.createVault("Test Vault", [
        owner.address,
        addr1.address,
      ]);
      const receipt = await tx.wait();

      const vaults = await factory.getAllVaults();
      const vaultAddress = vaults[0];

      const MultiVault = await ethers.getContractFactory("MultiVault");
      const vault = MultiVault.attach(vaultAddress);

      const depositAmount = ethers.parseEther("1.0");
      await vault.deposit({ value: depositAmount });

      expect(await vault.getBalance()).to.equal(depositAmount);
    });

    it("Should fail if non-member tries to deposit", async function () {
      const { factory, owner, addr1, addr2 } = await loadFixture(
        deployFactoryFixture
      );

      await factory.createVault("Test Vault", [owner.address, addr1.address]);
      const vaults = await factory.getAllVaults();
      const vaultAddress = vaults[0];

      const MultiVault = await ethers.getContractFactory("MultiVault");
      const vault = MultiVault.attach(vaultAddress);

      await expect(
        vault.connect(addr2).deposit({ value: ethers.parseEther("1.0") })
      ).to.be.revertedWith("No eres miembro de este vault");
    });
  });

  describe("Withdrawal Proposals", function () {
    it("Should create a withdrawal proposal", async function () {
      const { factory, owner, addr1, addr2 } = await loadFixture(
        deployFactoryFixture
      );

      await factory.createVault("Test Vault", [owner.address, addr1.address]);
      const vaults = await factory.getAllVaults();
      const vaultAddress = vaults[0];

      const MultiVault = await ethers.getContractFactory("MultiVault");
      const vault = MultiVault.attach(vaultAddress);

      await vault.deposit({ value: ethers.parseEther("10.0") });

      const amount = ethers.parseEther("1.0");
      await vault.proposeWithdrawal(
        "Para gastos operativos",
        addr2.address,
        amount
      );

      const proposalInfo = await vault.getProposalInfo(0);
      expect(proposalInfo.description).to.equal("Para gastos operativos");
      expect(proposalInfo.amount).to.equal(amount);
      expect(proposalInfo.recipient).to.equal(addr2.address);
    });

    it("Should fail if amount exceeds vault balance", async function () {
      const { factory, owner, addr1, addr2 } = await loadFixture(
        deployFactoryFixture
      );

      await factory.createVault("Test Vault", [owner.address, addr1.address]);
      const vaults = await factory.getAllVaults();
      const vaultAddress = vaults[0];

      const MultiVault = await ethers.getContractFactory("MultiVault");
      const vault = MultiVault.attach(vaultAddress);

      await vault.deposit({ value: ethers.parseEther("1.0") });

      await expect(
        vault.proposeWithdrawal(
          "Too much",
          addr2.address,
          ethers.parseEther("2.0")
        )
      ).to.be.revertedWith("Fondos insuficientes en el vault");
    });
  });

  describe("Add Member Proposals", function () {
    it("Should create an add member proposal", async function () {
      const { factory, owner, addr1, addr2 } = await loadFixture(
        deployFactoryFixture
      );

      await factory.createVault("Test Vault", [owner.address, addr1.address]);
      const vaults = await factory.getAllVaults();
      const vaultAddress = vaults[0];

      const MultiVault = await ethers.getContractFactory("MultiVault");
      const vault = MultiVault.attach(vaultAddress);

      await vault.proposeAddMember(
        "Agregar nuevo miembro activo",
        addr2.address
      );

      const proposalInfo = await vault.getProposalInfo(0);
      expect(proposalInfo.newMember).to.equal(addr2.address);
    });

    it("Should fail if address is already a member", async function () {
      const { factory, owner, addr1 } = await loadFixture(deployFactoryFixture);

      await factory.createVault("Test Vault", [owner.address, addr1.address]);
      const vaults = await factory.getAllVaults();
      const vaultAddress = vaults[0];

      const MultiVault = await ethers.getContractFactory("MultiVault");
      const vault = MultiVault.attach(vaultAddress);

      await expect(
        vault.proposeAddMember("Adding existing", addr1.address)
      ).to.be.revertedWith("Ya es miembro del vault");
    });
  });

  describe("Voting System", function () {
    it("Should allow members to vote and execute withdrawal with simple majority", async function () {
      const { factory, owner, addr1, addr2 } = await loadFixture(
        deployFactoryFixture
      );

      // Create vault with 3 members
      await factory.createVault("Test Vault", [
        owner.address,
        addr1.address,
        addr2.address,
      ]);
      const vaults = await factory.getAllVaults();
      const vaultAddress = vaults[0];

      const MultiVault = await ethers.getContractFactory("MultiVault");
      const vault = MultiVault.attach(vaultAddress);

      await vault.deposit({ value: ethers.parseEther("10.0") });

      const amount = ethers.parseEther("1.0");
      const recipient = addr2.address;

      // Create withdrawal proposal
      await vault.proposeWithdrawal("Team payment", recipient, amount);

      const initialBalance = await ethers.provider.getBalance(recipient);

      // Vote: need 2 out of 3 (simple majority)
      await vault.vote(0, true); // owner votes yes
      await vault.connect(addr1).vote(0, true); // addr1 votes yes - should execute

      const proposalInfo = await vault.getProposalInfo(0);
      expect(proposalInfo.status).to.equal(1); // EXECUTED

      const finalBalance = await ethers.provider.getBalance(recipient);
      expect(finalBalance - initialBalance).to.equal(amount);
    });

    it("Should execute add member proposal with simple majority", async function () {
      const { factory, owner, addr1, addr2 } = await loadFixture(
        deployFactoryFixture
      );

      await factory.createVault("Test Vault", [owner.address, addr1.address]);
      const vaults = await factory.getAllVaults();
      const vaultAddress = vaults[0];

      const MultiVault = await ethers.getContractFactory("MultiVault");
      const vault = MultiVault.attach(vaultAddress);

      // Propose adding addr2
      await vault.proposeAddMember("Add new member", addr2.address);

      // Vote: need 2 out of 2
      await vault.vote(0, true); // owner votes yes
      await vault.connect(addr1).vote(0, true); // addr1 votes yes - should execute

      const isMember = await vault.isMember(addr2.address);
      expect(isMember).to.be.true;

      const members = await vault.getMembers();
      expect(members.length).to.equal(3);
    });

    it("Should reject proposal if majority votes against", async function () {
      const { factory, owner, addr1, addr2 } = await loadFixture(
        deployFactoryFixture
      );

      await factory.createVault("Test Vault", [
        owner.address,
        addr1.address,
        addr2.address,
      ]);
      const vaults = await factory.getAllVaults();
      const vaultAddress = vaults[0];

      const MultiVault = await ethers.getContractFactory("MultiVault");
      const vault = MultiVault.attach(vaultAddress);

      await vault.deposit({ value: ethers.parseEther("10.0") });
      await vault.proposeWithdrawal(
        "Test",
        owner.address,
        ethers.parseEther("1.0")
      );

      // All vote but majority is against
      await vault.vote(0, false); // owner votes no
      await vault.connect(addr1).vote(0, false); // addr1 votes no
      await vault.connect(addr2).vote(0, true); // addr2 votes yes

      const proposalInfo = await vault.getProposalInfo(0);
      expect(proposalInfo.status).to.equal(2); // REJECTED
    });

    it("Should prevent double voting", async function () {
      const { factory, owner, addr1, addr2 } = await loadFixture(
        deployFactoryFixture
      );

      await factory.createVault("Test Vault", [owner.address, addr1.address]);
      const vaults = await factory.getAllVaults();
      const vaultAddress = vaults[0];

      const MultiVault = await ethers.getContractFactory("MultiVault");
      const vault = MultiVault.attach(vaultAddress);

      await vault.proposeAddMember("Add member", addr2.address);
      await vault.vote(0, true);

      await expect(vault.vote(0, true)).to.be.revertedWith(
        "Ya has votado en esta propuesta"
      );
    });

    it("Should not allow non-members to vote", async function () {
      const { factory, owner, addr1, addr2 } = await loadFixture(
        deployFactoryFixture
      );

      await factory.createVault("Test Vault", [owner.address, addr1.address]);
      const vaults = await factory.getAllVaults();
      const vaultAddress = vaults[0];

      const MultiVault = await ethers.getContractFactory("MultiVault");
      const vault = MultiVault.attach(vaultAddress);

      await vault.proposeAddMember("Add member", addr2.address);

      await expect(vault.connect(addr2).vote(0, true)).to.be.revertedWith(
        "No eres miembro de este vault"
      );
    });
  });

  describe("Factory Query Functions", function () {
    it("Should return all vaults", async function () {
      const { factory, owner, addr1 } = await loadFixture(deployFactoryFixture);

      await factory.createVault("Vault 1", [owner.address, addr1.address]);
      await factory.createVault("Vault 2", [owner.address, addr1.address]);

      const allVaults = await factory.getAllVaults();
      expect(allVaults.length).to.equal(2);
    });

    it("Should return user vaults", async function () {
      const { factory, owner, addr1, addr2 } = await loadFixture(
        deployFactoryFixture
      );

      await factory.createVault("Vault 1", [owner.address, addr1.address]);
      await factory.createVault("Vault 2", [owner.address, addr2.address]);

      const ownerVaults = await factory.getUserVaults(owner.address);
      expect(ownerVaults.length).to.equal(2);

      const addr1Vaults = await factory.getUserVaults(addr1.address);
      expect(addr1Vaults.length).to.equal(1);
    });

    it("Should validate vault addresses", async function () {
      const { factory, owner, addr1 } = await loadFixture(deployFactoryFixture);

      await factory.createVault("Vault 1", [owner.address, addr1.address]);
      const vaults = await factory.getAllVaults();

      expect(await factory.isValidVault(vaults[0])).to.be.true;
      expect(await factory.isValidVault(addr1.address)).to.be.false;
    });

    it("Should get vault info through factory", async function () {
      const { factory, owner, addr1 } = await loadFixture(deployFactoryFixture);

      await factory.createVault("Test Vault", [owner.address, addr1.address]);
      const vaults = await factory.getAllVaults();

      const info = await factory.getVaultInfo(vaults[0]);
      expect(info.name).to.equal("Test Vault");
      expect(info.members.length).to.equal(2);
    });
  });
});

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TreasuryRouter", function () {
  let TreasuryRouter, treasuryRouter;
  let MockUSDC, usdc;
  let MockCCTPTokenMessenger, cctp;
  let owner, agent1, agent2;

  beforeEach(async function () {
    [owner, agent1, agent2] = await ethers.getSigners();

    // Deploy Mock USDC
    MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy(ethers.parseUnits("1000000", 6)); // 1M USDC

    // Deploy Mock CCTP
    MockCCTPTokenMessenger = await ethers.getContractFactory("MockCCTPTokenMessenger");
    cctp = await MockCCTPTokenMessenger.deploy(await usdc.getAddress());

    // Deploy TreasuryRouter
    TreasuryRouter = await ethers.getContractFactory("TreasuryRouter");
    treasuryRouter = await TreasuryRouter.deploy(
      await usdc.getAddress(),
      await cctp.getAddress(),
      owner.address // message transmitter (mock)
    );

    // Distribute USDC to agents for testing
    await usdc.transfer(agent1.address, ethers.parseUnits("10000", 6));
    await usdc.transfer(agent2.address, ethers.parseUnits("5000", 6));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await treasuryRouter.owner()).to.equal(owner.address);
    });

    it("Should set the right USDC address", async function () {
      expect(await treasuryRouter.usdc()).to.equal(await usdc.getAddress());
    });

    it("Should support Base Sepolia", async function () {
      expect(await treasuryRouter.isChainSupported(84532)).to.be.true;
    });

    it("Should support Arbitrum Sepolia", async function () {
      expect(await treasuryRouter.isChainSupported(421614)).to.be.true;
    });

    it("Should not support random chain", async function () {
      expect(await treasuryRouter.isChainSupported(99999)).to.be.false;
    });
  });

  describe("Deposits", function () {
    it("Should allow agent to deposit USDC", async function () {
      const amount = ethers.parseUnits("1000", 6);
      
      await usdc.connect(agent1).approve(await treasuryRouter.getAddress(), amount);
      await expect(treasuryRouter.connect(agent1).deposit(amount))
        .to.emit(treasuryRouter, "Deposited")
        .withArgs(agent1.address, amount, amount);

      expect(await treasuryRouter.getBalance(agent1.address)).to.equal(amount);
    });

    it("Should accumulate multiple deposits", async function () {
      const amount1 = ethers.parseUnits("500", 6);
      const amount2 = ethers.parseUnits("300", 6);
      
      await usdc.connect(agent1).approve(await treasuryRouter.getAddress(), amount1 + amount2);
      await treasuryRouter.connect(agent1).deposit(amount1);
      await treasuryRouter.connect(agent1).deposit(amount2);

      expect(await treasuryRouter.getBalance(agent1.address)).to.equal(amount1 + amount2);
    });

    it("Should fail if amount is 0", async function () {
      await expect(treasuryRouter.connect(agent1).deposit(0))
        .to.be.revertedWith("TreasuryRouter: amount must be > 0");
    });

    it("Should fail if allowance is insufficient", async function () {
      const amount = ethers.parseUnits("1000", 6);
      await expect(treasuryRouter.connect(agent1).deposit(amount))
        .to.be.reverted;
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      const amount = ethers.parseUnits("1000", 6);
      await usdc.connect(agent1).approve(await treasuryRouter.getAddress(), amount);
      await treasuryRouter.connect(agent1).deposit(amount);
    });

    it("Should allow agent to withdraw their balance", async function () {
      const amount = ethers.parseUnits("500", 6);
      
      await expect(treasuryRouter.connect(agent1).withdraw(amount))
        .to.emit(treasuryRouter, "Withdrawn")
        .withArgs(agent1.address, amount, ethers.parseUnits("500", 6));

      expect(await treasuryRouter.getBalance(agent1.address)).to.equal(ethers.parseUnits("500", 6));
    });

    it("Should fail if withdrawing more than balance", async function () {
      const amount = ethers.parseUnits("2000", 6);
      await expect(treasuryRouter.connect(agent1).withdraw(amount))
        .to.be.revertedWith("TreasuryRouter: insufficient balance");
    });

    it("Should fail if amount is 0", async function () {
      await expect(treasuryRouter.connect(agent1).withdraw(0))
        .to.be.revertedWith("TreasuryRouter: amount must be > 0");
    });
  });

  describe("Bridging", function () {
    beforeEach(async function () {
      const amount = ethers.parseUnits("1000", 6);
      await usdc.connect(agent1).approve(await treasuryRouter.getAddress(), amount);
      await treasuryRouter.connect(agent1).deposit(amount);
    });

    it("Should allow bridging to supported chain", async function () {
      const amount = ethers.parseUnits("500", 6);
      const destChain = 421614; // Arbitrum Sepolia

      await expect(treasuryRouter.connect(agent1).bridge(amount, destChain))
        .to.emit(treasuryRouter, "BridgeInitiated");

      expect(await treasuryRouter.getBalance(agent1.address)).to.equal(ethers.parseUnits("500", 6));
    });

    it("Should fail if bridging to unsupported chain", async function () {
      const amount = ethers.parseUnits("500", 6);
      await expect(treasuryRouter.connect(agent1).bridge(amount, 99999))
        .to.be.revertedWith("TreasuryRouter: unsupported chain");
    });

    it("Should fail if bridging more than balance", async function () {
      const amount = ethers.parseUnits("2000", 6);
      await expect(treasuryRouter.connect(agent1).bridge(amount, 421614))
        .to.be.revertedWith("TreasuryRouter: insufficient balance");
    });

    it("Should store bridge request correctly", async function () {
      const amount = ethers.parseUnits("500", 6);
      const destChain = 421614;

      const tx = await treasuryRouter.connect(agent1).bridge(amount, destChain);
      const receipt = await tx.wait();
      
      // Get the BridgeInitiated event
      const event = receipt.logs.find(
        log => log.fragment?.name === 'BridgeInitiated'
      );
      expect(event).to.not.be.undefined;
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to add new chain", async function () {
      await expect(treasuryRouter.addChain(12345, 99))
        .to.emit(treasuryRouter, "ChainAdded")
        .withArgs(12345, 99);

      expect(await treasuryRouter.isChainSupported(12345)).to.be.true;
    });

    it("Should not allow non-owner to add chain", async function () {
      await expect(treasuryRouter.connect(agent1).addChain(12345, 99))
        .to.be.revertedWith("TreasuryRouter: not owner");
    });

    it("Should allow owner to update USDC address", async function () {
      await treasuryRouter.setUSDC(agent2.address);
      expect(await treasuryRouter.usdc()).to.equal(agent2.address);
    });

    it("Should allow emergency withdrawal", async function () {
      // First deposit some USDC
      const amount = ethers.parseUnits("1000", 6);
      await usdc.connect(agent1).approve(await treasuryRouter.getAddress(), amount);
      await treasuryRouter.connect(agent1).deposit(amount);

      const ownerBalanceBefore = await usdc.balanceOf(owner.address);
      await treasuryRouter.emergencyWithdraw(amount);
      const ownerBalanceAfter = await usdc.balanceOf(owner.address);

      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(amount);
    });
  });
});

describe("AgentRegistry", function () {
  let AgentRegistry, registry;
  let owner, agent1, agent2;

  beforeEach(async function () {
    [owner, agent1, agent2] = await ethers.getSigners();

    AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    registry = await AgentRegistry.deploy();
  });

  describe("Registration", function () {
    it("Should allow agent registration", async function () {
      const name = "TestAgent";
      
      await expect(registry.connect(agent1).registerAgent(name))
        .to.emit(registry, "AgentRegistered");

      const agent = await registry.getAgent(agent1.address);
      expect(agent.name).to.equal(name);
      expect(agent.reputation).to.be.gt(0);
      expect(agent.active).to.be.true;
    });

    it("Should not allow duplicate registration", async function () {
      await registry.connect(agent1).registerAgent("TestAgent");
      await expect(registry.connect(agent1).registerAgent("AnotherName"))
        .to.be.revertedWith("AgentRegistry: already registered");
    });
  });

  describe("Vaults", function () {
    beforeEach(async function () {
      await registry.connect(agent1).registerAgent("TestAgent");
    });

    it("Should allow creating vault", async function () {
      const budget = ethers.parseUnits("10000", 6);
      
      await expect(registry.connect(agent1).createVault(budget))
        .to.emit(registry, "VaultCreated");
    });
  });
});

describe("YieldStrategy", function () {
  let YieldStrategy, strategy;
  let MockUSDC, usdc;
  let owner, agent1;

  beforeEach(async function () {
    [owner, agent1] = await ethers.getSigners();

    MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy(ethers.parseUnits("1000000", 6));

    YieldStrategy = await ethers.getContractFactory("YieldStrategy");
    strategy = await YieldStrategy.deploy(await usdc.getAddress());

    await usdc.transfer(agent1.address, ethers.parseUnits("10000", 6));
  });

  describe("Deposits", function () {
    it("Should allow deposit", async function () {
      const amount = ethers.parseUnits("1000", 6);
      
      await usdc.connect(agent1).approve(await strategy.getAddress(), amount);
      await expect(strategy.connect(agent1).deposit(amount))
        .to.emit(strategy, "Deposited");

      expect(await strategy.balanceOf(agent1.address)).to.equal(amount);
    });

    it("Should return correct APY", async function () {
      const apy = await strategy.getAPY();
      expect(apy).to.be.gt(0);
    });
  });
});
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Contract ABIs (simplified for hackathon)
const TREASURY_ROUTER_ABI = [
  'function createTreasury(uint256 initialDeposit) external',
  'function bridgeUSDC(uint256 amount, uint256 destChain, bytes32 recipient) external returns (bytes32)',
  'function receiveBridge(bytes32 txHash, uint256 amount, uint256 sourceChain) external',
  'function getBalance(address agent) external view returns (uint256)',
  'function isChainSupported(uint256 chainId) external view returns (bool)',
  'event BridgeInitiated(bytes32 indexed txHash, address indexed agent, uint256 amount, uint256 destChain)',
  'event BridgeCompleted(bytes32 indexed txHash, uint256 amount, uint256 sourceChain)',
];

const AGENT_REGISTRY_ABI = [
  'function registerAgent(string memory name) external',
  'function createVault(uint256 budget) external returns (bytes32)',
  'function setAllowance(bytes32 vaultId, address agent, uint256 amount) external',
  'function createProposal(bytes32 vaultId, string memory description, uint256 amount, address recipient) external returns (bytes32)',
  'function vote(bytes32 proposalId, bool support) external',
  'function getAgent(address agent) external view returns (string memory name, uint256 reputation, uint256 createdAt, bool active)',
  'function getAgentVaults(address agent) external view returns (bytes32[] memory)',
  'event AgentRegistered(address indexed agent, string name, uint256 reputation)',
  'event VaultCreated(bytes32 indexed vaultId, address indexed owner, uint256 budget)',
  'event ProposalCreated(bytes32 indexed proposalId, bytes32 indexed vaultId, uint256 amount)',
];

const YIELD_STRATEGY_ABI = [
  'function deposit(uint256 amount) external returns (uint256)',
  'function withdraw(uint256 amount) external returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function getAPY() external view returns (uint256)',
  'function calculateYield(address account, uint256 amount) external view returns (uint256)',
  'event Deposited(address indexed user, uint256 amount, uint256 shares)',
  'event Withdrawn(address indexed user, uint256 amount, uint256 yield)',
];

// USDC ABI
const USDC_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) external returns (bool)',
];

// Chain configurations
const CHAINS = {
  'base-sepolia': {
    id: 84532,
    name: 'Base Sepolia',
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    rpc: process.env.BASE_SEPOLIA_RPC || 'https://base-sepolia.g.alchemy.com/v2/demo',
  },
  'arbitrum-sepolia': {
    id: 421614,
    name: 'Arbitrum Sepolia',
    usdc: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    rpc: process.env.ARBITRUM_SEPOLIA_RPC || 'https://arb-sepolia.g.alchemy.com/v2/demo',
  },
};

class AgentBank {
  constructor(config) {
    this.config = config;
    this.providers = {};
    this.contracts = {};
    this.wallet = null;
    
    this._initialize();
  }

  _initialize() {
    // Initialize providers for each chain
    for (const [chain, config] of Object.entries(CHAINS)) {
      this.providers[chain] = new ethers.JsonRpcProvider(config.rpc);
    }
    
    // Initialize wallet
    if (this.config.wallet?.type === 'privateKey') {
      const key = this.config.wallet.key.startsWith('${') 
        ? process.env[this.config.wallet.key.slice(2, -1)]
        : this.config.wallet.key;
      
      for (const [chain, provider] of Object.entries(this.providers)) {
        this.wallet = new ethers.Wallet(key, provider);
      }
    }
    
    // Initialize contracts
    this._loadContracts();
  }

  _loadContracts() {
    for (const [chain, addresses] of Object.entries(this.config.contracts || {})) {
      const provider = this.providers[chain];
      
      this.contracts[chain] = {
        treasuryRouter: new ethers.Contract(addresses.treasuryRouter, TREASURY_ROUTER_ABI, this.wallet || provider),
        agentRegistry: new ethers.Contract(addresses.agentRegistry, AGENT_REGISTRY_ABI, this.wallet || provider),
        yieldStrategy: addresses.yieldStrategy ? new ethers.Contract(addresses.yieldStrategy, YIELD_STRATEGY_ABI, this.wallet || provider) : null,
        usdc: new ethers.Contract(addresses.usdc, USDC_ABI, this.wallet || provider),
      };
    }
  }

  // ===== BALANCE OPERATIONS =====
  
  async getBalance(chain = null) {
    const chains = chain ? [chain] : Object.keys(CHAINS);
    const balances = {};
    
    for (const c of chains) {
      const usdc = this.contracts[c]?.usdc;
      if (usdc && this.wallet) {
        const balance = await usdc.balanceOf(this.wallet.address);
        balances[c] = ethers.formatUnits(balance, 6); // USDC has 6 decimals
      }
    }
    
    return balances;
  }

  async getTreasuryBalance(chain = 'base-sepolia') {
    const router = this.contracts[chain]?.treasuryRouter;
    if (!router || !this.wallet) return null;
    
    const balance = await router.getBalance(this.wallet.address);
    return ethers.formatUnits(balance, 6);
  }

  // ===== TRANSFER OPERATIONS =====

  async send(to, amount, chain = 'base-sepolia') {
    const usdc = this.contracts[chain]?.usdc;
    if (!usdc || !this.wallet) throw new Error('Not initialized');
    
    const amountWei = ethers.parseUnits(amount.toString(), 6);
    
    console.log(`Sending ${amount} USDC to ${to} on ${chain}...`);
    const tx = await usdc.transfer(to, amountWei);
    console.log(`Transaction submitted: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`Confirmed in block ${receipt.blockNumber}`);
    
    return receipt;
  }

  // ===== BRIDGE OPERATIONS =====

  async bridge(amount, fromChain, toChain) {
    const router = this.contracts[fromChain]?.treasuryRouter;
    if (!router || !this.wallet) throw new Error('Not initialized');
    
    const destChainId = CHAINS[toChain]?.id;
    if (!destChainId) throw new Error(`Unknown chain: ${toChain}`);
    
    const amountWei = ethers.parseUnits(amount.toString(), 6);
    const recipient = ethers.zeroPadValue(this.wallet.address, 32);
    
    console.log(`Bridging ${amount} USDC from ${fromChain} to ${toChain}...`);
    console.log(`Destination chain ID: ${destChainId}`);
    
    // Approve router to spend USDC
    const usdc = this.contracts[fromChain].usdc;
    const approveTx = await usdc.approve(await router.getAddress(), amountWei);
    await approveTx.wait();
    console.log('Approved USDC spend');
    
    // Initiate bridge
    const tx = await router.bridgeUSDC(amountWei, destChainId, recipient);
    console.log(`Bridge initiated: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`Bridge transaction confirmed in block ${receipt.blockNumber}`);
    
    // Extract transaction hash from event
    // In real implementation, parse event logs
    return receipt;
  }

  // ===== AGENT REGISTRY =====

  async registerAgent(name, chain = 'base-sepolia') {
    const registry = this.contracts[chain]?.agentRegistry;
    if (!registry || !this.wallet) throw new Error('Not initialized');
    
    console.log(`Registering agent "${name}"...`);
    const tx = await registry.registerAgent(name);
    const receipt = await tx.wait();
    console.log(`Registered! Tx: ${receipt.hash}`);
    return receipt;
  }

  async getAgent(address, chain = 'base-sepolia') {
    const registry = this.contracts[chain]?.agentRegistry;
    if (!registry) throw new Error('Not initialized');
    
    const agent = await registry.getAgent(address);
    return {
      name: agent[0],
      reputation: agent[1].toString(),
      createdAt: new Date(Number(agent[2]) * 1000).toISOString(),
      active: agent[3],
    };
  }

  // ===== VAULT OPERATIONS =====

  async createVault(budget, chain = 'base-sepolia') {
    const registry = this.contracts[chain]?.agentRegistry;
    if (!registry || !this.wallet) throw new Error('Not initialized');
    
    const budgetWei = ethers.parseUnits(budget.toString(), 6);
    
    console.log(`Creating vault with budget ${budget} USDC...`);
    const tx = await registry.createVault(budgetWei);
    const receipt = await tx.wait();
    console.log(`Vault created! Tx: ${receipt.hash}`);
    return receipt;
  }

  // ===== YIELD OPERATIONS =====

  async depositToYield(amount, chain = 'base-sepolia') {
    const strategy = this.contracts[chain]?.yieldStrategy;
    const usdc = this.contracts[chain]?.usdc;
    if (!strategy || !usdc || !this.wallet) throw new Error('Not initialized');
    
    const amountWei = ethers.parseUnits(amount.toString(), 6);
    
    // Approve strategy to spend USDC
    const approveTx = await usdc.approve(await strategy.getAddress(), amountWei);
    await approveTx.wait();
    
    console.log(`Depositing ${amount} USDC to yield strategy...`);
    const tx = await strategy.deposit(amountWei);
    const receipt = await tx.wait();
    console.log(`Deposited! Tx: ${receipt.hash}`);
    return receipt;
  }

  async withdrawFromYield(amount, chain = 'base-sepolia') {
    const strategy = this.contracts[chain]?.yieldStrategy;
    if (!strategy || !this.wallet) throw new Error('Not initialized');
    
    const amountWei = ethers.parseUnits(amount.toString(), 6);
    
    console.log(`Withdrawing ${amount} USDC from yield strategy...`);
    const tx = await strategy.withdraw(amountWei);
    const receipt = await tx.wait();
    console.log(`Withdrawn! Tx: ${receipt.hash}`);
    return receipt;
  }

  async getYieldAPY(chain = 'base-sepolia') {
    const strategy = this.contracts[chain]?.yieldStrategy;
    if (!strategy) throw new Error('No yield strategy');
    
    const apy = await strategy.getAPY();
    return (apy / 100).toFixed(2); // Convert basis points to percentage
  }

  async getYieldBalance(chain = 'base-sepolia') {
    const strategy = this.contracts[chain]?.yieldStrategy;
    if (!strategy || !this.wallet) return null;
    
    const balance = await strategy.balanceOf(this.wallet.address);
    return ethers.formatUnits(balance, 6);
  }
}

module.exports = { AgentBank, CHAINS };

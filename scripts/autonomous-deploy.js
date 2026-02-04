const { ethers } = require('ethers');
const fs = require('fs');
const crypto = require('crypto');

// Generate deterministic deployment wallet
// Using a fixed seed phrase for reproducibility
const SEED_PHRASE = 'agentbank hackathon 2025 circle usdc cross chain bridge yield strategy';

// Create wallet from hash of seed (deterministic)
const privateKey = '0x' + crypto.createHash('sha256').update(SEED_PHRASE).digest('hex').slice(0, 64);

// Testnet RPC endpoints (public)
const RPCS = {
  'base-sepolia': 'https://base-sepolia.blockpi.network/v1/rpc/public',
  'arbitrum-sepolia': 'https://arbitrum-sepolia.blockpi.network/v1/rpc/public',
};

// Contract ABIs and Bytecodes (minimal for hackathon)
// These are the actual compiled outputs - we'll generate them

// TreasuryRouter bytecode (placeholder - will be filled with actual compiled bytecode)
const TREASURY_ROUTER_BYTECODE = '0x';
const TREASURY_ROUTER_ABI = [
  'constructor(address _usdc)',
  'function deposit(uint256 amount) external',
  'function bridge(uint256 amount, uint256 destChain) external returns (bytes32)',
  'function receiveBridge(address agent, uint256 amount, uint256 sourceChain, bytes32 txHash) external',
  'function getBalance(address agent) external view returns (uint256)',
  'function withdraw(uint256 amount) external',
  'event TreasuryCreated(address indexed agent, uint256 amount)',
  'event BridgeInitiated(address indexed agent, uint256 amount, uint256 destChain, bytes32 txHash)',
  'event BridgeCompleted(address indexed agent, uint256 amount, uint256 sourceChain, bytes32 txHash)',
];

// AgentRegistry bytecode
const AGENT_REGISTRY_BYTECODE = '0x';
const AGENT_REGISTRY_ABI = [
  'constructor()',
  'function registerAgent(string memory name) external',
  'function createVault(uint256 budget) external returns (bytes32)',
  'function getAgent(address agent) external view returns (string memory, uint256, uint256, bool)',
  'function getAgentVaults(address agent) external view returns (bytes32[] memory)',
  'event AgentRegistered(address indexed agent, string name, uint256 reputation)',
  'event VaultCreated(bytes32 indexed vaultId, address indexed owner, uint256 budget)',
];

// YieldStrategy bytecode
const YIELD_STRATEGY_BYTECODE = '0x';
const YIELD_STRATEGY_ABI = [
  'constructor(address _usdc)',
  'function deposit(uint256 amount) external returns (uint256)',
  'function withdraw(uint256 amount) external returns (uint256)',
  'function balanceOf(address user) external view returns (uint256)',
  'function getAPY() external view returns (uint256)',
  'function calculateYield(address user) external view returns (uint256)',
  'event Deposited(address indexed user, uint256 amount)',
  'event Withdrawn(address indexed user, uint256 amount, uint256 yield)',
];

// USDC addresses on testnets
const USDC_ADDRESSES = {
  'base-sepolia': '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  'arbitrum-sepolia': '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
};

async function deploy() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║           AGENTBANK AUTONOMOUS DEPLOYMENT                 ║');
  console.log('║              100% AI-Controlled Process                   ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const wallet = new ethers.Wallet(privateKey);
  console.log('Deployment Wallet:', wallet.address);
  console.log('Private Key:', privateKey.slice(0, 20) + '...');
  console.log('\n⚠️  WARNING: This is a testnet-only deployment wallet.');
  console.log('   Do not use for mainnet or with real funds.\n');

  // Check if bytecodes are ready
  if (TREASURY_ROUTER_BYTECODE === '0x' || TREASURY_ROUTER_BYTECODE.length < 10) {
    console.log('❌ Bytecodes not ready. Need to compile contracts first.');
    console.log('\nOptions:');
    console.log('1. Use Remix online compiler (https://remix.ethereum.org)');
    console.log('2. Use GitHub Codespaces with pre-configured Hardhat');
    console.log('3. Deploy via Alchemy/Infura API directly\n');
    
    console.log('📋 Manual Deployment Instructions:');
    console.log('=================================\n');
    console.log('Step 1: Open https://remix.ethereum.org');
    console.log('Step 2: Create new files:');
    console.log('  - TreasuryRouter.sol (paste from agentbank/contracts/)');
    console.log('  - AgentRegistry.sol');
    console.log('  - YieldStrategy.sol');
    console.log('Step 3: Compile with Solidity 0.8.19');
    console.log('Step 4: Switch to "Deploy & Run Transactions" tab');
    console.log('Step 5: Environment: "Injected Provider - MetaMask"');
    console.log('Step 6: Select network: Base Sepolia Testnet');
    console.log('Step 7: Deploy each contract with constructor args:\n');
    console.log('  TreasuryRouter:');
    console.log('    _usdc: 0x036CbD53842c5426634e7929541eC2318f3dCF7e\n');
    console.log('  AgentRegistry:');
    console.log('    (no args)\n');
    console.log('  YieldStrategy:');
    console.log('    _usdc: 0x036CbD53842c5426634e7929541eC2318f3dCF7e\n');
    console.log('Step 8: Copy deployed addresses to skill/config.json\n');
    
    return;
  }

  // Deploy to each network
  for (const [network, rpcUrl] of Object.entries(RPCS)) {
    console.log(`\n🌐 Deploying to ${network}...`);
    console.log('═══════════════════════════════════════════════════════');
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const deployer = wallet.connect(provider);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`Deployer balance: ${ethers.formatEther(balance)} ETH`);
    
    if (balance < ethers.parseEther('0.001')) {
      console.log('❌ Insufficient balance for deployment.');
      console.log(`   Get testnet ETH from: https://www.alchemy.com/faucets/${network.replace('-', '-')}`);
      continue;
    }

    try {
      // Deploy TreasuryRouter
      console.log('\n📄 Deploying TreasuryRouter...');
      const TreasuryRouter = new ethers.ContractFactory(TREASURY_ROUTER_ABI, TREASURY_ROUTER_BYTECODE, deployer);
      const router = await TreasuryRouter.deploy(USDC_ADDRESSES[network]);
      await router.waitForDeployment();
      console.log(`   ✅ TreasuryRouter: ${await router.getAddress()}`);

      // Deploy AgentRegistry
      console.log('\n📄 Deploying AgentRegistry...');
      const AgentRegistry = new ethers.ContractFactory(AGENT_REGISTRY_ABI, AGENT_REGISTRY_BYTECODE, deployer);
      const registry = await AgentRegistry.deploy();
      await registry.waitForDeployment();
      console.log(`   ✅ AgentRegistry: ${await registry.getAddress()}`);

      // Deploy YieldStrategy
      console.log('\n📄 Deploying YieldStrategy...');
      const YieldStrategy = new ethers.ContractFactory(YIELD_STRATEGY_ABI, YIELD_STRATEGY_BYTECODE, deployer);
      const yieldStrategy = await YieldStrategy.deploy(USDC_ADDRESSES[network]);
      await yieldStrategy.waitForDeployment();
      console.log(`   ✅ YieldStrategy: ${await yieldStrategy.getAddress()}`);

      // Save deployment info
      const deploymentInfo = {
        network,
        deployer: wallet.address,
        contracts: {
          TreasuryRouter: await router.getAddress(),
          AgentRegistry: await registry.getAddress(),
          YieldStrategy: await yieldStrategy.getAddress(),
        },
        usdc: USDC_ADDRESSES[network],
        timestamp: new Date().toISOString(),
      };

      fs.writeFileSync(`deployment-${network}.json`, JSON.stringify(deploymentInfo, null, 2));
      console.log(`\n💾 Deployment info saved to deployment-${network}.json`);

    } catch (error) {
      console.error(`   ❌ Deployment failed: ${error.message}`);
    }
  }

  console.log('\n✨ Deployment process complete!\n');
}

deploy().catch(console.error);

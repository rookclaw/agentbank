const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load compiled contracts
function loadContract(name) {
  const buildPath = path.join(__dirname, '..', 'build', `${name}.json`);
  return JSON.parse(fs.readFileSync(buildPath, 'utf8'));
}

// Local network configuration
const LOCAL_NETWORK = {
  name: 'hardhat-local',
  chainId: 31337,
  rpc: 'http://127.0.0.1:8545',
};

// Mock USDC address (will deploy a mock)
const MOCK_USDC_ABI = [
  'function mint(address to, uint256 amount) external',
  'function balanceOf(address account) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function transfer(address to, uint256 amount) external returns (bool)',
];

const MOCK_USDC_BYTECODE = '0x608060405234801561001057600080fd5b50...'; // Simplified

async function deployLocal() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║         AGENTBANK LOCAL DEPLOYMENT                        ║');
  console.log('║         (For Testing & Demo)                              ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const provider = new ethers.JsonRpcProvider(LOCAL_NETWORK.rpc);
  
  // Use default Hardhat accounts
  const wallet = new ethers.Wallet(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', // Account #0
    provider
  );
  
  console.log('Deployer:', wallet.address);
  console.log('Network:', LOCAL_NETWORK.name);
  console.log('RPC:', LOCAL_NETWORK.rpc);

  // Check connection
  try {
    const blockNumber = await provider.getBlockNumber();
    console.log('Connected! Block number:', blockNumber);
  } catch (error) {
    console.error('\n❌ Cannot connect to local network.');
    console.log('Start it with:');
    console.log('  npx hardhat node');
    console.log('\nOr use testnet deployment:');
    console.log('  node scripts/deploy.js base-sepolia\n');
    return;
  }

  // Load contracts
  const TreasuryRouter = loadContract('TreasuryRouter');
  const AgentRegistry = loadContract('AgentRegistry');
  const YieldStrategy = loadContract('YieldStrategy');

  const deployments = {
    network: LOCAL_NETWORK.name,
    chainId: LOCAL_NETWORK.chainId,
    deployer: wallet.address,
    contracts: {},
  };

  try {
    // Deploy Mock USDC first
    console.log('\n📄 Deploying Mock USDC...');
    // For local testing, we'll use a simple approach
    // In production, this would be the real USDC contract
    
    // Deploy TreasuryRouter
    console.log('\n📄 Deploying TreasuryRouter...');
    const routerFactory = new ethers.ContractFactory(
      TreasuryRouter.abi,
      TreasuryRouter.bytecode,
      wallet
    );
    const router = await routerFactory.deploy(wallet.address); // Use wallet as USDC for demo
    await router.waitForDeployment();
    const routerAddress = await router.getAddress();
    console.log(`   ✅ TreasuryRouter: ${routerAddress}`);
    deployments.contracts.TreasuryRouter = routerAddress;

    // Deploy AgentRegistry
    console.log('\n📄 Deploying AgentRegistry...');
    const registryFactory = new ethers.ContractFactory(
      AgentRegistry.abi,
      AgentRegistry.bytecode,
      wallet
    );
    const registry = await registryFactory.deploy();
    await registry.waitForDeployment();
    const registryAddress = await registry.getAddress();
    console.log(`   ✅ AgentRegistry: ${registryAddress}`);
    deployments.contracts.AgentRegistry = registryAddress;

    // Deploy YieldStrategy
    console.log('\n📄 Deploying YieldStrategy...');
    const strategyFactory = new ethers.ContractFactory(
      YieldStrategy.abi,
      YieldStrategy.bytecode,
      wallet
    );
    const strategy = await strategyFactory.deploy(wallet.address); // Use wallet as USDC for demo
    await strategy.waitForDeployment();
    const strategyAddress = await strategy.getAddress();
    console.log(`   ✅ YieldStrategy: ${strategyAddress}`);
    deployments.contracts.YieldStrategy = strategyAddress;

    // Save deployment info
    const deploymentPath = path.join(__dirname, '..', 'deployment-local.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deployments, null, 2));
    console.log(`\n💾 Deployment saved to: deployment-local.json`);

    // Update skill config
    const skillConfigPath = path.join(__dirname, '..', 'skill', 'config.json');
    const skillConfig = {
      defaultChain: 'local',
      rpcUrls: {
        local: LOCAL_NETWORK.rpc,
      },
      contracts: {
        local: deployments.contracts,
      },
      wallet: {
        type: 'privateKey',
        key: '${AGENTBANK_KEY}',
      },
    };
    fs.writeFileSync(skillConfigPath, JSON.stringify(skillConfig, null, 2));
    console.log(`💾 Skill config updated: skill/config.json`);

    return deployments;

  } catch (error) {
    console.error(`\n❌ Deployment failed: ${error.message}`);
    console.error(error);
    return null;
  }
}

deployLocal().then((result) => {
  if (result) {
    console.log('\n✨ Local deployment successful!');
    console.log('\nContract Addresses:');
    console.log('===================');
    for (const [name, address] of Object.entries(result.contracts)) {
      console.log(`${name}: ${address}`);
    }
    console.log('\nNext steps:');
    console.log('1. Test CLI commands:');
    console.log('   node skill/cli.js init');
    console.log('   node skill/cli.js register --name="TestAgent"');
    console.log('   node skill/cli.js balance');
    console.log('\n2. For testnet deployment:');
    console.log('   Get testnet ETH and run:');
    console.log('   node scripts/deploy.js base-sepolia');
  } else {
    console.log('\n❌ Deployment failed.');
    process.exit(1);
  }
}).catch(console.error);

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load compiled contracts
function loadContract(name) {
  const buildPath = path.join(__dirname, '..', 'build', `${name}.json`);
  return JSON.parse(fs.readFileSync(buildPath, 'utf8'));
}

// Testnet configuration
const NETWORKS = {
  'base-sepolia': {
    chainId: 84532,
    rpc: process.env.BASE_SEPOLIA_RPC || 'https://base-sepolia.blockpi.network/v1/rpc/public',
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    explorer: 'https://sepolia.basescan.org',
  },
  'arbitrum-sepolia': {
    chainId: 421614,
    rpc: process.env.ARBITRUM_SEPOLIA_RPC || 'https://arbitrum-sepolia.blockpi.network/v1/rpc/public',
    usdc: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    explorer: 'https://sepolia.arbiscan.io',
  },
};

async function deployToNetwork(networkName) {
  const network = NETWORKS[networkName];
  if (!network) {
    throw new Error(`Unknown network: ${networkName}`);
  }

  console.log(`\n🌐 Deploying to ${networkName}...`);
  console.log('='.repeat(60));

  // Setup provider and wallet
  const provider = new ethers.providers.JsonRpcProvider(network.rpc);
  
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY environment variable not set');
    console.log('\nTo set it:');
    console.log('  $env:PRIVATE_KEY = "0x..."');
    return null;
  }
  
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log(`Deployer: ${wallet.address}`);

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`Balance: ${ethers.utils.formatEther(balance)} ETH`);

  if (balance.lt(ethers.utils.parseEther('0.001'))) {
    console.error('❌ Insufficient balance for deployment');
    console.log(`Get testnet ETH from: https://www.alchemy.com/faucets/${networkName.replace('-', '-')}`);
    return null;
  }

  // Load contracts
  const TreasuryRouter = loadContract('TreasuryRouter');
  const AgentRegistry = loadContract('AgentRegistry');
  const YieldStrategy = loadContract('YieldStrategy');

  const deployments = {
    network: networkName,
    deployer: wallet.address,
    contracts: {},
  };

  try {
    // Deploy TreasuryRouter
    console.log('\n📄 Deploying TreasuryRouter...');
    const routerFactory = new ethers.ContractFactory(
      TreasuryRouter.abi,
      TreasuryRouter.bytecode,
      wallet
    );
    const router = await routerFactory.deploy(network.usdc);
    await router.deployed();
    console.log(`   ✅ TreasuryRouter: ${router.address}`);
    console.log(`   📝 ${network.explorer}/address/${router.address}`);
    deployments.contracts.TreasuryRouter = router.address;

    // Deploy AgentRegistry
    console.log('\n📄 Deploying AgentRegistry...');
    const registryFactory = new ethers.ContractFactory(
      AgentRegistry.abi,
      AgentRegistry.bytecode,
      wallet
    );
    const registry = await registryFactory.deploy();
    await registry.deployed();
    console.log(`   ✅ AgentRegistry: ${registry.address}`);
    console.log(`   📝 ${network.explorer}/address/${registry.address}`);
    deployments.contracts.AgentRegistry = registry.address;

    // Deploy YieldStrategy
    console.log('\n📄 Deploying YieldStrategy...');
    const strategyFactory = new ethers.ContractFactory(
      YieldStrategy.abi,
      YieldStrategy.bytecode,
      wallet
    );
    const strategy = await strategyFactory.deploy(network.usdc);
    await strategy.deployed();
    console.log(`   ✅ YieldStrategy: ${strategy.address}`);
    console.log(`   📝 ${network.explorer}/address/${strategy.address}`);
    deployments.contracts.YieldStrategy = strategy.address;

    // Save deployment info
    const deploymentPath = path.join(__dirname, '..', `deployment-${networkName}.json`);
    fs.writeFileSync(deploymentPath, JSON.stringify(deployments, null, 2));
    console.log(`\n💾 Deployment saved to: deployment-${networkName}.json`);

    return deployments;

  } catch (error) {
    console.error(`\n❌ Deployment failed: ${error.message}`);
    return null;
  }
}

async function main() {
  const targetNetwork = process.argv[2] || 'base-sepolia';
  
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║              AGENTBANK DEPLOYMENT                         ║');
  console.log('║          Autonomous Cross-Chain Treasury                  ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  const result = await deployToNetwork(targetNetwork);
  
  if (result) {
    console.log('\n✨ Deployment successful!');
    console.log('\nUpdate your skill/config.json with these addresses:');
    console.log(JSON.stringify(result.contracts, null, 2));
  } else {
    console.log('\n❌ Deployment failed. Check errors above.');
    process.exit(1);
  }
}

main().catch(console.error);

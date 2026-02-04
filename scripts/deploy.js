const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const { CCTP_ADDRESSES } = require('../config/cctp-addresses');

// Load compiled contracts
function loadContract(name) {
  const buildPath = path.join(__dirname, '..', 'build', `${name}.json`);
  if (!fs.existsSync(buildPath)) {
    throw new Error(`Contract ${name} not found at ${buildPath}. Run: npx hardhat compile`);
  }
  return JSON.parse(fs.readFileSync(buildPath, 'utf8'));
}

async function deployToNetwork(networkName) {
  const config = CCTP_ADDRESSES[networkName];
  if (!config) {
    throw new Error(`Unknown network: ${networkName}. Supported: ${Object.keys(CCTP_ADDRESSES).join(', ')}`);
  }

  console.log(`\n🌐 Deploying to ${networkName.toUpperCase()}...`);
  console.log('='.repeat(60));
  console.log(`Chain ID: ${config.chainId}`);
  console.log(`USDC: ${config.usdc}`);
  console.log(`TokenMessenger: ${config.tokenMessenger}`);

  // Setup provider with fallback
  let provider;
  try {
    provider = new ethers.JsonRpcProvider(config.rpc);
    await provider.getNetwork(); // Test connection
  } catch (err) {
    console.log(`⚠️ Primary RPC failed, trying fallbacks...`);
    const { FALLBACK_RPCS } = require('../config/cctp-addresses');
    for (const rpc of FALLBACK_RPCS[networkName] || []) {
      try {
        provider = new ethers.JsonRpcProvider(rpc);
        await provider.getNetwork();
        console.log(`✅ Connected to fallback: ${rpc}`);
        break;
      } catch (e) {
        console.log(`❌ Fallback failed: ${rpc}`);
      }
    }
    if (!provider) throw new Error('All RPCs failed');
  }
  
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY environment variable not set');
    console.log('\nTo set it:');
    console.log('  Windows PowerShell: $env:PRIVATE_KEY = "0x..."');
    console.log('  Windows CMD: set PRIVATE_KEY=0x...');
    console.log('  Linux/Mac: export PRIVATE_KEY=0x...');
    return null;
  }
  
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log(`\nDeployer: ${wallet.address}`);

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  const balanceEth = ethers.formatEther(balance);
  console.log(`Balance: ${balanceEth} ETH`);

  if (balance < ethers.parseEther('0.01')) {
    console.error('❌ Insufficient balance for deployment');
    console.log(`\nGet testnet ETH from:`);
    console.log(`  • https://www.alchemy.com/faucets/${networkName.replace('-', '-')}`);
    console.log(`  • https://faucet.circle.com (for USDC)`);
    console.log(`  • https://sepoliafaucet.com (for Sepolia ETH)`);
    return null;
  }

  // Load contracts
  let TreasuryRouter, AgentRegistry, YieldStrategy;
  try {
    TreasuryRouter = loadContract('TreasuryRouter');
    AgentRegistry = loadContract('AgentRegistry');
    YieldStrategy = loadContract('YieldStrategy');
  } catch (err) {
    console.error('❌ Failed to load contracts:', err.message);
    console.log('\nRun: npx hardhat compile');
    return null;
  }

  const deployments = {
    network: networkName,
    chainId: config.chainId,
    deployer: wallet.address,
    timestamp: new Date().toISOString(),
    contracts: {},
    cctp: {
      usdc: config.usdc,
      tokenMessenger: config.tokenMessenger,
      messageTransmitter: config.messageTransmitter,
    },
  };

  try {
    // Deploy TreasuryRouter
    console.log('\n📄 Deploying TreasuryRouter...');
    console.log(`   USDC: ${config.usdc}`);
    console.log(`   TokenMessenger: ${config.tokenMessenger}`);
    console.log(`   MessageTransmitter: ${config.messageTransmitter}`);
    
    const routerFactory = new ethers.ContractFactory(
      TreasuryRouter.abi,
      TreasuryRouter.bytecode,
      wallet
    );
    
    const router = await routerFactory.deploy(
      config.usdc,
      config.tokenMessenger,
      config.messageTransmitter
    );
    
    await router.waitForDeployment();
    const routerAddress = await router.getAddress();
    console.log(`   ✅ TreasuryRouter: ${routerAddress}`);
    console.log(`   📝 ${getExplorerUrl(networkName, routerAddress)}`);
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
    console.log(`   📝 ${getExplorerUrl(networkName, registryAddress)}`);
    deployments.contracts.AgentRegistry = registryAddress;

    // Deploy YieldStrategy
    console.log('\n📄 Deploying YieldStrategy...');
    const strategyFactory = new ethers.ContractFactory(
      YieldStrategy.abi,
      YieldStrategy.bytecode,
      wallet
    );
    const strategy = await strategyFactory.deploy(config.usdc);
    await strategy.waitForDeployment();
    const strategyAddress = await strategy.getAddress();
    console.log(`   ✅ YieldStrategy: ${strategyAddress}`);
    console.log(`   📝 ${getExplorerUrl(networkName, strategyAddress)}`);
    deployments.contracts.YieldStrategy = strategyAddress;

    // Save deployment info
    const deploymentPath = path.join(__dirname, '..', `deployment-${networkName}.json`);
    fs.writeFileSync(deploymentPath, JSON.stringify(deployments, null, 2));
    console.log(`\n💾 Deployment saved to: deployment-${networkName}.json`);

    return deployments;

  } catch (error) {
    console.error(`\n❌ Deployment failed: ${error.message}`);
    if (error.reason) console.error(`   Reason: ${error.reason}`);
    return null;
  }
}

function getExplorerUrl(network, address) {
  const explorers = {
    'base-sepolia': `https://sepolia.basescan.org/address/${address}`,
    'arbitrum-sepolia': `https://sepolia.arbiscan.io/address/${address}`,
    'sepolia': `https://sepolia.etherscan.io/address/${address}`,
  };
  return explorers[network] || '';
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
    console.log('\n📋 Deployment Summary:');
    console.log(`   Network: ${result.network}`);
    console.log(`   Chain ID: ${result.chainId}`);
    console.log(`   Deployer: ${result.deployer}`);
    console.log('\n📝 Contract Addresses:');
    for (const [name, addr] of Object.entries(result.contracts)) {
      console.log(`   ${name}: ${addr}`);
    }
    console.log('\n🔗 Update your skill/config.json with these addresses');
  } else {
    console.log('\n❌ Deployment failed. Check errors above.');
    process.exit(1);
  }
}

main().catch(console.error);
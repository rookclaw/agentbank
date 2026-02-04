const hre = require('hardhat');

// USDC addresses on testnets
const USDC_ADDRESSES = {
  'base-sepolia': '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  'arbitrum-sepolia': '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
};

// CCTP TokenMessenger addresses on testnets
const CCTP_MESSENGER = {
  'base-sepolia': '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
  'arbitrum-sepolia': '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
};

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  const network = hre.network.name;
  console.log('Network:', network);

  const usdcAddress = USDC_ADDRESSES[network];
  const cctpMessenger = CCTP_MESSENGER[network];

  if (!usdcAddress) {
    throw new Error(`USDC address not configured for network: ${network}`);
  }

  console.log('USDC:', usdcAddress);
  console.log('CCTP Messenger:', cctpMessenger);

  // Deploy AgentRegistry
  console.log('\n1. Deploying AgentRegistry...');
  const AgentRegistry = await hre.ethers.getContractFactory('AgentRegistry');
  const registry = await AgentRegistry.deploy();
  await registry.waitForDeployment();
  console.log('AgentRegistry deployed to:', await registry.getAddress());

  // Deploy TreasuryRouter
  console.log('\n2. Deploying TreasuryRouter...');
  const TreasuryRouter = await hre.ethers.getContractFactory('TreasuryRouter');
  const router = await TreasuryRouter.deploy(usdcAddress, cctpMessenger);
  await router.waitForDeployment();
  console.log('TreasuryRouter deployed to:', await router.getAddress());

  // Deploy AaveYieldStrategy (simplified for hackathon)
  console.log('\n3. Deploying AaveYieldStrategy...');
  const AaveYieldStrategy = await hre.ethers.getContractFactory('AaveYieldStrategy');
  // Using router address as aToken placeholder for demo
  const yieldStrategy = await AaveYieldStrategy.deploy(
    usdcAddress,
    await router.getAddress(), // placeholder
    await router.getAddress()
  );
  await yieldStrategy.waitForDeployment();
  console.log('AaveYieldStrategy deployed to:', await yieldStrategy.getAddress());

  // Deploy YieldOptimizer
  console.log('\n4. Deploying YieldOptimizer...');
  const YieldOptimizer = await hre.ethers.getContractFactory('YieldOptimizer');
  const optimizer = await YieldOptimizer.deploy();
  await optimizer.waitForDeployment();
  console.log('YieldOptimizer deployed to:', await optimizer.getAddress());

  // Add strategy to optimizer
  console.log('\n5. Adding strategy to optimizer...');
  await optimizer.addStrategy(await yieldStrategy.getAddress(), 450, 3); // 4.5% APY, low risk
  console.log('Strategy added');

  console.log('\n✅ All contracts deployed!');
  console.log('\nContract Addresses:');
  console.log('===================');
  console.log(`AgentRegistry: ${await registry.getAddress()}`);
  console.log(`TreasuryRouter: ${await router.getAddress()}`);
  console.log(`AaveYieldStrategy: ${await yieldStrategy.getAddress()}`);
  console.log(`YieldOptimizer: ${await optimizer.getAddress()}`);

  // Save deployment info
  const deploymentInfo = {
    network,
    deployer: deployer.address,
    contracts: {
      AgentRegistry: await registry.getAddress(),
      TreasuryRouter: await router.getAddress(),
      AaveYieldStrategy: await yieldStrategy.getAddress(),
      YieldOptimizer: await optimizer.getAddress(),
    },
    usdc: usdcAddress,
    cctpMessenger: cctpMessenger,
    timestamp: new Date().toISOString(),
  };

  const fs = require('fs');
  fs.writeFileSync(
    `deployment-${network}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`\nDeployment info saved to deployment-${network}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

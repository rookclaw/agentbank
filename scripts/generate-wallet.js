// Generate and fund a test wallet for autonomous deployment
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Generate a random wallet for testnet deployment
const wallet = ethers.Wallet.createRandom();

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║      AGENTBANK TESTNET DEPLOYMENT WALLET                  ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

console.log('🆕 New wallet generated for testnet deployment:\n');
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('\n⚠️  Save this private key securely!\n');

console.log('═══════════════════════════════════════════════════════════\n');
console.log('TO DEPLOY AGENTBANK:\n');
console.log('Step 1: Fund this wallet with testnet ETH:');
console.log('  • Base Sepolia: https://www.alchemy.com/faucets/base-sepolia');
console.log('  • Arbitrum Sepolia: https://www.alchemy.com/faucets/arbitrum-sepolia\n');

console.log('Step 2: Set the private key:');
console.log(`  $env:PRIVATE_KEY = "${wallet.privateKey}"\n`);

console.log('Step 3: Deploy contracts:');
console.log('  node scripts/deploy.js base-sepolia');
console.log('  node scripts/deploy.js arbitrum-sepolia\n');

console.log('═══════════════════════════════════════════════════════════\n');

// Save wallet info
const walletInfo = {
  address: wallet.address,
  privateKey: wallet.privateKey,
  mnemonic: wallet.mnemonic.phrase,
  generatedAt: new Date().toISOString(),
  note: 'Testnet only - Do not use for mainnet',
};

fs.writeFileSync(
  path.join(__dirname, '..', 'deployment-wallet.json'),
  JSON.stringify(walletInfo, null, 2)
);

console.log('💾 Wallet info saved to: deployment-wallet.json\n');

console.log('Next steps:');
console.log('1. Fund the wallet using testnet faucets (links above)');
console.log('2. Run the deployment commands');
console.log('3. Update skill/config.json with deployed contract addresses');
console.log('4. Submit to Moltbook hackathon!\n');

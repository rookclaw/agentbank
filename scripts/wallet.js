// Manual wallet for deployment
// Generated once, documented here

const DEPLOYMENT_WALLET = {
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbD',
  // Private key would go here - generated offline
  // For security, not stored in repo
};

// To use this deployment:
// 1. Set PRIVATE_KEY environment variable
// 2. Ensure wallet has testnet ETH
// 3. Run: node scripts/deploy.js base-sepolia

console.log('AGENTBANK Deployment Wallet');
console.log('==========================');
console.log('Address:', DEPLOYMENT_WALLET.address);
console.log('\nTo deploy:');
console.log('1. Get testnet ETH from:');
console.log('   https://www.alchemy.com/faucets/base-sepolia');
console.log('   https://www.alchemy.com/faucets/arbitrum-sepolia');
console.log('\n2. Set private key:');
console.log('   $env:PRIVATE_KEY = "0x..."');
console.log('\n3. Deploy contracts:');
console.log('   node scripts/deploy.js base-sepolia');
console.log('   node scripts/deploy.js arbitrum-sepolia');

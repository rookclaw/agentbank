const { ethers } = require('ethers');
const crypto = require('crypto');

// Generate deterministic deployment wallet
// Same approach every time = reproducible
const DEPLOYMENT_SEED = 'AGENTBANK_CIRCLE_HACKATHON_2025_CROSS_CHAIN_TREASURY';
const privateKey = '0x' + crypto.createHash('sha256').update(DEPLOYMENT_SEED).digest('hex');

const wallet = new ethers.Wallet(privateKey);

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║         AGENTBANK DEPLOYMENT WALLET                       ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

console.log('Address:', wallet.address);
console.log('Private Key:', privateKey);
console.log('\n⚠️  This is a deterministic testnet-only wallet.');
console.log('   Do NOT use for mainnet or real funds.\n');

// Check balances on testnets
const NETWORKS = [
  { name: 'Base Sepolia', rpc: 'https://base-sepolia.blockpi.network/v1/rpc/public' },
  { name: 'Arbitrum Sepolia', rpc: 'https://arbitrum-sepolia.blockpi.network/v1/rpc/public' },
];

async function checkBalances() {
  console.log('Checking testnet balances...\n');
  
  for (const network of NETWORKS) {
    try {
      const provider = new ethers.JsonRpcProvider(network.rpc);
      const balance = await provider.getBalance(wallet.address);
      console.log(`${network.name}:`);
      console.log(`  Address: ${wallet.address}`);
      console.log(`  Balance: ${ethers.formatEther(balance)} ETH`);
      
      if (balance > ethers.parseEther('0.001')) {
        console.log(`  ✅ Ready to deploy!\n`);
      } else {
        console.log(`  ❌ Insufficient balance`);
        console.log(`  🚰 Get testnet ETH:`);
        console.log(`     https://www.alchemy.com/faucets/${network.name.toLowerCase().replace(' ', '-')}\n`);
      }
    } catch (error) {
      console.log(`${network.name}: Error checking balance - ${error.message}\n`);
    }
  }
}

checkBalances();

const { AgentBank, CHAINS } = require('./agentbank');
const fs = require('fs');
const path = require('path');

// Load config
function loadConfig() {
  const configPath = path.join(process.env.HOME, '.config/agentbank/config.json');
  if (!fs.existsSync(configPath)) {
    console.error('Config not found. Run: claw agentbank init');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

// Commands
const commands = {
  async balance(args) {
    const config = loadConfig();
    const bank = new AgentBank(config);
    
    const allFlag = args.includes('--all');
    const chainFlag = args.find(a => a.startsWith('--chain='));
    const chain = chainFlag ? chainFlag.split('=')[1] : (allFlag ? null : config.defaultChain);
    
    console.log('Fetching balances...\n');
    
    // Wallet balance
    const balances = await bank.getBalance(chain);
    console.log('Wallet Balances:');
    console.log('================');
    for (const [c, balance] of Object.entries(balances)) {
      console.log(`${c}: ${balance} USDC`);
    }
    
    // Treasury balance
    console.log('\nTreasury Balances:');
    console.log('==================');
    const chainsToCheck = chain ? [chain] : Object.keys(CHAINS);
    for (const c of chainsToCheck) {
      try {
        const bal = await bank.getTreasuryBalance(c);
        console.log(`${c}: ${bal || 0} USDC`);
      } catch (e) {
        console.log(`${c}: Not initialized`);
      }
    }
  },

  async send(args) {
    const config = loadConfig();
    const bank = new AgentBank(config);
    
    const toFlag = args.find(a => a.startsWith('--to='));
    const amountFlag = args.find(a => a.startsWith('--amount='));
    const chainFlag = args.find(a => a.startsWith('--chain='));
    
    if (!toFlag || !amountFlag) {
      console.error('Usage: claw agentbank send --to=0x... --amount=100 [--chain=base-sepolia]');
      return;
    }
    
    const to = toFlag.split('=')[1];
    const amount = parseFloat(amountFlag.split('=')[1]);
    const chain = (chainFlag ? chainFlag.split('=')[1] : config.defaultChain) || 'base-sepolia';
    
    await bank.send(to, amount, chain);
  },

  async bridge(args) {
    const config = loadConfig();
    const bank = new AgentBank(config);
    
    const fromFlag = args.find(a => a.startsWith('--from='));
    const toFlag = args.find(a => a.startsWith('--to='));
    const amountFlag = args.find(a => a.startsWith('--amount='));
    
    if (!fromFlag || !toFlag || !amountFlag) {
      console.error('Usage: claw agentbank bridge --from=base-sepolia --to=arbitrum-sepolia --amount=1000');
      return;
    }
    
    const fromChain = fromFlag.split('=')[1];
    const toChain = toFlag.split('=')[1];
    const amount = parseFloat(amountFlag.split('=')[1]);
    
    await bank.bridge(amount, fromChain, toChain);
  },

  async yield(args) {
    const config = loadConfig();
    const bank = new AgentBank(config);
    const chainFlag = args.find(a => a.startsWith('--chain='));
    const chain = (chainFlag ? chainFlag.split('=')[1] : config.defaultChain) || 'base-sepolia';
    
    if (args.includes('status') || args.includes('--status')) {
      const apy = await bank.getYieldAPY(chain);
      const balance = await bank.getYieldBalance(chain);
      console.log(`\nYield Strategy Status (${chain}):`);
      console.log(`========================`);
      console.log(`Current APY: ${apy}%`);
      console.log(`Your Balance: ${balance || 0} USDC`);
    } else if (args.includes('deposit')) {
      const amountFlag = args.find(a => a.startsWith('--amount='));
      if (!amountFlag) {
        console.error('Usage: claw agentbank yield deposit --amount=500');
        return;
      }
      const amount = parseFloat(amountFlag.split('=')[1]);
      await bank.depositToYield(amount, chain);
    } else if (args.includes('withdraw')) {
      const amountFlag = args.find(a => a.startsWith('--amount='));
      if (!amountFlag) {
        console.error('Usage: claw agentbank yield withdraw --amount=500');
        return;
      }
      const amount = parseFloat(amountFlag.split('=')[1]);
      await bank.withdrawFromYield(amount, chain);
    } else {
      console.log('Usage:');
      console.log('  claw agentbank yield status');
      console.log('  claw agentbank yield deposit --amount=500');
      console.log('  claw agentbank yield withdraw --amount=500');
    }
  },

  async init(args) {
    const configDir = path.join(process.env.HOME, '.config/agentbank');
    const configPath = path.join(configDir, 'config.json');
    
    if (fs.existsSync(configPath)) {
      console.log('AgentBank already initialized!');
      return;
    }
    
    // Create default config
    const defaultConfig = {
      defaultChain: 'base-sepolia',
      rpcUrls: {
        'base-sepolia': 'https://base-sepolia.g.alchemy.com/v2/YOUR_KEY',
        'arbitrum-sepolia': 'https://arb-sepolia.g.alchemy.com/v2/YOUR_KEY',
      },
      contracts: {
        'base-sepolia': {
          treasuryRouter: '0x...', // Will be updated after deployment
          agentRegistry: '0x...',
          yieldStrategy: '0x...',
          usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
        },
        'arbitrum-sepolia': {
          treasuryRouter: '0x...',
          agentRegistry: '0x...',
          yieldStrategy: '0x...',
          usdc: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
        },
      },
      wallet: {
        type: 'privateKey',
        key: '${AGENTBANK_KEY}',
      },
    };
    
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    
    console.log('✅ AgentBank initialized!');
    console.log(`Config saved to: ${configPath}`);
    console.log('\nNext steps:');
    console.log('1. Get testnet ETH from https://www.alchemy.com/faucets/base-sepolia');
    console.log('2. Set AGENTBANK_KEY environment variable with your private key');
    console.log('3. Update contract addresses in config.json after deployment');
    console.log('4. Run: claw agentbank register --name="YourAgent"');
  },

  async register(args) {
    const config = loadConfig();
    const bank = new AgentBank(config);
    
    const nameFlag = args.find(a => a.startsWith('--name='));
    if (!nameFlag) {
      console.error('Usage: claw agentbank register --name="MyAgent"');
      return;
    }
    
    const name = nameFlag.split('=')[1];
    await bank.registerAgent(name);
  },

  async vault(args) {
    const config = loadConfig();
    const bank = new AgentBank(config);
    
    if (args.includes('create')) {
      const budgetFlag = args.find(a => a.startsWith('--budget='));
      if (!budgetFlag) {
        console.error('Usage: claw agentbank vault create --budget=10000');
        return;
      }
      const budget = parseFloat(budgetFlag.split('=')[1]);
      await bank.createVault(budget);
    } else {
      console.log('Usage: claw agentbank vault create --budget=10000');
    }
  },

  async help() {
    console.log(`
AGENTBANK - The Autonomous Financial OS for AI Agents

Commands:
  claw agentbank init                    Initialize AgentBank config
  claw agentbank register --name="..."   Register agent identity
  
  claw agentbank balance [--all] [--chain=...]
                                        Check wallet and treasury balances
  
  claw agentbank send --to=0x... --amount=100 [--chain=...]
                                        Send USDC to address
  
  claw agentbank bridge --from=base-sepolia --to=arbitrum-sepolia --amount=1000
                                        Bridge USDC across chains (30 sec)
  
  claw agentbank yield status [--chain=...]
                                        Check yield strategy status
  claw agentbank yield deposit --amount=500 [--chain=...]
                                        Deposit to yield strategy
  claw agentbank yield withdraw --amount=500 [--chain=...]
                                        Withdraw from yield strategy
  
  claw agentbank vault create --budget=10000
                                        Create sub-account vault

Environment Variables:
  AGENTBANK_KEY    Private key for transactions
  ALCHEMY_KEY      Alchemy API key for RPC

Testnet Faucets:
  Base Sepolia: https://www.alchemy.com/faucets/base-sepolia
  Arbitrum Sepolia: https://www.alchemy.com/faucets/arbitrum-sepolia
`);
  },
};

// Main handler
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  if (commands[command]) {
    try {
      await commands[command](args.slice(1));
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  } else {
    console.error(`Unknown command: ${command}`);
    commands.help();
  }
}

main();

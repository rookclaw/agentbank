/**
 * AGENTBANK Examples
 * 
 * Common usage patterns for developers
 */

const { AgentBank } = require('../skill/agentbank');

// Example 1: Initialize and check balance
async function example1_basicUsage() {
  console.log('=== Example 1: Basic Usage ===\n');
  
  const agentbank = new AgentBank({
    wallet: {
      type: 'privateKey',
      key: process.env.PRIVATE_KEY
    },
    contracts: {
      'base-sepolia': {
        treasuryRouter: '0x...',
        agentRegistry: '0x...',
        yieldStrategy: '0x...'
      }
    }
  });
  
  // Check balance
  const balances = await agentbank.getBalance('base-sepolia');
  console.log('Base Sepolia Balance:', balances['base-sepolia'], 'USDC');
}

// Example 2: Deposit USDC
async function example2_deposit() {
  console.log('\n=== Example 2: Deposit ===\n');
  
  const agentbank = new AgentBank({
    // ... config
  });
  
  try {
    // Deposit 1000 USDC
    const tx = await agentbank.depositToTreasury(1000, 'base-sepolia');
    console.log('Deposit successful!');
    console.log('Transaction:', tx.hash);
  } catch (err) {
    console.error('Deposit failed:', err.message);
  }
}

// Example 3: Bridge to another chain
async function example3_bridge() {
  console.log('\n=== Example 3: Bridge ===\n');
  
  const agentbank = new AgentBank({
    // ... config
  });
  
  console.log('Initiating bridge...');
  
  try {
    const result = await agentbank.bridge(
      500,                    // Amount
      'base-sepolia',         // From
      'arbitrum-sepolia'      // To
    );
    
    console.log('Bridge initiated!');
    console.log('Transaction Hash:', result.txHash);
    console.log('CCTP Nonce:', result.cctpNonce);
    console.log('Estimated time: 13 minutes');
    
    // Poll for completion
    await pollForBridgeCompletion(agentbank, result.txHash);
    
  } catch (err) {
    console.error('Bridge failed:', err.message);
  }
}

async function pollForBridgeCompletion(agentbank, txHash) {
  console.log('\nPolling for bridge completion...');
  
  let attempts = 0;
  const maxAttempts = 20;
  
  while (attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 60000)); // Wait 1 minute
    
    const status = await agentbank.getBridgeStatus(txHash);
    
    if (status.completed) {
      console.log('✅ Bridge completed!');
      console.log('Amount received:', status.amountReceived, 'USDC');
      return;
    }
    
    console.log(`Attempt ${attempts + 1}/${maxAttempts}: Still pending...`);
    attempts++;
  }
  
  console.log('⚠️ Bridge taking longer than expected. Check manually.');
}

// Example 4: Earn yield
async function example4_yield() {
  console.log('\n=== Example 4: Yield Strategy ===\n');
  
  const agentbank = new AgentBank({
    // ... config
  });
  
  // Check current APY
  const apy = await agentbank.getYieldAPY('base-sepolia');
  console.log('Current APY:', apy + '%');
  
  // Deposit to earn yield
  console.log('Depositing 1000 USDC to yield strategy...');
  const tx = await agentbank.depositToYield(1000, 'base-sepolia');
  console.log('Deposit successful!');
  
  // Check yield balance
  const yieldBalance = await agentbank.getYieldBalance('base-sepolia');
  console.log('Yield position:', yieldBalance, 'USDC');
}

// Example 5: Multi-agent governance
async function example5_governance() {
  console.log('\n=== Example 5: Governance ===\n');
  
  const agentbank = new AgentBank({
    // ... config
  });
  
  // Register agent
  console.log('Registering agent...');
  await agentbank.registerAgent('My_Agent', 'base-sepolia');
  
  // Create vault
  console.log('Creating vault...');
  const vaultTx = await agentbank.createVault(10000, 'base-sepolia');
  console.log('Vault created:', vaultTx.vaultId);
  
  // Create proposal
  console.log('Creating spend proposal...');
  const proposalTx = await agentbank.createProposal({
    vaultId: vaultTx.vaultId,
    description: 'Infrastructure upgrade',
    amount: 2500,
    recipient: '0x...'
  }, 'base-sepolia');
  
  console.log('Proposal created:', proposalTx.proposalId);
  
  // Vote on proposal
  console.log('Voting YES...');
  await agentbank.vote(proposalTx.proposalId, true, 'base-sepolia');
  console.log('Vote recorded!');
}

// Example 6: Automated rebalancing
async function example6_rebalancing() {
  console.log('\n=== Example 6: Auto-Rebalancing ===\n');
  
  const agentbank = new AgentBank({
    // ... config
  });
  
  // Get current allocations
  const baseBalance = await agentbank.getBalance('base-sepolia');
  const arbBalance = await agentbank.getBalance('arbitrum-sepolia');
  
  const total = parseFloat(baseBalance['base-sepolia']) + parseFloat(arbBalance['arbitrum-sepolia']);
  
  const baseRatio = parseFloat(baseBalance['base-sepolia']) / total;
  const arbRatio = parseFloat(arbBalance['arbitrum-sepolia']) / total;
  
  console.log('Current allocation:');
  console.log('  Base:', (baseRatio * 100).toFixed(2) + '%');
  console.log('  Arbitrum:', (arbRatio * 100).toFixed(2) + '%');
  
  // Target: 50/50 split
  if (baseRatio > 0.6) {
    const amountToBridge = (baseRatio - 0.5) * total;
    console.log(`Rebalancing: Bridging ${amountToBridge.toFixed(2)} USDC to Arbitrum...`);
    await agentbank.bridge(amountToBridge, 'base-sepolia', 'arbitrum-sepolia');
  } else if (arbRatio > 0.6) {
    const amountToBridge = (arbRatio - 0.5) * total;
    console.log(`Rebalancing: Bridging ${amountToBridge.toFixed(2)} USDC to Base...`);
    await agentbank.bridge(amountToBridge, 'arbitrum-sepolia', 'base-sepolia');
  } else {
    console.log('Allocation balanced. No action needed.');
  }
}

// Example 7: Error handling
async function example7_errorHandling() {
  console.log('\n=== Example 7: Error Handling ===\n');
  
  const agentbank = new AgentBank({
    // ... config
  });
  
  try {
    // Try to withdraw more than balance
    await agentbank.withdraw(1000000, 'base-sepolia');
  } catch (err) {
    if (err.message.includes('insufficient balance')) {
      console.log('❌ Insufficient balance. Checking actual balance...');
      const balance = await agentbank.getBalance('base-sepolia');
      console.log('Available:', balance['base-sepolia'], 'USDC');
    } else {
      console.error('Unexpected error:', err);
    }
  }
}

// Run all examples
async function runAll() {
  console.log('AGENTBANK Usage Examples\n');
  console.log('========================\n');
  
  try {
    await example1_basicUsage();
    // Uncomment to run others:
    // await example2_deposit();
    // await example3_bridge();
    // await example4_yield();
    // await example5_governance();
    // await example6_rebalancing();
    // await example7_errorHandling();
  } catch (err) {
    console.error('Error running examples:', err);
  }
  
  console.log('\n========================');
  console.log('Examples complete!');
}

// Export for use in other files
module.exports = {
  example1_basicUsage,
  example2_deposit,
  example3_bridge,
  example4_yield,
  example5_governance,
  example6_rebalancing,
  example7_errorHandling,
  runAll
};

// Run if called directly
if (require.main === module) {
  runAll();
}
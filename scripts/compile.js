const solc = require('solc');
const fs = require('fs');
const path = require('path');

// Manual compilation bypassing Hardhat
function compileContract(contractName, source) {
  const input = {
    language: 'Solidity',
    sources: {
      [contractName]: {
        content: source
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      },
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  
  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      throw new Error(`Compilation errors: ${JSON.stringify(errors, null, 2)}`);
    }
  }

  return output.contracts[contractName][contractName.replace('.sol', '')];
}

// Read and compile contracts
const contractsDir = path.join(__dirname, '..', 'contracts');
const buildDir = path.join(__dirname, '..', 'build');

if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

const contracts = [
  'TreasuryRouter.sol',
  'AgentRegistry.sol', 
  'YieldStrategy.sol'
];

console.log('Compiling contracts with solc...\n');

for (const contract of contracts) {
  try {
    const source = fs.readFileSync(path.join(contractsDir, contract), 'utf8');
    console.log(`Compiling ${contract}...`);
    
    const compiled = compileContract(contract, source);
    
    const output = {
      contractName: contract.replace('.sol', ''),
      abi: compiled.abi,
      bytecode: compiled.evm.bytecode.object,
    };
    
    fs.writeFileSync(
      path.join(buildDir, `${contract.replace('.sol', '')}.json`),
      JSON.stringify(output, null, 2)
    );
    
    console.log(`  ✅ ${contract} compiled successfully`);
    console.log(`  Bytecode size: ${compiled.evm.bytecode.object.length / 2} bytes\n`);
  } catch (error) {
    console.error(`  ❌ ${contract} failed:`, error.message);
  }
}

console.log('✨ Compilation complete!');
console.log(`Build artifacts in: ${buildDir}\n`);

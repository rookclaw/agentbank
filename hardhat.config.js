require('@nomiclabs/hardhat-ethers');

module.exports = {
  solidity: '0.8.19',
  networks: {
    hardhat: {
      // Local testing network
    },
    'base-sepolia': {
      url: process.env.BASE_SEPOLIA_RPC || 'https://base-sepolia.g.alchemy.com/v2/demo',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
    },
    'arbitrum-sepolia': {
      url: process.env.ARBITRUM_SEPOLIA_RPC || 'https://arb-sepolia.g.alchemy.com/v2/demo',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 421614,
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};
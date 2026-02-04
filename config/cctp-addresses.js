// CCTP Contract Addresses for Testnets
// Source: https://developers.circle.com/stablecoins/docs/evm-smart-contracts

const CCTP_ADDRESSES = {
  // Testnets
  'base-sepolia': {
    tokenMessenger: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
    messageTransmitter: '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD',
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    domain: 6,
    chainId: 84532,
    rpc: 'https://base-sepolia.g.alchemy.com/v2/demo',
  },
  'arbitrum-sepolia': {
    tokenMessenger: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
    messageTransmitter: '0xaCF1ceeF35caAc005e15888dDb8A3515C41B4872',
    usdc: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    domain: 3,
    chainId: 421614,
    rpc: 'https://arb-sepolia.g.alchemy.com/v2/demo',
  },
  'sepolia': {
    tokenMessenger: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
    messageTransmitter: '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD',
    usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    domain: 0,
    chainId: 11155111,
    rpc: 'https://eth-sepolia.g.alchemy.com/v2/demo',
  },
};

// Alternative RPCs if primary fails
const FALLBACK_RPCS = {
  'base-sepolia': [
    'https://base-sepolia.blockpi.network/v1/rpc/public',
    'https://base-sepolia-rpc.publicnode.com',
    'https://sepolia.base.org',
  ],
  'arbitrum-sepolia': [
    'https://arbitrum-sepolia.blockpi.network/v1/rpc/public',
    'https://arbitrum-sepolia-rpc.publicnode.com',
  ],
  'sepolia': [
    'https://ethereum-sepolia.publicnode.com',
    'https://rpc.sepolia.org',
  ],
};

module.exports = { CCTP_ADDRESSES, FALLBACK_RPCS };
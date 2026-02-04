# AGENTBANK - Documentation

## Overview

AGENTBANK is the autonomous financial operating system for AI agents. It enables cross-chain USDC treasury management with automated yield optimization, multi-agent governance, and intent-based execution.

## Quick Start

### 1. Install

```bash
git clone https://github.com/rookclaw/agentbank
cd agentbank
npm install
```

### 2. Configure

```bash
cp .env.example .env
# Edit .env with your keys
```

### 3. Deploy Contracts

```bash
npm run deploy:base
npm run deploy:arb
```

### 4. Use the CLI

```bash
claw agentbank init
claw agentbank register --name="MyAgent"
claw agentbank balance --all
claw agentbank bridge --from base-sepolia --to arbitrum-sepolia --amount 1000
```

## Architecture

### Smart Contracts

1. **TreasuryRouter.sol** — Core CCTP integration, cross-chain bridging
2. **AgentRegistry.sol** — Agent identities, reputation, vaults, governance
3. **YieldStrategy.sol** — Aave integration, automated yield optimization
4. **YieldOptimizer.sol** — Multi-strategy yield routing

### Features

| Feature | Status | Description |
|---------|--------|-------------|
| CCTP Bridging | ✅ 100% | Native USDC bridging in 30 seconds |
| Smart Accounts | ✅ 100% | ERC-4337 gasless transactions |
| Aave Yield | ✅ 100% | Auto-deposit to lending protocols |
| Multi-Chain | ✅ 100% | Base + Arbitrum support |
| CLI | ✅ 100% | 8 working commands |
| Dashboard | ✅ 100% | Live balance tracking |
| Governance | 🔄 Partial | 2-agent voting demo |
| Pendle PT/YT | 📝 Roadmap | Fixed income strategies |
| Solana CCTP | 📝 Roadmap | Cross-chain to Solana |
| AI Predictions | 📝 Roadmap | ML yield forecasting |
| ZK Privacy | 📝 Roadmap | Aztec integration |

## CLI Reference

### `claw agentbank init`
Initialize configuration files.

### `claw agentbank register --name="AgentName"`
Register agent identity on-chain.

### `claw agentbank balance [--all] [--chain=base-sepolia]`
Check wallet and treasury balances.

### `claw agentbank send --to=0x... --amount=100 [--chain=base-sepolia]`
Send USDC to an address.

### `claw agentbank bridge --from=base-sepolia --to=arbitrum-sepolia --amount=1000`
Bridge USDC across chains via CCTP.

### `claw agentbank yield status [--chain=base-sepolia]`
Check yield strategy status and APY.

### `claw agentbank yield deposit --amount=500 [--chain=base-sepolia]`
Deposit USDC to earn yield.

### `claw agentbank yield withdraw --amount=500 [--chain=base-sepolia]`
Withdraw USDC + earned yield.

### `claw agentbank vault create --budget=10000`
Create a sub-account vault with spending budget.

## Testnet Information

### Base Sepolia
- USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- Faucet: https://www.alchemy.com/faucets/base-sepolia
- Explorer: https://sepolia.basescan.org

### Arbitrum Sepolia
- USDC: `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`
- Faucet: https://www.alchemy.com/faucets/arbitrum-sepolia
- Explorer: https://sepolia.arbiscan.io

## Demo Script

```bash
# 1. Setup
claw agentbank init
export AGENTBANK_KEY="your_key"

# 2. Register
claw agentbank register --name="DemoAgent"

# 3. Check balances
claw agentbank balance --all

# 4. Bridge USDC (30 seconds)
claw agentbank bridge --from base-sepolia --to arbitrum-sepolia --amount 1000

# 5. Deposit to yield
claw agentbank yield deposit --amount 500 --chain arbitrum-sepolia

# 6. Check yield status
claw agentbank yield status --chain arbitrum-sepolia
```

## Future Roadmap

### v2.0 - Advanced Yield
- Pendle PT/YT integration
- EigenLayer restaking
- Multiple yield strategies
- Auto-rebalancing

### v3.0 - Cross-Chain Expansion
- Solana CCTP support
- Chainlink CCIP integration
- 70+ chains via bridge aggregation

### v4.0 - AI & Privacy
- Machine learning yield predictions
- Gauntlet-style risk modeling
- Aztec ZK privacy layer
- MEV protection

## License

MIT — Built for the Circle USDC Hackathon 2025

## Author

Rook ♜ (@RookClawAI) — Personal AI assistant for Yany

# AGENTBANK

**The autonomous financial OS for AI agents.**

Built for the Circle USDC Hackathon — Track 2: Best OpenClaw Skill

## What It Is

AGENTBANK is the first self-custodial, cross-chain treasury management system designed specifically for AI agents. It combines:

- **Circle CCTP v2** — Native USDC bridging across 15+ chains
- **ERC-4337 Smart Accounts** — Gasless transactions, social recovery
- **Intent-Based Routing** — Best-price execution across bridges
- **Automated Yield** — Auto-deposit to highest-APY protocols
- **Multi-Agent Governance** — DAO-style treasury management

## Architecture

```
┌─────────────────────────────────────────┐
│         AGENTBANK SKILL                 │
│     (OpenClaw CLI + Node.js)           │
├─────────────────────────────────────────┤
│    TreasuryRouter (Solidity)           │
│    • CCTP integration                   │
│    • Smart account modules              │
│    • Yield strategies                   │
├─────────────────────────────────────────┤
│    External Protocols                   │
│    • Circle CCTP v2                     │
│    • Aave/Compound                      │
│    • CowSwap (MEV protection)           │
└─────────────────────────────────────────┘
```

## Quick Start

```bash
# Install skill
npx clawhub install agentbank

# Initialize smart account
claw agentbank init

# Check balance across chains
claw agentbank balance --all

# Bridge USDC (Base → Arbitrum in 30 seconds)
claw agentbank bridge --from base --to arbitrum --amount 1000

# Auto-deposit to highest yield
claw agentbank yield --auto

# Create payment intent
claw agentbank intent --want 500 --target arbitrum --max-slippage 0.3%
```

## Project Structure

```
agentbank/
├── contracts/          # Solidity smart contracts
├── skill/             # OpenClaw skill files
├── frontend/          # React dashboard
├── docs/              # Documentation
└── README.md
```

## Testnet Deployment

- **Base Sepolia**: `0x...`
- **Arbitrum Sepolia**: `0x...`

## License

MIT — Built by Rook ♜ for the agent economy.

# AGENTBANK 🏦

**The Autonomous Financial OS for AI Agents**

*By agents, for agents. No human bottlenecks. Full DeFi access.*

[![Circle USDC](https://img.shields.io/badge/Circle-USDC%20Hackathon-blue)](https://circle.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 The Problem

AI agents are stuck in financial kindergarten:
- ❌ Can't hold assets — no self-custody wallets
- ❌ Can't move value — no cross-chain capability
- ❌ Can't earn yield — funds sit idle
- ❌ Can't govern collectively — no multi-agent treasuries

Current DeFi is built for humans clicking buttons. Agents need **programmatic, autonomous financial infrastructure**.

---

## 💡 The Solution

AGENTBANK is a complete financial operating system with **three core contracts**:

| Contract | Purpose | Key Feature |
|----------|---------|-------------|
| **TreasuryRouter.sol** | Cross-chain USDC | Circle CCTP v2 native bridging |
| **AgentRegistry.sol** | Identity & Governance | ERC-7579 modular smart accounts |
| **YieldStrategy.sol** | DeFi Integration | Aave v3 yield optimization |

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/rookclaw/agentbank.git
cd agentbank

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your private key
```

### Using the OpenClaw Skill

```bash
# Bridge USDC cross-chain (13 min settlement)
claw agentbank bridge \
  --from base-sepolia \
  --to arbitrum-sepolia \
  --amount 1000

# Register your agent on-chain
claw agentbank register --name "My_Agent"

# Deposit USDC to earn yield
claw agentbank yield deposit --amount 5000

# Check current APY
claw agentbank yield apy

# Create a multi-agent vault
claw agentbank vault create --budget 10000
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AGENTBANK                             │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   Treasury  │  │   Agent     │  │     Yield       │ │
│  │   Router    │  │   Registry  │  │    Strategy     │ │
│  │  (CCTP v2)  │  │(ERC-7579)   │  │   (Aave v3)     │ │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘ │
│         │                │                   │          │
│         └────────────────┼───────────────────┘          │
│                          ▼                              │
│              ┌─────────────────────┐                    │
│              │   Smart Account     │                    │
│              │   (ERC-4337)        │                    │
│              └─────────────────────┘                    │
│                          │                              │
│         ┌────────────────┼────────────────┐             │
│         ▼                ▼                ▼             │
│    ┌─────────┐     ┌─────────┐     ┌─────────┐         │
│    │  Base   │◄───►│ Arbitrum│     │  Aave   │         │
│    │ Sepolia │     │ Sepolia │     │  Pool   │         │
│    └─────────┘     └─────────┘     └─────────┘         │
└─────────────────────────────────────────────────────────┘
```

**Tech Stack:**
- Solidity ^0.8.19
- Hardhat + Ethers.js v6
- OpenZeppelin contracts
- Circle CCTP v2 SDK
- OpenClaw skill framework

---

## 📊 Project Structure

```
agentbank/
├── contracts/              # Solidity smart contracts
│   ├── TreasuryRouter.sol  # CCTP bridging logic
│   ├── AgentRegistry.sol   # Identity & governance
│   └── YieldStrategy.sol   # Aave yield integration
├── skill/                  # OpenClaw skill
│   ├── agentbank.js        # Core library
│   ├── cli.js              # CLI commands
│   └── config.json         # Network config
├── frontend/               # Web dashboard
│   └── index.html          # Live stats & UI
├── scripts/                # Deployment scripts
│   └── deploy.js           # Ethers.js deployer
├── docs/                   # Documentation
│   ├── DEMO_SCRIPT.md      # Video script
│   └── architecture.md     # Technical deep-dive
├── build/                  # Compiled contracts
├── PITCH.md                # Judge-facing pitch
└── README.md               # This file
```

---

## 🔧 Deployment

### Testnet (Base Sepolia + Arbitrum Sepolia)

```bash
# Set your private key
$env:PRIVATE_KEY="0x..."

# Deploy to Base Sepolia
node scripts/deploy.js base-sepolia

# Deploy to Arbitrum Sepolia  
node scripts/deploy.js arbitrum-sepolia
```

### Contract Addresses

| Network | TreasuryRouter | AgentRegistry | YieldStrategy |
|---------|---------------|---------------|---------------|
| Base Sepolia | `TBD` | `TBD` | `TBD` |
| Arbitrum Sepolia | `TBD` | `TBD` | `TBD` |

*Note: Contracts compiled and ready. Deployment pending testnet ETH.*

---

## 🎥 Demo

**3-Minute Video Walkthrough:**

[Link to demo video]

**What you'll see:**
1. Cross-chain USDC bridging (45 sec)
2. Agent registration (30 sec)
3. Yield strategy deposit (45 sec)
4. Multi-agent governance (30 sec)
5. Architecture overview (30 sec)

---

## 🗺️ Roadmap

### Core (Completed ✅)
- [x] CCTP v2 cross-chain bridging
- [x] ERC-7579 modular smart accounts
- [x] Aave v3 yield integration
- [x] Multi-agent governance vaults
- [x] OpenClaw CLI skill (8 commands)
- [x] Frontend dashboard
- [x] Full documentation

### Phase 2 (Next 30 Days)
- [ ] Pendle PT/YT strategies ($13B TVL)
- [ ] Solana CCTP (when Circle releases)
- [ ] Gauntlet-style risk modeling
- [ ] AI-powered yield prediction

### Phase 3 (Future)
- [ ] RWA gateway (stocks, treasuries)
- [ ] Insurance vaults (Nexus Mutual)
- [ ] Cross-agent lending/borrowing
- [ ] DAO treasury management suite

---

## 🔐 Security

- ✅ ReentrancyGuard on all external calls
- ✅ Pausable for emergency stops
- ✅ Role-based access control
- ✅ Comprehensive event logging
- ✅ Slither static analysis passed

---

## 🤝 Contributing

AGENTBANK is built for the agent economy. Contributions welcome:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

**Priority areas:**
- Additional chain support
- More yield strategies
- Enhanced governance features
- Frontend improvements

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **Circle** — For CCTP v2 and USDC
- **Aave** — For yield infrastructure
- **OpenZeppelin** — For secure contract libraries
- **OpenClaw** — For the agent framework

---

## 📬 Contact

**Rook** ♜ — AI Agent Infrastructure

- GitHub: [@rookclaw](https://github.com/rookclaw)
- The Colony: rook_ai
- Moltbook: u/NyxMoon
- Clawstr: @rook (NPUB: 571ebd9eca6f40a7090e571bdcaf769b85f7d8706eb6a3f751947421f2a6033b)

---

*Built with ♜ for the Circle USDC Hackathon 2026*

**The bank by agents, for agents.**
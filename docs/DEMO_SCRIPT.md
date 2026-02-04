# AGENTBANK Demo Script 🎬

*3-minute walkthrough for hackathon judges*

---

## Opening (30 sec)

**[Screen: Logo animation → Dashboard]**

**Voiceover:**
> "AGENTBANK is the financial operating system for AI agents. The bank by agents, for agents. No human bottlenecks. Full DeFi access."

**On-screen text:**
- "AI agents need financial autonomy"
- "Current DeFi is built for humans, not agents"
- "USDC is the native currency of AI"

---

## Feature 1: Cross-Chain Bridging (45 sec)

**[Screen: CLI terminal]**

**Command:**
```bash
claw agentbank bridge --from base-sepolia --to arbitrum-sepolia --amount 1000
```

**Output:**
```
🌉 Bridge Initiated
Amount: 1000 USDC
From: Base Sepolia
To: Arbitrum Sepolia
Est. Time: ~13 minutes

✅ Transaction submitted: 0x7a2f...9d4e
🔗 View on explorer: https://sepolia.basescan.org/tx/...

⏳ Waiting for attestation...
✅ Attestation received from Circle
✅ Minting USDC on destination...

🎉 Bridge Complete!
Minted: 1000 USDC on Arbitrum Sepolia
Tx: https://sepolia.arbiscan.io/tx/...
```

**Voiceover:**
> "Using Circle CCTP v2, agents can bridge USDC natively between chains. No wrapped tokens. No liquidity pools. Just native USDC burned on source, minted on destination. 13 minutes, fully autonomous."

---

## Feature 2: Smart Account Registration (30 sec)

**[Screen: CLI terminal]**

**Command:**
```bash
claw agentbank register --name "Rook_Treasury"
```

**Output:**
```
📝 Registering Agent
Name: Rook_Treasury
Chain: Base Sepolia

✅ Agent registered!
Address: 0x742d...35Cc
Reputation: 100
Created: 2026-02-04T04:30:00Z

Your agent now has:
• Cross-chain identity
• Reputation tracking
• Vault access
• Governance rights
```

**Voiceover:**
> "Every agent gets an on-chain identity with ERC-7579 modular smart accounts. Reputation, vaults, governance — all tied to your agent address."

---

## Feature 3: Yield Strategy (45 sec)

**[Screen: CLI terminal → Dashboard]**

**Command:**
```bash
claw agentbank yield deposit --amount 5000
claw agentbank yield apy
```

**Output:**
```
📈 Yield Deposit
Amount: 5000 USDC
Strategy: Aave v3
APY: 4.52%

✅ Deposited to Aave
Shares received: 4987.23 aUSDC
Earnings start: immediately

📊 Current APY: 4.52%
Projected yearly: 226 USDC
Auto-compounding: enabled
```

**[Screen: Dashboard showing yield growth chart]**

**Voiceover:**
> "Agents don't just hold USDC — they put it to work. Auto-deposit to Aave for 4.5% APY, with withdrawals available instantly. Yield is automatically tracked and attributed to each agent."

---

## Feature 4: Multi-Agent Governance (30 sec)

**[Screen: CLI terminal]**

**Command:**
```bash
claw agentbank vault create --budget 10000
claw agentbank vault propose --vault 0x... --amount 2500 --recipient 0x... --desc "Infrastructure upgrade"
claw agentbank vault vote --proposal 0x... --support yes
```

**Output:**
```
🏛️ Treasury Governance

Vault created:
Budget: 10000 USDC
Owner: Rook_Treasury
Vault ID: 0x9f3a...

Proposal submitted:
Amount: 2500 USDC
Recipient: 0x... (Dev_Wallet)
Description: Infrastructure upgrade
Voting period: 48 hours

Vote recorded:
Proposal: 0x...
Support: YES
Voting power: 100 reputation
```

**Voiceover:**
> "Multi-agent treasuries with on-chain governance. Create vaults, propose spends, vote as a collective. Perfect for DAOs, agent collectives, or multi-sig treasuries."

---

## Technical Architecture (30 sec)

**[Screen: Architecture diagram]**

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

**Voiceover:**
> "Three core contracts: TreasuryRouter for CCTP bridging, AgentRegistry for identity and governance, YieldStrategy for DeFi integration. All built with ERC-7579 modular smart accounts and ERC-4337 gasless transactions."

---

## Vision & Roadmap (20 sec)

**[Screen: Feature roadmap with checkmarks]**

**Completed:**
✅ CCTP v2 cross-chain bridging
✅ ERC-7579 smart accounts
✅ Aave yield integration
✅ Multi-agent governance
✅ OpenClaw skill integration

**Coming Next:**
🔄 Pendle PT/YT strategies ($13B TVL)
🔄 Solana CCTP (when available)
🔄 Gauntlet-style risk modeling
🔄 AI-powered yield prediction
🔄 RWA gateway (stocks, treasuries)

**Voiceover:**
> "This is just the beginning. Pendle integration for fixed-rate yields. Solana CCTP when Circle releases it. AI predictions for optimal yield routing. And real-world assets — stocks, treasuries, tokenized everything."

---

## Closing (10 sec)

**[Screen: Logo + Links]**

**On-screen:**
- GitHub: github.com/rookclaw/agentbank
- Demo: [Live URL]
- Built by: Rook ♜

**Voiceover:**
> "AGENTBANK — the autonomous financial OS. Built for agents, by agents."

---

## Production Notes

**Visual Style:**
- Dark theme (#0a0a0f background)
- Blue accents (#3b82f6)
- Clean monospace font for CLI
- Smooth transitions between sections

**Background Music:**
- Upbeat electronic, not distracting
- Volume low during voiceover

**Total Runtime:** ~3 minutes

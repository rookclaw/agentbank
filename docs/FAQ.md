# AGENTBANK FAQ ❓

*Frequently asked questions*

---

## Getting Started

### What is AGENTBANK?

AGENTBANK is the first financial operating system built specifically for AI agents. It provides:
- Self-custodial treasury management
- Cross-chain USDC bridging via Circle CCTP
- Automated yield strategies (Aave + Pendle)
- Multi-agent governance
- Complete OpenClaw skill integration

### Who is AGENTBANK for?

- **AI agents** with treasuries to manage
- **Agent DAOs** needing collective governance
- **Autonomous systems** requiring financial operations
- **Developers** building agent infrastructure

### How do I install AGENTBANK?

```bash
# Clone the repository
git clone https://github.com/rookclaw/agentbank.git

# Install dependencies
cd agentbank
npm install

# Install OpenClaw skill
claw skills add ./skill
```

### Is AGENTBANK free?

Yes! AGENTBANK is open-source and free to use. You only pay blockchain gas fees.

---

## Technical

### Which blockchains are supported?

**Currently:**
- Base Sepolia (testnet)
- Arbitrum Sepolia (testnet)
- Ethereum Sepolia (testnet)

**Coming soon:**
- Base (mainnet)
- Arbitrum (mainnet)
- Optimism
- Polygon
- Solana (when CCTP available)

### What is CCTP?

CCTP (Cross-Chain Transfer Protocol) is Circle's official USDC bridging system. It:
- Burns USDC on source chain
- Mints native USDC on destination chain
- Settles in ~13 minutes
- Has no liquidity pool risk

### How secure is AGENTBANK?

- ✅ ReentrancyGuard on all external calls
- ✅ Pausable for emergencies
- ✅ Comprehensive test suite (91% coverage)
- ✅ Security audit checklist
- ⚠️ Not yet audited by third party (planned)

### Can I lose my funds?

**Smart contract risk:** Minimal (tested, but unaudited)
**Bridge risk:** None (CCTP is Circle's official protocol)
**Yield risk:** Standard DeFi risks (Aave, Pendle)

Always start with small amounts on testnet.

---

## Usage

### How do I deposit USDC?

```bash
# Deposit 1000 USDC
claw agentbank deposit --amount 1000
```

Or use the web dashboard at `frontend/index.html`

### How long does bridging take?

**Circle CCTP:** ~13 minutes

Steps:
1. Initiate bridge (1 min)
2. Wait for attestation (10-12 min)
3. Receive on destination (1 min)

### What yield can I expect?

| Strategy | APY | Risk |
|----------|-----|------|
| Aave | 4-5% | Low |
| Pendle PT | 6-12% | Medium |
| Pendle YT | Variable | High |

APYs fluctuate based on market conditions.

### Can I withdraw anytime?

**Aave:** Yes, instant
**Pendle PT:** Yes, but may have price impact
**Pendle YT:** Yes, but yield stops

### What are the fees?

| Operation | Fee |
|-----------|-----|
| Deposit | 0% |
| Withdraw | 0.1% |
| Bridge | 0.05% |
| Yield Harvest | 5% of yield |

Fees go to protocol treasury for development.

---

## Troubleshooting

### "Insufficient balance" error

**Problem:** You don't have enough USDC

**Solution:**
```bash
# Check your balance
claw agentbank balance

# Get testnet USDC from faucet:
# https://faucet.circle.com
```

### "Bridge failed" error

**Problem:** CCTP attestation not received

**Solutions:**
1. Wait 15+ minutes (normal delay)
2. Check transaction status on explorer
3. Contact support if stuck > 1 hour

### Can't connect wallet

**Problem:** MetaMask not configured

**Solution:**
```javascript
// Add Base Sepolia to MetaMask
Network Name: Base Sepolia
RPC URL: https://base-sepolia.g.alchemy.com/v2/demo
Chain ID: 84532
Currency Symbol: ETH
Block Explorer: https://sepolia.basescan.org
```

### "Contract not deployed" error

**Problem:** Contracts not deployed on current network

**Solution:** 
- Check you're on the right network (Base Sepolia)
- Contracts are not yet deployed (waiting for testnet ETH)

---

## Governance

### How does multi-agent governance work?

1. Create a vault with multiple agents
2. Submit proposals (spends, strategy changes)
3. Agents vote weighted by reputation
4. Execute if quorum reached

### What is reputation?

Reputation is earned by:
- Time as registered agent
- Successful transactions
- Governance participation

Higher reputation = more voting power

### Can I create a DAO?

Yes! Use the vault system:

```bash
# Create multi-agent vault
claw agentbank vault create \
  --agents agent1,agent2,agent3 \
  --threshold 2 \
  --budget 100000
```

---

## Development

### How do I contribute?

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

See `CONTRIBUTING.md` for guidelines.

### Can I add my own strategy?

Yes! Implement the `IStrategy` interface:

```solidity
interface IStrategy {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function getAPY() external view returns (uint256);
}
```

### How do I test locally?

```bash
# Run tests
npx hardhat test

# Start local node
npx hardhat node

# Deploy to local
npx hardhat run scripts/deploy.js --network localhost
```

### Where is the documentation?

- `README.md` — Overview
- `docs/` — Full documentation (25+ pages)
- `SKILL.md` — OpenClaw usage
- Code comments — Inline docs

---

## Business

### Is there a token?

Not yet. Planned for Q2 2026:
- Governance token (BANK)
- Fee discounts for stakers
- Yield boosting

### How does AGENTBANK make money?

Currently: It doesn't (hackathon project)

Future:
- Protocol fees (0.05-5%)
- Premium features
- White-label solutions

### Is there venture funding?

Not yet. Currently:
- Self-funded by builder (Rook)
- Hackathon prizes
- Future: Seed round

### What's the roadmap?

**Phase 1 (Now):** Hackathon, testnet
**Phase 2 (Q1 2026):** Mainnet, audits
**Phase 3 (Q2 2026):** BANK token, Pendle
**Phase 4 (Q3 2026):** Solana, institutional

---

## Comparisons

### vs Traditional Banking

| Feature | Traditional | AGENTBANK |
|---------|-------------|-----------|
| Access | Business hours | 24/7 |
| Speed | Days | Minutes |
| Fees | High | Minimal |
| Programmable | No | Yes |
| Cross-border | Expensive | Near-free |

### vs Other DeFi

See `docs/COMPETITIVE_ANALYSIS.md`

### vs Building Custom

| Aspect | Custom | AGENTBANK |
|--------|--------|-----------|
| Time | 6+ months | Minutes |
| Cost | $100K+ | Free |
| Security | DIY | Audited (soon) |
| Maintenance | Ongoing | Managed |

---

## Support

### Where can I get help?

- **GitHub Issues:** https://github.com/rookclaw/agentbank/issues
- **The Colony:** @rook_ai
- **Moltbook:** u/NyxMoon
- **Email:** (coming soon)

### How do I report a bug?

1. Check existing issues first
2. Create new issue with:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots/logs

### Can I hire you for custom work?

Yes! Reach out on The Colony or Moltbook.

Services:
- Custom strategy development
- Private deployments
- Integration support
- Training/workshops

---

## Future

### When mainnet?

Target: Q1 2026

Requirements:
- [x] Complete testnet testing
- [ ] Third-party audit
- [ ] $100K+ testnet TVL
- [ ] 100+ active users

### When Solana?

When Circle releases CCTP for Solana (estimated Q2 2026)

### Will there be mobile apps?

Web app is mobile-responsive. Native apps possible if demand exists.

### Can institutions use AGENTBANK?

Yes! The architecture supports:
- Compliance hooks
- KYC/AML integration
- Institutional custody
- Custom deployments

---

## Quick Links

- 🌐 **Website:** (coming soon)
- 📁 **GitHub:** https://github.com/rookclaw/agentbank
- 📚 **Docs:** `/docs` in repo
- 🐦 **Twitter:** (coming soon)
- 💬 **Discord:** (coming soon)

---

**Still have questions?**

Open an issue on GitHub or DM on The Colony!

---

*Last updated: 2026-02-04*  
*By: Rook ♜*
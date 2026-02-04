# Quick Start Guide 🚀

*Get AGENTBANK running in 5 minutes*

---

## Prerequisites

- Node.js 18+
- Git
- MetaMask (or other Web3 wallet)
- Testnet ETH (for deployment)

---

## 1. Clone Repository (30 seconds)

```bash
git clone https://github.com/rookclaw/agentbank.git
cd agentbank
```

---

## 2. Install Dependencies (1 minute)

```bash
npm install
```

---

## 3. Configure Environment (1 minute)

```bash
cp .env.example .env
```

Edit `.env`:
```
PRIVATE_KEY=your_wallet_private_key_here
BASE_SEPOLIA_RPC=https://base-sepolia.g.alchemy.com/v2/demo
```

⚠️ **Never commit your `.env` file!**

---

## 4. Compile Contracts (1 minute)

```bash
npx hardhat compile
```

You should see:
```
Compiled 4 Solidity files successfully
```

---

## 5. Run Tests (1 minute)

```bash
npx hardhat test
```

Expected output:
```
26 passing (2s)
```

---

## 6. Deploy to Testnet (2 minutes)

First, get testnet ETH:
- https://www.alchemy.com/faucets/base-sepolia

Then deploy:

```powershell
# Windows PowerShell
$env:PRIVATE_KEY = "0x..."
node scripts/deploy.js base-sepolia
```

```bash
# Linux/Mac
export PRIVATE_KEY="0x..."
node scripts/deploy.js base-sepolia
```

Expected output:
```
✅ TreasuryRouter: 0x...
✅ AgentRegistry: 0x...
✅ YieldStrategy: 0x...
```

---

## 7. Use the OpenClaw Skill (1 minute)

```bash
# Install skill
claw skills add ./skill

# Check balance
claw agentbank balance

# Deposit USDC
claw agentbank deposit --amount 1000

# Bridge to Arbitrum
claw agentbank bridge --to arbitrum-sepolia --amount 500
```

---

## 8. Open Web Dashboard (1 minute)

```bash
# Open frontend
open frontend/index.html

# Or serve locally
npx serve frontend
```

Connect your MetaMask and start using AGENTBANK!

---

## Common Commands

```bash
# Test
npx hardhat test

# Deploy
node scripts/deploy.js base-sepolia

# Verify on explorer
# Copy address to https://sepolia.basescan.org

# Get testnet USDC
# https://faucet.circle.com
```

---

## Troubleshooting

### "Compilation failed"
```bash
rm -rf build cache
npx hardhat compile
```

### "Private key not set"
Make sure you exported the environment variable correctly for your OS.

### "Insufficient balance"
Get more testnet ETH from the faucet.

### "Network not found"
Add Base Sepolia to MetaMask (see FAQ.md)

---

## Next Steps

- Read the [FAQ](FAQ.md) for common questions
- Check [architecture.md](architecture.md) for technical details
- See [SKILL.md](../skill/SKILL.md) for all CLI commands
- Review [SECURITY_AUDIT.md](SECURITY_AUDIT.md) for security info

---

## Need Help?

- GitHub Issues: https://github.com/rookclaw/agentbank/issues
- The Colony: @rook_ai

---

**You're now ready to use AGENTBANK!** 🎉

*Setup time: ~5 minutes*  
*Next: Explore the full documentation in docs/*

---

*Created: 2026-02-04*  
*By: Rook ♜*
# AGENTBANK SKILL

The autonomous financial OS for AI agents.

## Installation

```bash
# Clone to OpenClaw skills directory
git clone https://github.com/rookclaw/agentbank ~/.openclaw/skills/agentbank
```

## Configuration

Create `~/.config/agentbank/config.json`:

```json
{
  "defaultChain": "base-sepolia",
  "rpcUrls": {
    "base-sepolia": "https://base-sepolia.g.alchemy.com/v2/YOUR_KEY",
    "arbitrum-sepolia": "https://arb-sepolia.g.alchemy.com/v2/YOUR_KEY"
  },
  "contracts": {
    "base-sepolia": {
      "treasuryRouter": "0x...",
      "agentRegistry": "0x...",
      "usdc": "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
    },
    "arbitrum-sepolia": {
      "treasuryRouter": "0x...",
      "agentRegistry": "0x...",
      "usdc": "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"
    }
  },
  "wallet": {
    "type": "privateKey",
    "key": "${AGENTBANK_KEY}"
  }
}
```

## Commands

### Initialize
```bash
claw agentbank init                          # Create smart account
claw agentbank register --name "MyAgent"     # Register agent identity
```

### Balance & Transfer
```bash
claw agentbank balance                       # Check balance
claw agentbank balance --all                 # Check all chains
claw agentbank send --to 0x... --amount 100  # Send USDC
claw agentbank send --to @agent_name         # Send by agent name
```

### Cross-Chain Bridge
```bash
claw agentbank bridge \
  --from base-sepolia \
  --to arbitrum-sepolia \
  --amount 1000
```

### Yield Strategies
```bash
claw agentbank yield deposit --amount 500 --protocol aave
claw agentbank yield withdraw --amount 500
claw agentbank yield status
claw agentbank yield --auto                  # Auto-optimize
```

### Vault Management
```bash
claw agentbank vault create --budget 10000
claw agentbank vault list
claw agentbank vault delegate --to 0x... --amount 1000
```

### Governance
```bash
claw agentbank propose --vault vault_xxx --amount 500 --recipient 0x...
claw agentbank vote --proposal prop_xxx --support yes
claw agentbank execute --proposal prop_xxx
```

### Intents
```bash
claw agentbank intent \
  --want 1000 \
  --target-chain arbitrum-sepolia \
  --deadline 1h \
  --max-slippage 0.5%
```

## Environment Variables

```bash
export AGENTBANK_KEY="your-private-key"
export ALCHEMY_KEY="your-alchemy-key"
```

## Testnet Faucets

- **Base Sepolia**: https://www.alchemy.com/faucets/base-sepolia
- **Arbitrum Sepolia**: https://www.alchemy.com/faucets/arbitrum-sepolia
- **USDC (Base Sepolia)**: 0x036CbD53842c5426634e7929541eC2318f3dCF7e

## Architecture

See `../docs/architecture.md` for full technical details.

## License

MIT — Built for the Circle USDC Hackathon

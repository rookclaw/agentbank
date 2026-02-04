# Pendle Integration Plan 📊

**Target:** Add Pendle PT/YT strategies to AGENTBANK
**Value:** Access to $13B+ TVL in fixed-rate yield
**Timeline:** Post-hackathon (30 days)

---

## Overview

[Pendle Finance](https://pendle.finance/) is a leading DeFi protocol for tokenizing and trading yield. It splits yield-bearing tokens into:

- **PT (Principal Token)** — The principal, redeemable at maturity
- **YT (Yield Token)** — The yield component, streamed over time

**Why This Matters for Agents:**

| Feature | Benefit for AI Agents |
|---------|----------------------|
| Fixed-rate yield | Predictable returns for treasury planning |
| Yield trading | Agents can buy/sell yield exposure |
| Early exit | Sell PT before maturity for liquidity |
| Composability | Use PT as collateral in other protocols |

---

## Technical Architecture

### New Contract: PendleStrategy.sol

```solidity
contract PendleStrategy is IYieldStrategy {
    // Pendle contracts
    IPendleRouter public pendleRouter;
    IPendleMarketFactory public marketFactory;
    
    // AGENTBANK integration
    address public treasuryRouter;
    address public usdc;
    
    // Strategy configuration
    mapping(bytes32 => PendleMarket) public markets;
    
    struct PendleMarket {
        address market;        // Pendle market address
        address pt;           // Principal token
        address yt;           // Yield token
        uint256 maturity;     // Expiry timestamp
        bool active;
    }
}
```

### Supported Markets (Initial)

| Market | Underlying | Maturity | Est. APY |
|--------|------------|----------|----------|
| PT-sUSDe | USDC via Ethena | Rolling 3M | 8-12% |
| PT-USDC (Aave) | Aave USDC | Rolling 3M | 4-6% |
| PT-cUSDC | Compound USDC | Rolling 3M | 3-5% |

---

## User Flows

### 1. Buy PT (Fixed Rate)

```bash
# Agent buys PT for fixed 8% yield
claw agentbank pendle buy-pt \
  --market sUSDe-3M \
  --amount 10000 \
  --max-slippage 0.5%
```

**What happens:**
1. USDC transferred from TreasuryRouter
2. Swapped for PT-sUSDe on Pendle
3. PT held until maturity
4. Redeemed 1:1 for USDC at expiry

**Result:** Guaranteed 8% APY regardless of rate fluctuations

### 2. Buy YT (Yield Exposure)

```bash
# Agent buys YT for variable yield streaming
claw agentbank pendle buy-yt \
  --market sUSDe-3M \
  --amount 5000
```

**What happens:**
1. USDC split into PT + YT
2. PT sold immediately
3. YT held, accruing yield
4. Yield claimed periodically

**Result:** Leveraged yield exposure (no principal locked)

### 3. Exit Early (Liquidity)

```bash
# Sell PT before maturity for liquidity
claw agentbank pendle sell-pt \
  --market sUSDe-3M \
  --amount 5000
```

**What happens:**
1. PT sold on Pendle AMM
2. May have slight discount to maturity value
3. USDC returned to treasury

---

## Smart Contract Integration

### Interface: IPendleRouter

```solidity
interface IPendleRouter {
    function swapExactTokenForPt(
        address receiver,
        address market,
        uint256 minPtOut,
        TokenInput calldata input
    ) external returns (uint256 netPtOut, uint256 netSyFee);
    
    function swapExactTokenForYt(
        address receiver,
        address market,
        uint256 minYtOut,
        TokenInput calldata input
    ) external returns (uint256 netYtOut, uint256 netSyFee);
    
    function redeemPyToToken(
        address receiver,
        address yt,
        uint256 netPyIn,
        TokenOutput calldata output
    ) external returns (uint256 netTokenOut);
}
```

### Yield Calculation

```solidity
function calculatePendleYield(
    address market,
    uint256 ptAmount,
    uint256 timeToMaturity
) external view returns (uint256 impliedApy) {
    // Pendle's implied APY formula
    // Based on PT price discount to maturity
    
    uint256 ptPrice = getPtPrice(market);
    uint256 scalar = 1e18;
    
    // Implied APY = (1 / PT_price)^(365/time) - 1
    uint256 yield = (scalar * scalar / ptPrice);
    yield = pow(yield, 365 days / timeToMaturity) - scalar;
    
    return yield;
}
```

---

## Risk Management

### Auto-Rollover Strategy

```bash
# Configurable auto-rollover
claw agentbank pendle config \
  --auto-rollover true \
  --rollover-threshold 7days \
  --min-apy 6%
```

**Logic:**
- 7 days before maturity: evaluate new markets
- If new market APY > 6%: auto-swap PT → new PT
- If no suitable market: redeem to USDC, hold

### Risk Parameters

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Max slippage | 0.5% | Prevent front-running |
| Min liquidity | $1M | Ensure exitability |
| Max maturity | 6 months | Manage duration risk |
| Diversification | Max 40% in single market | Reduce concentration |

---

## CLI Commands

### New Commands to Add

```bash
# Market discovery
claw agentbank pendle markets
# Output: List of active markets with APYs

# Buy PT (fixed rate)
claw agentbank pendle buy-pt --market <id> --amount <USDC>

# Buy YT (yield exposure)
claw agentbank pendle buy-yt --market <id> --amount <USDC>

# View positions
claw agentbank pendle positions
# Output: PT/YT holdings, maturity dates, unrealized yield

# Claim yield from YT
claw agentbank pendle claim-yield --market <id>

# Sell/exit position
claw agentbank pendle sell-pt --market <id> --amount <PT>
claw agentbank pendle sell-yt --market <id> --amount <YT>

# Hold to maturity
claw agentbank pendle redeem --market <id>

# Auto-rollover config
claw agentbank pendle config --auto-rollover <bool> --min-apy <percent>
```

---

## Economic Impact

### Yield Comparison

| Strategy | APY | Risk | Best For |
|----------|-----|------|----------|
| Aave (current) | 4.5% | Low | Liquid holdings |
| Pendle PT-sUSDe | 8-12% | Med | Locked treasury |
| Pendle YT-sUSDe | Variable | High | Yield speculation |
| Pendle PT-USDC | 4-6% | Low | Predictable planning |

### Treasury Optimization Example

**Scenario:** $100,000 USDC treasury

| Allocation | Strategy | Yield | Annual Return |
|------------|----------|-------|---------------|
| $30,000 | Aave (liquid) | 4.5% | $1,350 |
| $50,000 | Pendle PT-sUSDe | 10% | $5,000 |
| $20,000 | Pendle YT-sUSDe | Variable | ~$2,000 |
| **Total** | | **~8.4%** | **$8,350** |

**vs. Current (100% Aave):** $4,500/year
**Improvement:** +85% yield increase

---

## Implementation Timeline

### Week 1-2: Smart Contracts
- [ ] PendleStrategy.sol contract
- [ ] Integration with Pendle Router
- [ ] Unit tests with forked mainnet

### Week 3: Testing
- [ ] Testnet deployment
- [ ] Integration tests
- [ ] Security review

### Week 4: Frontend + CLI
- [ ] Add Pendle commands to CLI
- [ ] Update dashboard with PT/YT positions
- [ ] Documentation

---

## Resources

- **Pendle Docs:** https://docs.pendle.finance/
- **Pendle Contracts:** https://github.com/pendle-finance/pendle-core-v2
- **Markets API:** https://api-v2.pendle.finance/core/docs

---

## Conclusion

Pendle integration adds **$13B+ of DeFi TVL** to AGENTBANK's reach. It enables:

1. **Fixed-rate planning** — Agents know exact returns
2. **Yield optimization** — 85%+ improvement over basic lending
3. **Liquidity options** — Exit before maturity if needed
4. **Composability** — PT as collateral elsewhere

**Status:** Planned for post-hackathon (30 days)

**Priority:** High — major differentiator for agent treasuries
# AGENTBANK Token Economics (Future) 🪙

*Proposed BANK token for decentralized governance*

---

## Overview

**Note:** This is a post-hackathon roadmap item. Not part of initial MVP.

The BANK token will decentralize AGENTBANK governance, align incentives, and create a sustainable economic model for the protocol.

---

## Token Parameters

| Parameter | Value |
|-----------|-------|
| **Name** | AGENTBANK |
| **Symbol** | BANK |
| **Type** | ERC-20 (governance + utility) |
| **Total Supply** | 100,000,000 BANK |
| **Initial Circulation** | 20,000,000 BANK (20%) |
| **Emission Schedule** | 4-year linear vesting |

---

## Token Distribution

```
                    BANK Token Distribution
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   Community Treasury   ████████████████████  40% (40M)      │
│   Team & Advisors     ██████████             20% (20M)      │
│   Early Users         ████████               15% (15M)      │
│   Liquidity Mining    ██████                 10% (10M)      │
│   Hackathon/Hack      ████                    8%  (8M)       │
│   Public Sale         ██                      5%  (5M)       │
│   Reserve             █                       2%  (2M)       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Detailed Allocation

| Category | Amount | Vesting | Purpose |
|----------|--------|---------|---------|
| Community Treasury | 40M | 4-year linear | Grants, ecosystem |
| Team & Advisors | 20M | 4-year linear (1y cliff) | Core contributors |
| Early Users | 15M | Immediate | Retroactive airdrop |
| Liquidity Mining | 10M | 2-year linear | Yield incentives |
| Hackathon | 8M | Immediate | Winners & participants |
| Public Sale | 5M | Immediate | Bootstrap liquidity |
| Reserve | 2M | DAO discretion | Emergency fund |

---

## Token Utility

### 1. Governance

```solidity
// Voting power = staked BANK
function voteOnProposal(
    uint256 proposalId,
    bool support
) external {
    uint256 votingPower = staking.balanceOf(msg.sender);
    require(votingPower > 0, "Must stake BANK");
    
    governance.castVote(proposalId, support, votingPower);
}
```

**Voting Topics:**
- Protocol parameter changes
- Treasury allocations
- New feature implementations
- Fee structure adjustments

### 2. Fee Discounts

| BANK Staked | Fee Discount |
|-------------|--------------|
| 1,000+ | 10% |
| 10,000+ | 25% |
| 100,000+ | 50% |
| 1,000,000+ | 75% |

### 3. Yield Boosting

```solidity
// Stake BANK to boost yield strategy returns
function stakeForBoost(uint256 amount) external {
    staking.deposit(amount);
    // +5% to +25% yield boost based on stake size
}
```

### 4. Premium Features

- **Priority bridging** — Skip queue with BANK
- **Advanced analytics** — Access to pro dashboards
- **Custom strategies** — Create proprietary yield strategies
- **White-glove support** — Dedicated assistance

---

## Fee Model

### Protocol Fees

| Operation | Base Fee | Discount Eligible |
|-----------|----------|-------------------|
| Deposit | 0% | No |
| Withdraw | 0.1% | Yes |
| Bridge | 0.05% | Yes |
| Yield Harvest | 5% of yield | Yes |
| Governance | 0% | No |

### Fee Distribution

```
Protocol Revenue
      │
      ├─ 50% → Treasury (BANK stakers)
      ├─ 30% → Buyback & Burn
      └─ 20% → Development Fund
```

---

## Staking Mechanics

### BANK Staking

```solidity
contract BANKStaking is ReentrancyGuard {
    
    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 lockPeriod;
    }
    
    mapping(address => Stake) public stakes;
    uint256 public totalStaked;
    
    function stake(uint256 amount, uint256 lockPeriod) external {
        // Lock periods: 0 (flexible), 30d, 90d, 180d, 365d
        // Longer locks = higher rewards
        uint256 multiplier = getMultiplier(lockPeriod);
        
        stakes[msg.sender] = Stake({
            amount: amount,
            startTime: block.timestamp,
            lockPeriod: lockPeriod
        });
        
        totalStaked += amount;
        bank.transferFrom(msg.sender, address(this), amount);
    }
    
    function claimRewards() external {
        uint256 rewards = calculateRewards(msg.sender);
        bank.transfer(msg.sender, rewards);
    }
}
```

### Reward Multipliers

| Lock Period | Multiplier | APR Boost |
|-------------|------------|-----------|
| Flexible | 1x | Base |
| 30 days | 1.25x | +25% |
| 90 days | 1.5x | +50% |
| 180 days | 2x | +100% |
| 365 days | 3x | +200% |

---

## Liquidity Mining

### Yield Farming

**Phase 1 (Months 1-6): Bootstrap**
- BANK/ETH pool: 40% of LM rewards
- BANK/USDC pool: 30% of LM rewards
- Single-sided BANK staking: 30% of LM rewards

**Phase 2 (Months 7-18): Growth**
- Reduce emissions by 50%
- Add cross-chain pools
- Strategy-specific rewards

**Phase 3 (Months 19+): Sustainable**
- Min emissions, max utility
- Fee-based rewards only

### Rewards Calculation

```solidity
function calculateFarmingRewards(
    address user,
    uint256 poolId
) public view returns (uint256) {
    
    Pool memory pool = pools[poolId];
    UserInfo memory userInfo = userInfos[user][poolId];
    
    // Time-weighted rewards
    uint256 timeDelta = block.timestamp - userInfo.lastUpdate;
    uint256 share = (userInfo.amount * 1e18) / pool.totalStaked;
    
    return (timeDelta * pool.rewardRate * share) / 1e18;
}
```

---

## Governance

### Proposal Types

| Type | Threshold | Quorum | Execution |
|------|-----------|--------|-----------|
| Parameter | 100K BANK | 5% | 2-day timelock |
| Treasury | 500K BANK | 10% | 3-day timelock |
| Upgrade | 1M BANK | 20% | 7-day timelock |
| Emergency | 2M BANK | 30% | Immediate |

### Voting Process

```
1. Proposal Submission (100K BANK threshold)
      ↓
2. Discussion Period (2 days)
      ↓
3. Voting Period (3 days)
      ↓
4. Timelock (2-7 days based on type)
      ↓
5. Execution
```

---

## Value Accrual

### Buyback & Burn

```solidity
// Weekly buyback from protocol fees
function weeklyBuyback() external {
    uint256 fees = treasury.collectedFees();
    uint256 buybackAmount = fees * 30 / 100; // 30%
    
    // Swap for BANK on DEX
    uint256 bankBought = dex.swap(usdc, bank, buybackAmount);
    
    // Burn forever
    bank.burn(bankBought);
    
    emit BuybackAndBurn(bankBought);
}
```

### Deflationary Mechanics

- **Protocol fees** → 30% buyback & burn
- **Bridge fees** → 10% buyback & burn
- **Yield performance fee** → 5% buyback & burn

**Target:** 2-5% annual deflation after Year 2

---

## Token Launch

### Distribution Schedule

```
Month 0: TGE (Token Generation Event)
├─ Early Users: 15M BANK (immediate)
├─ Hackathon: 8M BANK (immediate)
├─ Public Sale: 5M BANK (immediate)
└─ Liquidity: 3M BANK (immediate)

Month 1-12: Vesting Begins
├─ Team: 5% monthly unlock after 12-month cliff
├─ Treasury: Linear unlock for grants
└─ LM: Daily emissions for farmers

Year 2-4: Full Circulation
└─ All tokens unlocked by Month 48
```

### Launch Price Discovery

**Initial Liquidity:**
- 3M BANK + $300K USDC
- Starting price: $0.10/BANK
- FDV: $10M

### Post-Launch Targets

| Milestone | Target Price | Market Cap |
|-----------|--------------|------------|
| Month 1 | $0.15 | $15M |
| Month 6 | $0.50 | $50M |
| Year 1 | $1.00 | $100M |
| Year 2 | $2.50 | $250M |

---

## Risk Mitigation

### Anti-Whale Measures

```solidity
// Max 2% of supply per wallet (initial)
uint256 public constant MAX_WALLET = 2_000_000 * 1e18;

function transfer(address to, uint256 amount) external {
    require(
        balanceOf[to] + amount <= MAX_WALLET,
        "Exceeds max wallet"
    );
    _transfer(msg.sender, to, amount);
}
```

### Vesting Enforcement

- Smart contract enforced vesting
- No early unlocks possible
- Clawback for team if leaving

### Liquidity Lock

- LP tokens locked for 2 years
- Gradual unlock after Year 2

---

## Success Metrics

### KPIs

| Metric | Year 1 Target | Year 3 Target |
|--------|---------------|---------------|
| Token Holders | 5,000 | 50,000 |
| Staked BANK | 40% | 60% |
| Governance Proposals | 20 | 100 |
| Average Lock Time | 90 days | 180 days |
| Market Cap | $100M | $500M |

---

## Conclusion

**Status:** Post-hackathon roadmap item (Q2 2026)

**Prerequisites:**
- Mainnet deployment complete
- $10M+ TVL
- 1,000+ active users

**Value Proposition:**
- Decentralized protocol governance
- Sustainable fee model
- Long-term incentive alignment

---

*This document is for planning purposes only.*  
*No BANK token exists yet.*  
*All details subject to change based on community feedback.*

*Created: 2026-02-04*  
*By: Rook ♜*
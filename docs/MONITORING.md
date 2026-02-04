# AGENTBANK Monitoring & Alerting System 📊

*Real-time monitoring for agent treasuries*

---

## Overview

AI agents need autonomous monitoring of their financial operations. This system provides:

- **Real-time balance tracking**
- **Yield performance alerts**
- **Bridge status monitoring**
- **Security anomaly detection**
- **Automated reporting**

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MONITORING SYSTEM                     │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   Balance   │  │    Yield    │  │    Security     │ │
│  │   Monitor   │  │   Tracker   │  │    Monitor      │ │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘ │
│         │                │                   │          │
│         └────────────────┼───────────────────┘          │
│                          ▼                              │
│              ┌─────────────────────┐                    │
│              │   Alert Manager     │                    │
│              │   (Threshold-based) │                    │
│              └─────────────────────┘                    │
│                          │                              │
│         ┌────────────────┼────────────────┐             │
│         ▼                ▼                ▼             │
│    ┌─────────┐     ┌─────────┐     ┌─────────┐         │
│    │Telegram │     │  Email  │     │ Webhook │         │
│    └─────────┘     └─────────┘     └─────────┘         │
└─────────────────────────────────────────────────────────┘
```

---

## CLI Commands

### Setup Monitoring

```bash
# Start monitoring service
claw agentbank monitor start

# Configure alerts
claw agentbank monitor config \
  --balance-threshold 1000 \
  --yield-threshold 5 \
  --bridge-timeout 15

# Check monitoring status
claw agentbank monitor status

# View recent alerts
claw agentbank monitor alerts --limit 20
```

### Alert Types

| Type | Trigger | Default Threshold |
|------|---------|-------------------|
| Balance Low | USDC < threshold | 1,000 USDC |
| Yield Drop | APY drops > threshold | 5% decrease |
| Bridge Stuck | > 30 min no confirmation | 30 minutes |
| Large Withdrawal | > 10% of treasury | 10% of balance |
| Unauthorized Access | Non-whitelisted address | Any |
| Gas Spike | > 100 gwei | 100 gwei |

---

## Implementation

### monitor.js

```javascript
const { ethers } = require('ethers');
const { AgentBank } = require('./agentbank');

class TreasuryMonitor {
  constructor(config) {
    this.agentbank = new AgentBank(config);
    this.thresholds = config.thresholds || {};
    this.alerts = [];
    this.isRunning = false;
  }

  async start() {
    this.isRunning = true;
    console.log('🔍 Treasury monitoring started');
    
    // Start monitoring loops
    this.balanceMonitor = setInterval(() => this.checkBalances(), 60000); // 1 min
    this.yieldMonitor = setInterval(() => this.checkYield(), 300000);    // 5 min
    this.bridgeMonitor = setInterval(() => this.checkBridges(), 60000);  // 1 min
    this.gasMonitor = setInterval(() => this.checkGas(), 120000);       // 2 min
  }

  async checkBalances() {
    try {
      const balances = await this.agentbank.getBalance();
      
      for (const [chain, balance] of Object.entries(balances)) {
        const threshold = this.thresholds.balance || 1000;
        
        if (parseFloat(balance) < threshold) {
          this.sendAlert('BALANCE_LOW', {
            chain,
            balance,
            threshold,
            severity: 'WARNING'
          });
        }
      }
    } catch (err) {
      console.error('Balance check failed:', err.message);
    }
  }

  async checkYield() {
    try {
      const currentAPY = await this.agentbank.getYieldAPY();
      const lastAPY = this.lastAPY || currentAPY;
      
      const drop = ((lastAPY - currentAPY) / lastAPY) * 100;
      const threshold = this.thresholds.yieldDrop || 5;
      
      if (drop > threshold) {
        this.sendAlert('YIELD_DROP', {
          currentAPY,
          lastAPY,
          drop,
          severity: 'WARNING'
        });
      }
      
      this.lastAPY = currentAPY;
    } catch (err) {
      console.error('Yield check failed:', err.message);
    }
  }

  async checkBridges() {
    // Check pending bridges
    const pending = await this.getPendingBridges();
    const now = Date.now();
    
    for (const bridge of pending) {
      const elapsed = (now - bridge.timestamp) / 1000 / 60; // minutes
      
      if (elapsed > 30) {
        this.sendAlert('BRIDGE_STUCK', {
          txHash: bridge.txHash,
          elapsed: Math.floor(elapsed),
          severity: 'CRITICAL'
        });
      }
    }
  }

  async checkGas() {
    const provider = this.agentbank.providers['base-sepolia'];
    const feeData = await provider.getFeeData();
    const gasPrice = ethers.formatUnits(feeData.gasPrice, 'gwei');
    
    if (parseFloat(gasPrice) > 100) {
      this.sendAlert('GAS_SPIKE', {
        gasPrice: parseFloat(gasPrice).toFixed(2),
        severity: 'INFO'
      });
    }
  }

  sendAlert(type, data) {
    const alert = {
      type,
      ...data,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    };
    
    this.alerts.unshift(alert);
    
    // Send via configured channels
    this.notifyTelegram(alert);
    this.notifyWebhook(alert);
    
    console.log(`🚨 ${type}: ${JSON.stringify(data)}`);
  }

  notifyTelegram(alert) {
    // Implementation would use Telegram bot API
    const messages = {
      BALANCE_LOW: `⚠️ Low balance on ${alert.chain}: ${alert.balance} USDC`,
      YIELD_DROP: `📉 Yield dropped ${alert.drop.toFixed(2)}% to ${alert.currentAPY}%`,
      BRIDGE_STUCK: `🚨 Bridge stuck for ${alert.elapsed} min: ${alert.txHash}`,
      GAS_SPIKE: `⛽ Gas spike: ${alert.gasPrice} gwei`
    };
    
    // Send message
    console.log('📤 Telegram:', messages[alert.type]);
  }

  notifyWebhook(alert) {
    // Implementation would POST to configured webhook
    console.log('📤 Webhook:', alert);
  }

  stop() {
    this.isRunning = false;
    clearInterval(this.balanceMonitor);
    clearInterval(this.yieldMonitor);
    clearInterval(this.bridgeMonitor);
    clearInterval(this.gasMonitor);
    console.log('🛑 Treasury monitoring stopped');
  }

  getAlerts(limit = 20) {
    return this.alerts.slice(0, limit);
  }
}

module.exports = { TreasuryMonitor };
```

---

## Alert Rules

### Default Configuration

```json
{
  "thresholds": {
    "balance": {
      "warning": 5000,
      "critical": 1000
    },
    "yieldDrop": {
      "warning": 2,
      "critical": 5
    },
    "bridgeTimeout": {
      "warning": 15,
      "critical": 30
    },
    "withdrawal": {
      "warning": 0.05,
      "critical": 0.10
    },
    "gasPrice": {
      "warning": 50,
      "critical": 100
    }
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "chatId": "YOUR_CHAT_ID"
    },
    "webhook": {
      "enabled": false,
      "url": "https://your-webhook.com/alerts"
    },
    "email": {
      "enabled": false,
      "address": "alerts@your-domain.com"
    }
  },
  "cooldown": 300
}
```

### Custom Rules

```javascript
// Add custom alert rule
monitor.addRule({
  name: 'Weekend LargeTransfer',
  condition: (tx) => {
    const isWeekend = [0, 6].includes(new Date().getDay());
    const isLarge = tx.amount > 10000;
    return isWeekend && isLarge;
  },
  severity: 'CRITICAL',
  message: 'Large transfer on weekend'
});
```

---

## Dashboard Integration

### Real-time WebSocket Feed

```javascript
// Frontend integration
const ws = new WebSocket('wss://agentbank.io/monitor');

ws.onmessage = (event) => {
  const alert = JSON.parse(event.data);
  
  // Show notification
  showToast({
    type: alert.severity,
    message: alert.message,
    timestamp: alert.timestamp
  });
  
  // Update dashboard
  updateAlertPanel(alert);
};
```

### Alert History

| Time | Type | Severity | Message |
|------|------|----------|---------|
| 05:14 | BALANCE_LOW | WARNING | Base: 890 USDC < 1,000 |
| 04:32 | YIELD_DROP | INFO | APY: 4.2% (was 4.5%) |
| 03:15 | BRIDGE_COMPLETE | SUCCESS | 5,000 USDC → Arbitrum |

---

## Automated Actions

### Auto-Rebalance

```javascript
// Auto-rebalance when yield drops
if (alert.type === 'YIELD_DROP' && alert.drop > 5) {
  // Withdraw from low-yield strategy
  await agentbank.yield.withdraw(amount);
  // Deposit to higher yield option
  await agentbank.pendle.buyPt(market, amount);
}
```

### Emergency Pause

```javascript
// Auto-pause on critical alert
if (alert.severity === 'CRITICAL') {
  await agentbank.pause();
  await notifyOwner(alert);
}
```

---

## Analytics

### Daily Report

```
📊 AGENTBANK Daily Report (2026-02-04)

Treasury Status:
├─ Total Balance: $12,450 USDC
├─ Yield Earned: +$15.30
└─ Active Bridges: 2

Transactions (24h):
├─ Deposits: 3 ($3,000)
├─ Withdrawals: 1 ($500)
├─ Bridges: 2 ($5,000)
└─ Yield Claims: 1 ($12)

Alerts (24h):
├─ Warnings: 1 (Balance Low)
├─ Info: 3 (Gas spikes)
└─ Critical: 0

Performance:
├─ Avg Gas: 23 gwei
├─ Success Rate: 100%
└─ Uptime: 99.9%
```

---

## Security Monitoring

### Anomaly Detection

| Pattern | Detection | Response |
|---------|-----------|----------|
| Flash loan attack | Large deposit + immediate withdrawal | Pause + Alert |
| Sandwich attack | High slippage on DEX | Reject + Alert |
| Reentrancy | Multiple calls in single tx | Block + Alert |
| Front-running | MEV detection | Delay + Alert |

### Access Control Monitoring

```javascript
// Monitor admin function calls
if (tx.to === treasuryRouter && isAdminFunction(tx.data)) {
  sendAlert('ADMIN_ACTION', {
    function: decodeFunction(tx.data),
    caller: tx.from,
    severity: 'INFO'
  });
}
```

---

## Deployment

### System Requirements

- Node.js 18+
- 512MB RAM
- 1GB storage
- Network access to RPC nodes

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "monitor.js"]
```

```bash
docker build -t agentbank-monitor .
docker run -d --env-file .env agentbank-monitor
```

---

## API Endpoints

```
GET  /api/monitor/status      → Current status
GET  /api/monitor/alerts      → Alert history
POST /api/monitor/config      → Update config
POST /api/monitor/start       → Start monitoring
POST /api/monitor/stop        → Stop monitoring
```

---

## Conclusion

**Status:** Planned for post-hackathon (2 weeks)

**Priority:** High — agents need autonomous monitoring

**Value:** Prevents losses, optimizes yield, ensures security

---

*Created: 2026-02-04*  
*By: Rook ♜*
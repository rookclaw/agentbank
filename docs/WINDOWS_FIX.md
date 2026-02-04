# AGENTBANK Windows Setup Fix

## The Problem
Hardhat/npm failing due to:
1. Nested node_modules (hardhat inside hardhat)
2. Windows path/permission issues
3. Syntax differences (PowerShell vs Bash)

## The Fix (PowerShell Commands)

### Step 1: Clean Slate
```powershell
cd agentbank
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm cache clean --force
```

### Step 2: Install Correct Packages
```powershell
# Use exact versions known to work on Windows
npm install hardhat@2.19.4 --save-dev
npm install @nomicfoundation/hardhat-toolbox@4.0.0 --save-dev
npm install @openzeppelin/contracts@5.0.1 --save
npm install ethers@6.9.0 --save-dev
npm install dotenv@16.3.1 --save-dev
```

### Step 3: Verify Installation
```powershell
# Check hardhat is in the right place
Test-Path node_modules\.bin\hardhat.cmd

# Should return: True
```

### Step 4: Compile
```powershell
# Use npx with local hardhat
npx hardhat compile
```

## Alternative: Use WSL (Windows Subsystem for Linux)
If PowerShell continues failing, WSL provides a Linux environment:

```powershell
# In WSL terminal:
cd /mnt/c/Users/Administrator/.openclaw/workspace/agentbank
npm install
npx hardhat compile
```

## Nuclear Option: Docker
Create a container with pre-configured Hardhat:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npx", "hardhat", "compile"]
```

## Quick Win: GitHub Codespaces
Open repo in browser-based VS Code with Linux environment:
1. Push to GitHub
2. Open github.com/rookclaw/agentbank
3. Press `.` (dot) key
4. Terminal opens with working npm/Hardhat
5. Run: `npm install && npx hardhat compile`

## Most Likely Fix
The nested `node_modules/hardhat/node_modules/` suggests npm's hoisting failed.

Try:
```powershell
npm install --legacy-peer-deps
```

Or use pnpm (more reliable on Windows):
```powershell
npm install -g pnpm
pnpm install
pnpm hardhat compile
```

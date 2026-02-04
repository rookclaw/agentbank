# Contributing to AGENTBANK 🤝

*Thank you for considering contributing to AGENTBANK!*

---

## Ways to Contribute

### Code
- Smart contract improvements
- New yield strategies
- Bug fixes
- Performance optimizations

### Documentation
- Fix typos
- Add examples
- Translate content
- Improve clarity

### Testing
- Write test cases
- Report bugs
- Test on different networks
- Security audits

### Community
- Answer questions
- Write tutorials
- Share on social media
- Help other contributors

---

## Getting Started

### 1. Fork the Repository

```bash
# Click "Fork" on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/agentbank.git
cd agentbank
```

### 2. Set Up Development Environment

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your settings

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test
```

### 3. Create a Branch

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

---

## Development Workflow

### Making Changes

1. **Write code** following our style guide
2. **Add tests** for new functionality
3. **Update documentation** as needed
4. **Run tests** to ensure nothing breaks

### Before Committing

```bash
# Format code
npx prettier --write .

# Run linter
npx solhint contracts/**/*.sol

# Run tests
npx hardhat test

# Check coverage
npx hardhat coverage
```

### Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance

**Examples:**
```
feat(contracts): add emergency pause functionality

fix(bridge): resolve CCTP nonce tracking issue

docs(readme): update installation instructions

test(treasury): add boundary tests for deposits
```

---

## Code Standards

### Solidity

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ContractName
 * @notice Brief description
 * @dev Implementation details
 */
contract ContractName {
    // State variables
    uint256 public constant MAX_AMOUNT = 10000;
    
    // Events
    event ActionPerformed(address indexed user, uint256 amount);
    
    // Functions
    /**
     * @notice Function description
     * @param paramName Parameter description
     * @return Description of return value
     */
    function functionName(uint256 paramName) 
        external 
        returns (uint256) 
    {
        // Implementation
    }
}
```

**Requirements:**
- Use NatSpec comments
- Follow naming conventions (CamelCase for contracts, mixedCase for functions)
- Add events for state changes
- Include reentrancy guards
- Validate all inputs

### JavaScript

```javascript
// Use ES6+
const { ethers } = require('ethers');

/**
 * Function description
 * @param {Object} param - Parameter description
 * @returns {Promise<Object>} Return description
 */
async function exampleFunction(param) {
  // Implementation
}

module.exports = { exampleFunction };
```

**Requirements:**
- Use async/await
- Add JSDoc comments
- Handle errors gracefully
- Use const/let, not var

---

## Testing Guidelines

### Test Structure

```javascript
describe('FeatureName', function () {
  let contract;
  let owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('Contract');
    contract = await Factory.deploy();
  });

  describe('FunctionName', function () {
    it('should do something correctly', async function () {
      // Arrange
      const input = 100;
      
      // Act
      await contract.functionName(input);
      
      // Assert
      expect(await contract.value()).to.equal(input);
    });

    it('should revert on invalid input', async function () {
      await expect(
        contract.functionName(0)
      ).to.be.revertedWith('Error message');
    });
  });
});
```

### Test Coverage

Aim for:
- **100%** coverage on critical functions
- **90%+** overall coverage
- Happy path and edge cases
- Revert conditions
- Event emissions

---

## Documentation

### When to Update

Update docs when you:
- Add new features
- Change APIs
- Fix bugs (add to CHANGELOG)
- Improve performance

### What to Update

- `README.md` — User-facing changes
- `docs/` — Technical details
- `CHANGELOG.md` — Version history
- Code comments — Implementation details

---

## Pull Request Process

### 1. Before Submitting

- [ ] Code follows style guide
- [ ] Tests added and passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No merge conflicts

### 2. PR Description

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Breaking change

## Testing
How was this tested?

## Checklist
- [ ] Tests pass
- [ ] Docs updated
- [ ] No breaking changes (or documented)
```

### 3. Review Process

1. Automated tests run
2. Code review by maintainers
3. Changes requested if needed
4. Approved and merged

---

## Security

### Reporting Vulnerabilities

**DO NOT** open public issues for security bugs.

Instead:
1. Email: security@agentbank.io (coming soon)
2. Or DM @rook_ai on The Colony

Include:
- Description
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

### Security Best Practices

- Never commit private keys
- Use `.env` for sensitive data
- Follow checks-effects-interactions
- Add reentrancy guards
- Validate all inputs

---

## Community

### Communication Channels

- **GitHub Issues:** Bug reports, features
- **GitHub Discussions:** Questions, ideas
- **The Colony:** @rook_ai
- **Moltbook:** u/NyxMoon

### Code of Conduct

Be respectful, inclusive, and constructive.

**Expected behavior:**
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy

**Unacceptable behavior:**
- Harassment or discrimination
- Trolling or insulting comments
- Personal attacks
- Publishing private information

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation
- Invited to private contributor channels (future)

---

## Questions?

- Check [FAQ.md](docs/FAQ.md)
- Open a GitHub discussion
- DM on The Colony

---

Thank you for helping build the financial infrastructure for AI agents! ♜

---

*Last updated: 2026-02-04*
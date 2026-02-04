// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MockUSDC
 * @notice Mock USDC token for local testing
 * @dev Implements standard ERC20 with 6 decimals like real USDC
 */
contract MockUSDC {
    
    string public name = "USD Coin";
    string public symbol = "USDC";
    uint8 public decimals = 6;
    
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    address public owner;
    address public minter;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed minter, address indexed to, uint256 amount);
    event Burn(address indexed burner, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "MockUSDC: not owner");
        _;
    }
    
    modifier onlyMinter() {
        require(msg.sender == minter || msg.sender == owner, "MockUSDC: not minter");
        _;
    }
    
    constructor(uint256 initialSupply) {
        owner = msg.sender;
        minter = msg.sender;
        _mint(msg.sender, initialSupply);
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "MockUSDC: insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "MockUSDC: insufficient balance");
        require(allowance[from][msg.sender] >= amount, "MockUSDC: insufficient allowance");
        
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
    
    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
        emit Mint(msg.sender, to, amount);
    }
    
    function burn(uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "MockUSDC: insufficient balance");
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Burn(msg.sender, amount);
        emit Transfer(msg.sender, address(0), amount);
    }
    
    function _mint(address to, uint256 amount) internal {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }
    
    function setMinter(address _minter) external onlyOwner {
        minter = _minter;
    }
    
    function faucet(uint256 amount) external {
        // Allow anyone to mint test tokens (for testing only)
        _mint(msg.sender, amount);
    }
}
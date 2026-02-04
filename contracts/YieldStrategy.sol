// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title YieldStrategy
 * @notice Simple yield strategy for hackathon
 */
contract YieldStrategy {
    
    address public owner;
    address public usdc;
    uint256 public currentAPY; // in basis points (100 = 1%)
    
    mapping(address => uint256) public deposits;
    mapping(address => uint256) depositTime;
    uint256 public totalDeposits;
    
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount, uint256 yield);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor(address _usdc) {
        owner = msg.sender;
        usdc = _usdc;
        currentAPY = 450; // 4.5%
    }
    
    /**
     * @notice Deposit USDC to earn yield
     */
    function deposit(uint256 amount) external returns (uint256) {
        require(amount > 0, "Amount must be > 0");
        
        // Transfer USDC
        (bool success, ) = usdc.call(abi.encodeWithSelector(
            bytes4(keccak256("transferFrom(address,address,uint256)")),
            msg.sender,
            address(this),
            amount
        ));
        require(success, "Transfer failed");
        
        deposits[msg.sender] += amount;
        depositTime[msg.sender] = block.timestamp;
        totalDeposits += amount;
        
        emit Deposited(msg.sender, amount);
        
        return amount;
    }
    
    /**
     * @notice Withdraw with yield
     */
    function withdraw(uint256 amount) external returns (uint256) {
        require(deposits[msg.sender] >= amount, "Insufficient balance");
        
        // Calculate simple yield (for demo: 30 days)
        uint256 timeElapsed = block.timestamp - depositTime[msg.sender];
        uint256 yield = (amount * currentAPY * timeElapsed) / (365 days * 10000);
        
        deposits[msg.sender] -= amount;
        totalDeposits -= amount;
        
        uint256 totalWithdraw = amount + yield;
        
        // Transfer back
        (bool success, ) = usdc.call(abi.encodeWithSelector(
            bytes4(keccak256("transfer(address,uint256)")),
            msg.sender,
            totalWithdraw
        ));
        require(success, "Transfer failed");
        
        emit Withdrawn(msg.sender, amount, yield);
        
        return totalWithdraw;
    }
    
    /**
     * @notice Get user balance
     */
    function balanceOf(address user) external view returns (uint256) {
        return deposits[user];
    }
    
    /**
     * @notice Get APY
     */
    function getAPY() external view returns (uint256) {
        return currentAPY;
    }
    
    /**
     * @notice Set APY (owner only)
     */
    function setAPY(uint256 newAPY) external onlyOwner {
        currentAPY = newAPY;
    }
    
    /**
     * @notice Calculate yield for user
     */
    function calculateYield(address user) external view returns (uint256) {
        if (deposits[user] == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - depositTime[user];
        return (deposits[user] * currentAPY * timeElapsed) / (365 days * 10000);
    }
}

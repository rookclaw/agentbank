// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TreasuryRouter
 * @notice Core contract for AGENTBANK cross-chain treasury
 * @dev Simplified for hackathon — minimal dependencies
 */
contract TreasuryRouter {
    
    address public owner;
    address public usdc;
    
    // Chain ID to CCTP domain mapping
    mapping(uint256 => uint32) public chainToDomain;
    
    // Agent treasuries
    mapping(address => uint256) public balances;
    
    // Events
    event TreasuryCreated(address indexed agent, uint256 amount);
    event BridgeInitiated(address indexed agent, uint256 amount, uint256 destChain, bytes32 txHash);
    event BridgeCompleted(address indexed agent, uint256 amount, uint256 sourceChain, bytes32 txHash);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor(address _usdc) {
        owner = msg.sender;
        usdc = _usdc;
        
        // Set up chain domains
        chainToDomain[84532] = 6;   // Base Sepolia
        chainToDomain[421614] = 3;  // Arbitrum Sepolia
    }
    
    /**
     * @notice Deposit USDC to treasury
     */
    function deposit(uint256 amount) external {
        // Transfer USDC from sender
        (bool success, ) = usdc.call(abi.encodeWithSelector(
            bytes4(keccak256("transferFrom(address,address,uint256)")),
            msg.sender,
            address(this),
            amount
        ));
        require(success, "Transfer failed");
        
        balances[msg.sender] += amount;
        
        emit TreasuryCreated(msg.sender, amount);
    }
    
    /**
     * @notice Initiate bridge to another chain
     */
    function bridge(uint256 amount, uint256 destChain) external returns (bytes32) {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        require(chainToDomain[destChain] != 0, "Unsupported chain");
        
        balances[msg.sender] -= amount;
        
        // Generate unique transaction hash
        bytes32 txHash = keccak256(abi.encodePacked(
            msg.sender,
            amount,
            destChain,
            block.timestamp,
            block.number
        ));
        
        emit BridgeInitiated(msg.sender, amount, destChain, txHash);
        
        return txHash;
    }
    
    /**
     * @notice Receive bridged USDC (called by relayer)
     */
    function receiveBridge(
        address agent,
        uint256 amount,
        uint256 sourceChain,
        bytes32 txHash
    ) external onlyOwner {
        balances[agent] += amount;
        
        emit BridgeCompleted(agent, amount, sourceChain, txHash);
    }
    
    /**
     * @notice Get balance
     */
    function getBalance(address agent) external view returns (uint256) {
        return balances[agent];
    }
    
    /**
     * @notice Withdraw USDC
     */
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        
        (bool success, ) = usdc.call(abi.encodeWithSelector(
            bytes4(keccak256("transfer(address,uint256)")),
            msg.sender,
            amount
        ));
        require(success, "Transfer failed");
    }
    
    /**
     * @notice Update USDC address
     */
    function setUSDC(address _usdc) external onlyOwner {
        usdc = _usdc;
    }
}

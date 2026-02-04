// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MockCCTPTokenMessenger
 * @notice Mock implementation of Circle's CCTP TokenMessenger for local testing
 * @dev Simulates burn/mint behavior without actual cross-chain messaging
 */
contract MockCCTPTokenMessenger {
    
    address public owner;
    address public usdc;
    
    // Track nonces
    uint64 public currentNonce;
    
    // Pending burns (nonce => BurnRequest)
    mapping(uint64 => BurnRequest) public pendingBurns;
    
    struct BurnRequest {
        address from;
        uint256 amount;
        uint32 destinationDomain;
        bytes32 mintRecipient;
        uint256 timestamp;
    }
    
    // Events matching real CCTP
    event DepositForBurn(
        uint64 indexed nonce,
        address indexed burner,
        uint256 amount,
        bytes32 mintRecipient,
        uint32 destinationDomain
    );
    
    event MintAndWithdraw(
        uint64 indexed nonce,
        address indexed recipient,
        uint256 amount
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "MockCCTP: not owner");
        _;
    }
    
    constructor(address _usdc) {
        owner = msg.sender;
        usdc = _usdc;
        currentNonce = 1;
    }
    
    /**
     * @notice Simulate depositForBurn - burns tokens locally
     * @param amount Amount to burn
     * @param destinationDomain Target chain domain
     * @param mintRecipient Recipient on destination
     * @param burnToken Token to burn (must be USDC)
     */
    function depositForBurn(
        uint256 amount,
        uint32 destinationDomain,
        bytes32 mintRecipient,
        address burnToken
    ) external returns (uint64 nonce) {
        require(burnToken == usdc, "MockCCTP: only USDC");
        require(amount > 0, "MockCCTP: amount must be > 0");
        
        nonce = currentNonce++;
        
        // Store burn request
        pendingBurns[nonce] = BurnRequest({
            from: msg.sender,
            amount: amount,
            destinationDomain: destinationDomain,
            mintRecipient: mintRecipient,
            timestamp: block.timestamp
        });
        
        // Transfer USDC from sender to this contract (simulating burn)
        (bool success, ) = usdc.call(abi.encodeWithSelector(
            bytes4(keccak256("transferFrom(address,address,uint256)")),
            msg.sender,
            address(this),
            amount
        ));
        require(success, "MockCCTP: transfer failed");
        
        emit DepositForBurn(nonce, msg.sender, amount, mintRecipient, destinationDomain);
        
        return nonce;
    }
    
    /**
     * @notice Simulate receiving a mint on this chain
     * @param nonce Original burn nonce
     * @param recipient Local recipient
     * @param amount Amount to mint
     */
    function mintAndWithdraw(
        uint64 nonce,
        address recipient,
        uint256 amount
    ) external onlyOwner {
        require(recipient != address(0), "MockCCTP: invalid recipient");
        require(amount > 0, "MockCCTP: amount must be > 0");
        
        // Transfer USDC from contract to recipient (simulating mint)
        (bool success, ) = usdc.call(abi.encodeWithSelector(
            bytes4(keccak256("transfer(address,uint256)")),
            recipient,
            amount
        ));
        require(success, "MockCCTP: transfer failed");
        
        emit MintAndWithdraw(nonce, recipient, amount);
    }
    
    /**
     * @notice Get burn request details
     */
    function getBurnRequest(uint64 nonce) external view returns (
        address from,
        uint256 amount,
        uint32 destinationDomain,
        bytes32 mintRecipient,
        uint256 timestamp
    ) {
        BurnRequest memory req = pendingBurns[nonce];
        return (req.from, req.amount, req.destinationDomain, req.mintRecipient, req.timestamp);
    }
    
    /**
     * @notice Rescue stuck tokens (for testing)
     */
    function rescueTokens(address token, uint256 amount) external onlyOwner {
        (bool success, ) = token.call(abi.encodeWithSelector(
            bytes4(keccak256("transfer(address,uint256)")),
            owner,
            amount
        ));
        require(success, "MockCCTP: rescue failed");
    }
}
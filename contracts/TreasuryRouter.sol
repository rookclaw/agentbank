// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TreasuryRouter
 * @notice Cross-chain USDC treasury with CCTP v2 integration
 * @dev Handles deposits, withdrawals, and cross-chain bridging
 */

interface ICCTPMessageTransmitter {
    function sendMessage(
        uint32 destinationDomain,
        bytes32 recipient,
        bytes calldata messageBody
    ) external returns (uint64 nonce);
    
    function receiveMessage(
        bytes calldata message,
        bytes calldata attestation
    ) external returns (bool success);
}

interface ITokenMessenger {
    function depositForBurn(
        uint256 amount,
        uint32 destinationDomain,
        bytes32 mintRecipient,
        address burnToken
    ) external returns (uint64 nonce);
    
    function replaceDepositForBurn(
        bytes calldata originalMessage,
        bytes calldata originalAttestation,
        bytes32 newDestinationCaller,
        bytes32 newMintRecipient
    ) external;
}

interface IUSDC {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract TreasuryRouter {
    
    // ============ State Variables ============
    
    address public owner;
    address public usdc;
    address public tokenMessenger;
    address public messageTransmitter;
    
    // Chain ID to CCTP domain mapping
    mapping(uint256 => uint32) public chainToDomain;
    mapping(uint32 => uint256) public domainToChain;
    
    // Agent treasuries
    mapping(address => uint256) public balances;
    
    // Pending bridges (txHash => BridgeRequest)
    mapping(bytes32 => BridgeRequest) public pendingBridges;
    
    // Bridge counter for unique IDs
    uint256 public bridgeCounter;
    
    // ============ Structs ============
    
    struct BridgeRequest {
        address agent;
        uint256 amount;
        uint256 destChain;
        uint256 timestamp;
        bool completed;
    }
    
    // ============ Events ============
    
    event TreasuryCreated(address indexed agent, uint256 amount);
    event Deposited(address indexed agent, uint256 amount, uint256 newBalance);
    event Withdrawn(address indexed agent, uint256 amount, uint256 newBalance);
    event BridgeInitiated(
        bytes32 indexed txHash,
        address indexed agent,
        uint256 amount,
        uint256 destChain,
        uint64 cctpNonce
    );
    event BridgeCompleted(
        bytes32 indexed txHash,
        address indexed agent,
        uint256 amount,
        uint256 sourceChain
    );
    event ChainAdded(uint256 chainId, uint32 domain);
    
    // ============ Modifiers ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "TreasuryRouter: not owner");
        _;
    }
    
    modifier onlyTokenMessenger() {
        require(msg.sender == tokenMessenger, "TreasuryRouter: not token messenger");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(
        address _usdc,
        address _tokenMessenger,
        address _messageTransmitter
    ) {
        owner = msg.sender;
        usdc = _usdc;
        tokenMessenger = _tokenMessenger;
        messageTransmitter = _messageTransmitter;
        bridgeCounter = 0;
        
        // Set up testnet chain domains (CCTP v2)
        // These are CCTP domain IDs, not chain IDs
        _addChain(84532, 6);    // Base Sepolia
        _addChain(421614, 3);   // Arbitrum Sepolia
        _addChain(11155111, 0); // Ethereum Sepolia
        _addChain(80001, 5);    // Polygon Mumbai (if supported)
    }
    
    // ============ Admin Functions ============
    
    function _addChain(uint256 chainId, uint32 domain) internal {
        chainToDomain[chainId] = domain;
        domainToChain[domain] = chainId;
        emit ChainAdded(chainId, domain);
    }
    
    function addChain(uint256 chainId, uint32 domain) external onlyOwner {
        _addChain(chainId, domain);
    }
    
    function setUSDC(address _usdc) external onlyOwner {
        usdc = _usdc;
    }
    
    function setCCTPAddresses(
        address _tokenMessenger,
        address _messageTransmitter
    ) external onlyOwner {
        tokenMessenger = _tokenMessenger;
        messageTransmitter = _messageTransmitter;
    }
    
    // ============ Deposit/Withdraw ============
    
    /**
     * @notice Deposit USDC to treasury
     * @param amount Amount of USDC to deposit
     */
    function deposit(uint256 amount) external {
        require(amount > 0, "TreasuryRouter: amount must be > 0");
        
        // Transfer USDC from sender to this contract
        bool success = IUSDC(usdc).transferFrom(msg.sender, address(this), amount);
        require(success, "TreasuryRouter: transfer failed");
        
        balances[msg.sender] += amount;
        
        emit Deposited(msg.sender, amount, balances[msg.sender]);
    }
    
    /**
     * @notice Withdraw USDC from treasury
     * @param amount Amount of USDC to withdraw
     */
    function withdraw(uint256 amount) external {
        require(amount > 0, "TreasuryRouter: amount must be > 0");
        require(balances[msg.sender] >= amount, "TreasuryRouter: insufficient balance");
        
        balances[msg.sender] -= amount;
        
        bool success = IUSDC(usdc).transfer(msg.sender, amount);
        require(success, "TreasuryRouter: transfer failed");
        
        emit Withdrawn(msg.sender, amount, balances[msg.sender]);
    }
    
    // ============ Bridge Functions ============
    
    /**
     * @notice Initiate bridge to another chain using CCTP
     * @param amount Amount of USDC to bridge
     * @param destChain Destination chain ID
     * @return txHash Unique transaction hash for this bridge
     * @return cctpNonce CCTP nonce for tracking
     */
    function bridge(
        uint256 amount,
        uint256 destChain
    ) external returns (bytes32 txHash, uint64 cctpNonce) {
        require(amount > 0, "TreasuryRouter: amount must be > 0");
        require(balances[msg.sender] >= amount, "TreasuryRouter: insufficient balance");
        require(chainToDomain[destChain] != 0, "TreasuryRouter: unsupported chain");
        require(tokenMessenger != address(0), "TreasuryRouter: CCTP not configured");
        
        // Deduct from sender's balance
        balances[msg.sender] -= amount;
        
        // Generate unique transaction hash
        bridgeCounter++;
        txHash = keccak256(abi.encodePacked(
            msg.sender,
            amount,
            destChain,
            block.timestamp,
            bridgeCounter
        ));
        
        // Approve token messenger to spend USDC
        IUSDC(usdc).approve(tokenMessenger, amount);
        
        // Initiate CCTP bridge
        // Mint recipient is this contract on destination chain
        bytes32 mintRecipient = bytes32(uint256(uint160(address(this))));
        uint32 destDomain = chainToDomain[destChain];
        
        cctpNonce = ITokenMessenger(tokenMessenger).depositForBurn(
            amount,
            destDomain,
            mintRecipient,
            usdc
        );
        
        // Store bridge request
        pendingBridges[txHash] = BridgeRequest({
            agent: msg.sender,
            amount: amount,
            destChain: destChain,
            timestamp: block.timestamp,
            completed: false
        });
        
        emit BridgeInitiated(txHash, msg.sender, amount, destChain, cctpNonce);
        
        return (txHash, cctpNonce);
    }
    
    /**
     * @notice Complete bridge by receiving USDC from source chain
     * @param txHash Original transaction hash
     * @param agent Agent address to credit
     * @param amount Amount of USDC received
     * @param sourceChain Source chain ID
     */
    function completeBridge(
        bytes32 txHash,
        address agent,
        uint256 amount,
        uint256 sourceChain
    ) external onlyOwner {
        BridgeRequest storage request = pendingBridges[txHash];
        require(!request.completed, "TreasuryRouter: already completed");
        require(request.agent == agent, "TreasuryRouter: agent mismatch");
        require(request.amount == amount, "TreasuryRouter: amount mismatch");
        
        request.completed = true;
        balances[agent] += amount;
        
        emit BridgeCompleted(txHash, agent, amount, sourceChain);
    }
    
    /**
     * @notice Handle incoming CCTP message (called by relayer)
     * @param message CCTP message bytes
     * @param attestation CCTP attestation
     */
    function handleCCTPMessage(
        bytes calldata message,
        bytes calldata attestation
    ) external onlyOwner {
        // Verify and process CCTP message
        // In production, this would verify the attestation and mint USDC
        // For hackathon, owner acts as relayer
        
        // Decode message to extract transfer details
        // This is simplified - real implementation would parse CCTP message format
        
        // Mark as received and credit agent
        // Implementation depends on CCTP message format
    }
    
    // ============ View Functions ============
    
    function getBalance(address agent) external view returns (uint256) {
        return balances[agent];
    }
    
    function getBridgeRequest(bytes32 txHash) external view returns (
        address agent,
        uint256 amount,
        uint256 destChain,
        uint256 timestamp,
        bool completed
    ) {
        BridgeRequest memory req = pendingBridges[txHash];
        return (req.agent, req.amount, req.destChain, req.timestamp, req.completed);
    }
    
    function isChainSupported(uint256 chainId) external view returns (bool) {
        return chainToDomain[chainId] != 0;
    }
    
    function getDomain(uint256 chainId) external view returns (uint32) {
        return chainToDomain[chainId];
    }
    
    // ============ Emergency Functions ============
    
    /**
     * @notice Emergency withdrawal by owner (for stuck funds)
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        bool success = IUSDC(usdc).transfer(owner, amount);
        require(success, "TreasuryRouter: emergency withdraw failed");
    }
}
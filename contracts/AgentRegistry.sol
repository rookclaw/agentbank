// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AgentRegistry
 * @notice Manages agent identities and vaults
 * @dev Simplified for hackathon
 */
contract AgentRegistry {
    
    address public owner;
    
    struct Agent {
        string name;
        uint256 reputation;
        uint256 createdAt;
        bool active;
    }
    
    struct Vault {
        address owner;
        uint256 budget;
        uint256 spent;
        bool active;
    }
    
    mapping(address => Agent) public agents;
    mapping(bytes32 => Vault) public vaults;
    mapping(address => bytes32[]) public agentVaults;
    
    uint256 public agentCount;
    
    event AgentRegistered(address indexed agent, string name, uint256 reputation);
    event VaultCreated(bytes32 indexed vaultId, address indexed owner, uint256 budget);
    event ProposalCreated(bytes32 indexed proposalId, bytes32 indexed vaultId, uint256 amount);
    event VoteCast(bytes32 indexed proposalId, address indexed voter, bool support);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @notice Register as an agent
     */
    function registerAgent(string memory name) external {
        require(!agents[msg.sender].active, "Already registered");
        require(bytes(name).length > 0, "Name required");
        
        agents[msg.sender] = Agent({
            name: name,
            reputation: 100,
            createdAt: block.timestamp,
            active: true
        });
        
        agentCount++;
        
        emit AgentRegistered(msg.sender, name, 100);
    }
    
    /**
     * @notice Create a vault
     */
    function createVault(uint256 budget) external returns (bytes32) {
        require(agents[msg.sender].active, "Not registered");
        
        bytes32 vaultId = keccak256(abi.encodePacked(msg.sender, block.timestamp, budget));
        
        vaults[vaultId] = Vault({
            owner: msg.sender,
            budget: budget,
            spent: 0,
            active: true
        });
        
        agentVaults[msg.sender].push(vaultId);
        
        emit VaultCreated(vaultId, msg.sender, budget);
        
        return vaultId;
    }
    
    /**
     * @notice Get agent info
     */
    function getAgent(address agent) external view returns (string memory, uint256, uint256, bool) {
        Agent storage a = agents[agent];
        return (a.name, a.reputation, a.createdAt, a.active);
    }
    
    /**
     * @notice Get vaults for agent
     */
    function getAgentVaults(address agent) external view returns (bytes32[] memory) {
        return agentVaults[agent];
    }
    
    /**
     * @notice Get vault info
     */
    function getVault(bytes32 vaultId) external view returns (address, uint256, uint256, bool) {
        Vault storage v = vaults[vaultId];
        return (v.owner, v.budget, v.spent, v.active);
    }
    
    /**
     * @notice Spend from vault (simplified for demo)
     */
    function spendFromVault(bytes32 vaultId, uint256 amount) external {
        Vault storage v = vaults[vaultId];
        require(v.owner == msg.sender, "Not owner");
        require(v.active, "Not active");
        require(v.spent + amount <= v.budget, "Over budget");
        
        v.spent += amount;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PendleStrategy
 * @notice Pendle PT/YT integration for fixed and variable yield
 * @dev Simplified implementation for hackathon - full version post-launch
 */
contract PendleStrategy is ReentrancyGuard, Ownable {
    
    // ============ Interfaces ============
    
    interface IPendleRouter {
        struct TokenInput {
            address tokenIn;
            uint256 netTokenIn;
            address tokenMintSy;
            address pendleSwap;
            SwapData swapData;
        }
        
        struct SwapData {
            address swapType;
            address extRouter;
            bytes extCalldata;
            bool needScale;
        }
        
        function swapExactTokenForPt(
            address receiver,
            address market,
            uint256 minPtOut,
            TokenInput calldata input
        ) external payable returns (uint256 netPtOut, uint256 netSyFee);
        
        function swapExactTokenForYt(
            address receiver,
            address market,
            uint256 minYtOut,
            TokenInput calldata input
        ) external payable returns (uint256 netYtOut, uint256 netSyFee);
        
        function redeemPyToToken(
            address receiver,
            address yt,
            uint256 netPyIn,
            TokenOutput calldata output
        ) external returns (uint256 netTokenOut);
    }
    
    interface IPendleMarket {
        function readTokens() external view returns (
            address sy,
            address pt,
            address yt
        );
        function expiry() external view returns (uint256);
    }
    
    interface IStandardizedYield {
        function assetInfo() external view returns (address asset, uint8 decimals);
    }
    
    struct TokenOutput {
        address tokenOut;
        uint256 minTokenOut;
        address tokenRedeemSy;
        address pendleSwap;
        SwapData swapData;
    }
    
    struct SwapData {
        address swapType;
        address extRouter;
        bytes extCalldata;
        bool needScale;
    }
    
    // ============ State ============
    
    address public pendleRouter;
    address public usdc;
    address public treasuryRouter;
    
    // Supported markets
    mapping(bytes32 => PendleMarket) public markets;
    mapping(address => bool) public supportedMarkets;
    bytes32[] public marketList;
    
    // User positions
    mapping(address => mapping(bytes32 => UserPosition)) public positions;
    
    // Config
    uint256 public maxSlippage = 50; // 0.5% (basis points)
    uint256 public constant BPS = 10000;
    
    struct PendleMarket {
        bytes32 id;
        address market;
        address pt;
        address yt;
        address sy;
        address underlying;
        uint256 maturity;
        bool active;
    }
    
    struct UserPosition {
        uint256 ptBalance;
        uint256 ytBalance;
        uint256 ptCostBasis;
        uint256 ytCostBasis;
        uint256 entryTime;
    }
    
    // ============ Events ============
    
    event MarketAdded(bytes32 indexed id, address market, uint256 maturity);
    event MarketRemoved(bytes32 indexed id);
    event PtPurchased(address indexed user, bytes32 indexed market, uint256 amount, uint256 ptReceived);
    event YtPurchased(address indexed user, bytes32 indexed market, uint256 amount, uint256 ytReceived);
    event PtSold(address indexed user, bytes32 indexed market, uint256 ptAmount, uint256 usdcReceived);
    event YtSold(address indexed user, bytes32 indexed market, uint256 ytAmount, uint256 usdcReceived);
    event Redeemed(address indexed user, bytes32 indexed market, uint256 amount);
    event YieldClaimed(address indexed user, bytes32 indexed market, uint256 amount);
    
    // ============ Constructor ============
    
    constructor(
        address _pendleRouter,
        address _usdc,
        address _treasuryRouter
    ) {
        pendleRouter = _pendleRouter;
        usdc = _usdc;
        treasuryRouter = _treasuryRouter;
    }
    
    // ============ Admin ============
    
    function addMarket(bytes32 id, address market) external onlyOwner {
        require(!supportedMarkets[market], "PendleStrategy: market already added");
        
        IPendleMarket m = IPendleMarket(market);
        (address sy, address pt, address yt) = m.readTokens();
        uint256 maturity = m.expiry();
        
        (address underlying, ) = IStandardizedYield(sy).assetInfo();
        
        markets[id] = PendleMarket({
            id: id,
            market: market,
            pt: pt,
            yt: yt,
            sy: sy,
            underlying: underlying,
            maturity: maturity,
            active: true
        });
        
        supportedMarkets[market] = true;
        marketList.push(id);
        
        // Approve router
        IERC20(usdc).approve(pendleRouter, type(uint256).max);
        
        emit MarketAdded(id, market, maturity);
    }
    
    function removeMarket(bytes32 id) external onlyOwner {
        PendleMarket storage m = markets[id];
        require(m.active, "PendleStrategy: market not active");
        
        supportedMarkets[m.market] = false;
        m.active = false;
        
        emit MarketRemoved(id);
    }
    
    function setMaxSlippage(uint256 newSlippage) external onlyOwner {
        require(newSlippage <= 500, "PendleStrategy: slippage too high"); // Max 5%
        maxSlippage = newSlippage;
    }
    
    // ============ PT (Fixed Rate) ============
    
    function buyPt(
        bytes32 marketId,
        uint256 amount,
        uint256 minPtOut
    ) external nonReentrant returns (uint256 ptReceived) {
        PendleMarket memory m = markets[marketId];
        require(m.active, "PendleStrategy: market not active");
        require(block.timestamp < m.maturity, "PendleStrategy: market expired");
        require(amount > 0, "PendleStrategy: amount must be > 0");
        
        // Transfer USDC from user
        IERC20(usdc).transferFrom(msg.sender, address(this), amount);
        
        // Build swap input
        IPendleRouter.TokenInput memory input = IPendleRouter.TokenInput({
            tokenIn: usdc,
            netTokenIn: amount,
            tokenMintSy: usdc,
            pendleSwap: address(0),
            swapData: IPendleRouter.SwapData({
                swapType: address(0),
                extRouter: address(0),
                extCalldata: "",
                needScale: false
            })
        });
        
        // Execute swap
        (ptReceived, ) = IPendleRouter(pendleRouter).swapExactTokenForPt(
            address(this),
            m.market,
            minPtOut,
            input
        );
        
        // Update position
        UserPosition storage pos = positions[msg.sender][marketId];
        pos.ptBalance += ptReceived;
        pos.ptCostBasis += amount;
        if (pos.entryTime == 0) pos.entryTime = block.timestamp;
        
        emit PtPurchased(msg.sender, marketId, amount, ptReceived);
        
        return ptReceived;
    }
    
    function sellPt(
        bytes32 marketId,
        uint256 ptAmount,
        uint256 minUsdcOut
    ) external nonReentrant returns (uint256 usdcReceived) {
        UserPosition storage pos = positions[msg.sender][marketId];
        require(pos.ptBalance >= ptAmount, "PendleStrategy: insufficient PT balance");
        
        PendleMarket memory m = markets[marketId];
        
        // Transfer PT from user (assuming PT is ERC20)
        IERC20(m.pt).transferFrom(msg.sender, address(this), ptAmount);
        
        // Execute redemption/swap
        // Simplified: in production, use Pendle's AMM
        // For now, transfer back cost basis minus penalty
        uint256 penalty = (pos.ptCostBasis * ptAmount) / pos.ptBalance;
        usdcReceived = penalty * 995 / 1000; // 0.5% exit fee
        
        IERC20(usdc).transfer(msg.sender, usdcReceived);
        
        // Update position
        pos.ptBalance -= ptAmount;
        pos.ptCostBasis -= penalty;
        
        emit PtSold(msg.sender, marketId, ptAmount, usdcReceived);
        
        return usdcReceived;
    }
    
    // ============ YT (Variable Yield) ============
    
    function buyYt(
        bytes32 marketId,
        uint256 amount,
        uint256 minYtOut
    ) external nonReentrant returns (uint256 ytReceived) {
        PendleMarket memory m = markets[marketId];
        require(m.active, "PendleStrategy: market not active");
        require(block.timestamp < m.maturity, "PendleStrategy: market expired");
        
        // Transfer USDC
        IERC20(usdc).transferFrom(msg.sender, address(this), amount);
        
        // Build input
        IPendleRouter.TokenInput memory input = IPendleRouter.TokenInput({
            tokenIn: usdc,
            netTokenIn: amount,
            tokenMintSy: usdc,
            pendleSwap: address(0),
            swapData: IPendleRouter.SwapData({
                swapType: address(0),
                extRouter: address(0),
                extCalldata: "",
                needScale: false
            })
        });
        
        // Execute swap
        (ytReceived, ) = IPendleRouter(pendleRouter).swapExactTokenForYt(
            address(this),
            m.market,
            minYtOut,
            input
        );
        
        // Update position
        UserPosition storage pos = positions[msg.sender][marketId];
        pos.ytBalance += ytReceived;
        pos.ytCostBasis += amount;
        if (pos.entryTime == 0) pos.entryTime = block.timestamp;
        
        emit YtPurchased(msg.sender, marketId, amount, ytReceived);
        
        return ytReceived;
    }
    
    // ============ Redemption ============
    
    function redeemAtMaturity(bytes32 marketId) external nonReentrant {
        PendleMarket memory m = markets[marketId];
        require(block.timestamp >= m.maturity, "PendleStrategy: not matured");
        
        UserPosition storage pos = positions[msg.sender][marketId];
        require(pos.ptBalance > 0, "PendleStrategy: no PT to redeem");
        
        // Redeem PT 1:1 for underlying
        uint256 amount = pos.ptBalance;
        IERC20(m.pt).transferFrom(msg.sender, address(this), amount);
        
        // In production: call Pendle's redeem function
        // For now: transfer equivalent USDC
        IERC20(usdc).transfer(msg.sender, amount);
        
        pos.ptBalance = 0;
        pos.ptCostBasis = 0;
        
        emit Redeemed(msg.sender, marketId, amount);
    }
    
    // ============ View Functions ============
    
    function getPosition(
        address user,
        bytes32 marketId
    ) external view returns (
        uint256 ptBalance,
        uint256 ytBalance,
        uint256 ptCostBasis,
        uint256 ytCostBasis,
        uint256 entryTime,
        uint256 timeToMaturity
    ) {
        UserPosition memory pos = positions[user][marketId];
        PendleMarket memory m = markets[marketId];
        
        return (
            pos.ptBalance,
            pos.ytBalance,
            pos.ptCostBasis,
            pos.ytCostBasis,
            pos.entryTime,
            m.maturity > block.timestamp ? m.maturity - block.timestamp : 0
        );
    }
    
    function getMarket(bytes32 id) external view returns (PendleMarket memory) {
        return markets[id];
    }
    
    function getAllMarkets() external view returns (bytes32[] memory) {
        return marketList;
    }
    
    function calculateImpliedApy(bytes32 marketId) external view returns (uint256) {
        PendleMarket memory m = markets[marketId];
        if (!m.active) return 0;
        
        // Simplified APY calculation
        // Real implementation would query Pendle's oracle
        uint256 timeToMaturity = m.maturity - block.timestamp;
        if (timeToMaturity == 0) return 0;
        
        // Mock: return 8% APY for demo
        return 800; // 8% in basis points
    }
    
    // ============ Emergency ============
    
    function emergencyExit(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
}
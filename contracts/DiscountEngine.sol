// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract DiscountEngine is Ownable, ReentrancyGuard {
    struct Discount {
        string name;
        uint256 discountPercentage; // in basis points (1% = 100)
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        address[] eligibleBusinesses;
        uint256 minimumPurchase; // in USDC (6 decimals)
    }
    
    mapping(bytes32 => Discount) public discounts;
    mapping(address => mapping(bytes32 => bool)) public hasUsedDiscount;
    bytes32[] public activeDiscountIds;
    
    event DiscountCreated(bytes32 indexed discountId, string name, uint256 discountPercentage);
    event DiscountUpdated(bytes32 indexed discountId);
    event DiscountRedeemed(bytes32 indexed discountId, address indexed user, address indexed business);
    
    function createDiscount(
        string memory _name,
        uint256 _discountPercentage,
        uint256 _startTime,
        uint256 _endTime,
        address[] memory _eligibleBusinesses,
        uint256 _minimumPurchase
    ) external onlyOwner {
        require(_discountPercentage <= 10000, "Discount cannot exceed 100%");
        require(_startTime < _endTime, "Invalid time range");
        require(_eligibleBusinesses.length > 0, "No eligible businesses");
        
        bytes32 discountId = keccak256(abi.encodePacked(_name, block.timestamp));
        
        discounts[discountId] = Discount({
            name: _name,
            discountPercentage: _discountPercentage,
            startTime: _startTime,
            endTime: _endTime,
            isActive: true,
            eligibleBusinesses: _eligibleBusinesses,
            minimumPurchase: _minimumPurchase
        });
        
        activeDiscountIds.push(discountId);
        emit DiscountCreated(discountId, _name, _discountPercentage);
    }
    
    function updateDiscount(
        bytes32 _discountId,
        string memory _name,
        uint256 _discountPercentage,
        uint256 _startTime,
        uint256 _endTime,
        address[] memory _eligibleBusinesses,
        uint256 _minimumPurchase
    ) external onlyOwner {
        require(discounts[_discountId].isActive, "Discount does not exist");
        require(_discountPercentage <= 10000, "Discount cannot exceed 100%");
        require(_startTime < _endTime, "Invalid time range");
        
        discounts[_discountId].name = _name;
        discounts[_discountId].discountPercentage = _discountPercentage;
        discounts[_discountId].startTime = _startTime;
        discounts[_discountId].endTime = _endTime;
        discounts[_discountId].eligibleBusinesses = _eligibleBusinesses;
        discounts[_discountId].minimumPurchase = _minimumPurchase;
        
        emit DiscountUpdated(_discountId);
    }
    
    function calculateDiscount(
        bytes32 _discountId,
        address _user,
        address _business,
        uint256 _purchaseAmount
    ) external view returns (uint256) {
        Discount storage discount = discounts[_discountId];
        
        if (!discount.isActive) return 0;
        if (block.timestamp < discount.startTime || block.timestamp > discount.endTime) return 0;
        if (_purchaseAmount < discount.minimumPurchase) return 0;
        if (hasUsedDiscount[_user][_discountId]) return 0;
        
        bool isEligible = false;
        for (uint i = 0; i < discount.eligibleBusinesses.length; i++) {
            if (discount.eligibleBusinesses[i] == _business) {
                isEligible = true;
                break;
            }
        }
        
        if (!isEligible) return 0;
        
        return (_purchaseAmount * discount.discountPercentage) / 10000;
    }
    
    function applyDiscount(
        bytes32 _discountId,
        address _business,
        uint256 _purchaseAmount
    ) external nonReentrant returns (uint256) {
        uint256 discountAmount = this.calculateDiscount(_discountId, msg.sender, _business, _purchaseAmount);
        
        if (discountAmount > 0) {
            hasUsedDiscount[msg.sender][_discountId] = true;
            emit DiscountRedeemed(_discountId, msg.sender, _business);
        }
        
        return discountAmount;
    }
    
    function getActiveDiscounts() external view returns (bytes32[] memory) {
        return activeDiscountIds;
    }
    
    function getDiscountDetails(bytes32 _discountId) external view returns (
        string memory name,
        uint256 discountPercentage,
        uint256 startTime,
        uint256 endTime,
        bool isActive,
        address[] memory eligibleBusinesses,
        uint256 minimumPurchase
    ) {
        Discount storage discount = discounts[_discountId];
        return (
            discount.name,
            discount.discountPercentage,
            discount.startTime,
            discount.endTime,
            discount.isActive,
            discount.eligibleBusinesses,
            discount.minimumPurchase
        );
    }
    
    function toggleDiscount(bytes32 _discountId) external onlyOwner {
        require(discounts[_discountId].isActive, "Discount does not exist");
        discounts[_discountId].isActive = !discounts[_discountId].isActive;
        emit DiscountUpdated(_discountId);
    }
} 
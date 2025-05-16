// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract USDCPaymentRouter is Ownable, ReentrancyGuard {
    IERC20 public usdc;
    
    struct Business {
        address wallet;
        bool isActive;
        uint256 totalProcessed;
    }
    
    mapping(address => Business) public businesses;
    mapping(address => bool) public isBusiness;
    
    event BusinessRegistered(address indexed business, address indexed wallet);
    event PaymentProcessed(address indexed from, address indexed to, uint256 amount);
    event BusinessDeactivated(address indexed business);
    
    constructor(address _usdcAddress) {
        usdc = IERC20(_usdcAddress);
    }
    
    function registerBusiness(address _business, address _wallet) external onlyOwner {
        require(!isBusiness[_business], "Business already registered");
        require(_wallet != address(0), "Invalid wallet address");
        
        businesses[_business] = Business({
            wallet: _wallet,
            isActive: true,
            totalProcessed: 0
        });
        
        isBusiness[_business] = true;
        emit BusinessRegistered(_business, _wallet);
    }
    
    function processPayment(address _business, uint256 _amount) external nonReentrant {
        require(isBusiness[_business], "Business not registered");
        require(businesses[_business].isActive, "Business is not active");
        require(_amount > 0, "Amount must be greater than 0");
        
        address businessWallet = businesses[_business].wallet;
        
        require(usdc.transferFrom(msg.sender, businessWallet, _amount), "Transfer failed");
        
        businesses[_business].totalProcessed += _amount;
        emit PaymentProcessed(msg.sender, businessWallet, _amount);
    }
    
    function deactivateBusiness(address _business) external onlyOwner {
        require(isBusiness[_business], "Business not registered");
        businesses[_business].isActive = false;
        emit BusinessDeactivated(_business);
    }
    
    function updateBusinessWallet(address _business, address _newWallet) external onlyOwner {
        require(isBusiness[_business], "Business not registered");
        require(_newWallet != address(0), "Invalid wallet address");
        businesses[_business].wallet = _newWallet;
        emit BusinessRegistered(_business, _newWallet);
    }
} 
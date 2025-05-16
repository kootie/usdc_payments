// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BeaconPoints is Ownable, ReentrancyGuard {
    struct UserPoints {
        uint256 points;
        uint256 lastUpdated;
        uint256 totalEarned;
        uint256 totalRedeemed;
    }
    
    mapping(address => UserPoints) public userPoints;
    uint256 public pointsPerUSDC = 1; // 1 point per USDC spent
    uint256 public minimumRedeemAmount = 100; // Minimum points needed for redemption
    
    event PointsEarned(address indexed user, uint256 amount, uint256 newBalance);
    event PointsRedeemed(address indexed user, uint256 amount, uint256 newBalance);
    event PointsRateUpdated(uint256 newRate);
    event MinimumRedeemUpdated(uint256 newMinimum);
    
    function earnPoints(address _user, uint256 _usdcAmount) external onlyOwner {
        uint256 pointsToAdd = _usdcAmount * pointsPerUSDC;
        userPoints[_user].points += pointsToAdd;
        userPoints[_user].totalEarned += pointsToAdd;
        userPoints[_user].lastUpdated = block.timestamp;
        
        emit PointsEarned(_user, pointsToAdd, userPoints[_user].points);
    }
    
    function redeemPoints(uint256 _points) external nonReentrant {
        require(_points >= minimumRedeemAmount, "Below minimum redemption amount");
        require(_points <= userPoints[msg.sender].points, "Insufficient points");
        
        userPoints[msg.sender].points -= _points;
        userPoints[msg.sender].totalRedeemed += _points;
        userPoints[msg.sender].lastUpdated = block.timestamp;
        
        emit PointsRedeemed(msg.sender, _points, userPoints[msg.sender].points);
    }
    
    function getPointsBalance(address _user) external view returns (uint256) {
        return userPoints[_user].points;
    }
    
    function updatePointsRate(uint256 _newRate) external onlyOwner {
        require(_newRate > 0, "Rate must be greater than 0");
        pointsPerUSDC = _newRate;
        emit PointsRateUpdated(_newRate);
    }
    
    function updateMinimumRedeem(uint256 _newMinimum) external onlyOwner {
        minimumRedeemAmount = _newMinimum;
        emit MinimumRedeemUpdated(_newMinimum);
    }
    
    function getUserStats(address _user) external view returns (
        uint256 points,
        uint256 totalEarned,
        uint256 totalRedeemed,
        uint256 lastUpdated
    ) {
        UserPoints storage user = userPoints[_user];
        return (
            user.points,
            user.totalEarned,
            user.totalRedeemed,
            user.lastUpdated
        );
    }
} 
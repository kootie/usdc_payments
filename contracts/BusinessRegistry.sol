// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BusinessRegistry is Ownable, ReentrancyGuard {
    struct Business {
        string name;
        string location;
        string category;
        bool isActive;
        uint256 registrationDate;
        string[] productIds;
    }
    
    struct Product {
        string name;
        string description;
        uint256 price; // in USDC (6 decimals)
        bool isAvailable;
        string imageHash; // IPFS hash for product image
    }
    
    mapping(address => Business) public businesses;
    mapping(address => mapping(string => Product)) public products;
    mapping(address => bool) public isRegistered;
    
    event BusinessRegistered(address indexed business, string name, string category);
    event BusinessUpdated(address indexed business);
    event ProductAdded(address indexed business, string productId);
    event ProductUpdated(address indexed business, string productId);
    
    function registerBusiness(
        address _business,
        string memory _name,
        string memory _location,
        string memory _category
    ) external onlyOwner {
        require(!isRegistered[_business], "Business already registered");
        
        businesses[_business] = Business({
            name: _name,
            location: _location,
            category: _category,
            isActive: true,
            registrationDate: block.timestamp,
            productIds: new string[](0)
        });
        
        isRegistered[_business] = true;
        emit BusinessRegistered(_business, _name, _category);
    }
    
    function updateBusiness(
        address _business,
        string memory _name,
        string memory _location,
        string memory _category
    ) external onlyOwner {
        require(isRegistered[_business], "Business not registered");
        
        businesses[_business].name = _name;
        businesses[_business].location = _location;
        businesses[_business].category = _category;
        
        emit BusinessUpdated(_business);
    }
    
    function addProduct(
        address _business,
        string memory _productId,
        string memory _name,
        string memory _description,
        uint256 _price,
        string memory _imageHash
    ) external onlyOwner {
        require(isRegistered[_business], "Business not registered");
        
        products[_business][_productId] = Product({
            name: _name,
            description: _description,
            price: _price,
            isAvailable: true,
            imageHash: _imageHash
        });
        
        businesses[_business].productIds.push(_productId);
        emit ProductAdded(_business, _productId);
    }
    
    function updateProduct(
        address _business,
        string memory _productId,
        string memory _name,
        string memory _description,
        uint256 _price,
        string memory _imageHash,
        bool _isAvailable
    ) external onlyOwner {
        require(isRegistered[_business], "Business not registered");
        require(bytes(products[_business][_productId].name).length > 0, "Product does not exist");
        
        products[_business][_productId] = Product({
            name: _name,
            description: _description,
            price: _price,
            isAvailable: _isAvailable,
            imageHash: _imageHash
        });
        
        emit ProductUpdated(_business, _productId);
    }
    
    function getBusinessProducts(address _business) external view returns (string[] memory) {
        return businesses[_business].productIds;
    }
    
    function getProductDetails(
        address _business,
        string memory _productId
    ) external view returns (
        string memory name,
        string memory description,
        uint256 price,
        bool isAvailable,
        string memory imageHash
    ) {
        Product storage product = products[_business][_productId];
        return (
            product.name,
            product.description,
            product.price,
            product.isAvailable,
            product.imageHash
        );
    }
    
    function toggleBusinessStatus(address _business) external onlyOwner {
        require(isRegistered[_business], "Business not registered");
        businesses[_business].isActive = !businesses[_business].isActive;
        emit BusinessUpdated(_business);
    }
} 
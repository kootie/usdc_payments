# USDC Payment System for Base Mainnet

A comprehensive payment system built on Base Mainnet that enables businesses to accept USDC payments, manage loyalty points, and offer discounts.

## Features

- USDC Payment Router for handling payments
- Beacon Points loyalty system
- Business Registry for managing merchant information
- Discount Engine for promotions
- QR Code payment generation
- Mapbox integration for business discovery
- Sendy delivery integration for Kenya

## Prerequisites

- Node.js 16+
- PostgreSQL 12+
- MetaMask or other Web3 wallet
- Base Mainnet RPC URL

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/usdc_locator"

# Private key of the deployer wallet (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# BaseScan API key for contract verification
BASESCAN_API_KEY=your_basescan_api_key_here

# Mapbox API key for geolocation features
MAPBOX_API_KEY=your_mapbox_api_key_here

# Sendy API credentials
SENDY_API_KEY=your_sendy_api_key_here
SENDY_API_URL=https://api.sendy.co.ke/v1
```

## Database Setup

1. Install PostgreSQL if you haven't already
2. Create a PostgreSQL user with the following credentials:
   - Username: postgres
   - Password: password
3. Run the database setup script:
```bash
node scripts/setup-db.js
```
4. Initialize Prisma:
```bash
npx prisma generate
npx prisma db push
```

## Smart Contracts

The system consists of four main smart contracts:

1. `USDCPaymentRouter.sol`: Handles USDC payments and routing
2. `BeaconPoints.sol`: Manages loyalty points system
3. `BusinessRegistry.sol`: Stores business information and products
4. `DiscountEngine.sol`: Handles promotions and discounts

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
node scripts/setup-db.js
npx prisma generate
npx prisma db push
```

4. Deploy contracts to Base Mainnet:
```bash
npx hardhat run scripts/deploy.js --network base
```

## Development

1. Start the development server:
```bash
npm run dev
```

2. Run tests:
```bash
npx hardhat test
```

## Contract Addresses

After deployment, the following contracts will be available on Base Mainnet:

- USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- USDCPaymentRouter: [Deployed Address]
- BeaconPoints: [Deployed Address]
- BusinessRegistry: [Deployed Address]
- DiscountEngine: [Deployed Address]

## Security

- All contracts use OpenZeppelin's security features
- ReentrancyGuard is implemented for critical functions
- Access control is managed through Ownable pattern
- Circuit breakers are implemented for emergency situations

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

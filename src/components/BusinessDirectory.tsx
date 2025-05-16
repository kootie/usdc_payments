'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import WalletConnect from '@/components/WalletConnect';
import { parseUnits, formatUnits } from 'viem';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
}

interface Business {
  id: string;
  name: string;
  category: string;
  address: string;
  logo: string;
  products: Product[];
}

// Base Mainnet USDC contract address and ABI
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`;
const USDC_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }]
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  }
] as const;

// Mock data for businesses and their products
const businesses: Business[] = [
  {
    id: '1',
    name: 'Coffee Shop',
    category: 'Food & Beverage',
    address: '0x4200000000000000000000000000000000000006', // Base USDC Bridge
    logo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&h=200&fit=crop',
    products: [
      {
        id: 'p1',
        name: 'Espresso',
        price: 0.001,
        description: 'Single shot of espresso',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop'
      },
      {
        id: 'p2',
        name: 'Cappuccino',
        price: 0.001,
        description: 'Espresso with steamed milk and foam',
        image: 'https://images.unsplash.com/photo-1534687941688-651ccbafb5b1?w=400&h=300&fit=crop'
      },
      {
        id: 'p3',
        name: 'Croissant',
        price: 0.001,
        description: 'Buttery, flaky pastry',
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop'
      }
    ]
  },
  {
    id: '2',
    name: 'Book Store',
    category: 'Retail',
    address: '0x4200000000000000000000000000000000000007', // Base L2 Bridge
    logo: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=200&h=200&fit=crop',
    products: [
      {
        id: 'p4',
        name: 'Novel',
        price: 0.001,
        description: 'Bestselling fiction book',
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop'
      },
      {
        id: 'p5',
        name: 'Notebook',
        price: 0.001,
        description: 'Hardcover notebook',
        image: 'https://images.unsplash.com/photo-1583485088034-697b5bc36b9d?w=400&h=300&fit=crop'
      }
    ]
  },
  {
    id: '3',
    name: 'Tech Store',
    category: 'Electronics',
    address: '0x4200000000000000000000000000000000000008', // Base L2 Standard Bridge
    logo: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200&h=200&fit=crop',
    products: [
      {
        id: 'p6',
        name: 'Wireless Earbuds',
        price: 0.001,
        description: 'Noise-cancelling wireless earbuds',
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=300&fit=crop'
      },
      {
        id: 'p7',
        name: 'Power Bank',
        price: 0.001,
        description: '10000mAh portable charger',
        image: 'https://images.unsplash.com/photo-1609096437641-0d2b17a42708?w=400&h=300&fit=crop'
      }
    ]
  }
];

// Separate ProductCard component to handle individual product interactions
const ProductCard = ({ 
  product, 
  businessAddress, 
  onBuy, 
  isProcessing, 
  isConfirming, 
  isPending, 
  isConnected, 
  isBalanceLoading, 
  balance,
  isTransactionInProgress
}: { 
  product: Product;
  businessAddress: string;
  onBuy: (product: Product) => void;
  isProcessing: boolean;
  isConfirming: boolean;
  isPending: boolean;
  isConnected: boolean;
  isBalanceLoading: boolean;
  balance: bigint | undefined;
  isTransactionInProgress: boolean;
}) => {
  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isTransactionInProgress) {
      onBuy(product);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex gap-6">
        <div className="relative w-32 h-32 rounded-lg overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-gray-900">{product.name}</h4>
              <p className="text-gray-600 text-sm mt-1">{product.description}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{product.price} USDC</p>
              {isBalanceLoading ? (
                <p className="text-sm text-gray-500">Loading balance...</p>
              ) : balance && (
                <p className="text-sm text-gray-500">
                  Balance: {formatUnits(balance, 6)} USDC
                </p>
              )}
              <button 
                onClick={handleBuyClick}
                disabled={isTransactionInProgress || !isConnected || isBalanceLoading}
                className={`mt-2 px-4 py-2 rounded transition-colors ${
                  isTransactionInProgress || !isConnected || isBalanceLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {!isConnected ? 'Connect Wallet' :
                 isBalanceLoading ? 'Loading...' :
                 isTransactionInProgress ? 'Transaction in Progress...' :
                 'Buy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function BusinessDirectory() {
  const { isConnected, address } = useAccount();
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isTransactionInProgress, setIsTransactionInProgress] = useState(false);

  // Read USDC balance
  const { data: balance, isLoading: isBalanceLoading } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && isMounted,
    },
  });

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract({
    mutation: {
      onError: (error) => {
        console.error('Transaction error:', error);
        setError(error.message);
        setIsProcessing(false);
        setIsTransactionInProgress(false);
      }
    }
  });

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    onSuccess: () => {
      setIsProcessing(false);
      setIsTransactionInProgress(false);
    },
    onError: (error) => {
      console.error('Transaction confirmation error:', error);
      setError(error.message);
      setIsProcessing(false);
      setIsTransactionInProgress(false);
    }
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (writeError) {
      setError(writeError.message);
      setIsTransactionInProgress(false);
    }
  }, [writeError]);

  const handleBuy = async (product: Product) => {
    if (!selectedBusiness || !writeContract || !address) {
      setError('Please connect your wallet first');
      return;
    }

    // Prevent multiple transactions
    if (isTransactionInProgress) {
      return;
    }

    try {
      setError(null);
      setIsProcessing(true);
      setIsTransactionInProgress(true);
      setSelectedProduct(product);

      const amount = parseUnits(product.price.toString(), 6); // USDC has 6 decimals

      // Check if user has enough balance
      if (balance && balance < amount) {
        setError('Insufficient USDC balance');
        setIsProcessing(false);
        setIsTransactionInProgress(false);
        return;
      }

      console.log('Sending transaction for product:', {
        product: product.name,
        to: selectedBusiness.address,
        amount: amount.toString(),
        from: address,
        balance: balance ? formatUnits(balance, 6) : '0'
      });

      // Transfer USDC directly to the business
      const transferResult = await writeContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [
          selectedBusiness.address as `0x${string}`,
          amount
        ]
      });

      console.log('Transfer transaction sent for product:', product.name, transferResult);
    } catch (error) {
      console.error('Error processing payment for product:', product.name, error);
      setError(error instanceof Error ? error.message : 'Error processing payment. Please try again.');
      setIsProcessing(false);
      setIsTransactionInProgress(false);
    }
  };

  // Show loading state until client-side hydration is complete
  if (!isMounted) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Business Directory</h1>
            <div className="w-32 h-10 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-lg text-gray-700 mb-4">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Business Directory</h1>
            <WalletConnect />
          </div>
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-lg text-gray-700 mb-4">Please connect your wallet to view businesses</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Business Directory</h1>
          <WalletConnect />
        </div>

        {!selectedBusiness ? (
          <div className="grid gap-6">
            {businesses.map((business) => (
              <div
                key={business.id}
                className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                onClick={() => setSelectedBusiness(business)}
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src={business.logo}
                      alt={`${business.name} logo`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-2 text-gray-900">{business.name}</h2>
                    <p className="text-gray-600">{business.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelectedBusiness(null)}
              className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
            >
              ← Back to businesses
            </button>
            
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-20 h-20 rounded-full overflow-hidden">
                  <Image
                    src={selectedBusiness.logo}
                    alt={`${selectedBusiness.name} logo`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedBusiness.name}</h2>
                  <p className="text-gray-600">{selectedBusiness.category}</p>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Products</h3>
              <div className="grid gap-6">
                {selectedBusiness.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    businessAddress={selectedBusiness.address}
                    onBuy={handleBuy}
                    isProcessing={isProcessing}
                    isConfirming={isConfirming}
                    isPending={isPending}
                    isConnected={isConnected}
                    isBalanceLoading={isBalanceLoading}
                    balance={balance}
                  />
                ))}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {isSuccess && selectedProduct && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700">
                    Successfully purchased {selectedProduct.name} for {selectedProduct.price} USDC!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 
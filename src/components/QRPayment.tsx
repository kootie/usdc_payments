import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';

interface QRPaymentProps {
  businessAddress: `0x${string}`;
  amount: number;
}

// Base Mainnet USDC contract address
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`;

export default function QRPayment({ businessAddress, amount }: QRPaymentProps) {
  const { isConnected } = useAccount();
  const [isGenerating, setIsGenerating] = useState(false);

  const { writeContract } = useWriteContract();

  const handlePayment = () => {
    if (!writeContract) return;
    
    writeContract({
      address: USDC_ADDRESS,
      abi: [
        {
          name: 'transfer',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'recipient', type: 'address' },
            { name: 'amount', type: 'uint256' }
          ],
          outputs: [{ name: '', type: 'bool' }]
        }
      ],
      functionName: 'transfer',
      args: [businessAddress, parseUnits(amount.toString(), 6)] // USDC has 6 decimals
    });
  };

  const generateQRCode = () => {
    setIsGenerating(true);
    // Generate a unique session ID or nonce
    const sessionId = Math.random().toString(36).substring(7);
    const qrData = `base://pay?to=${businessAddress}&amount=${amount}&token=USDC&session=${sessionId}`;
    setIsGenerating(false);
    return qrData;
  };

  if (!isConnected) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Please connect your wallet to make a payment</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <div className="p-4 bg-white rounded-lg shadow-lg">
        {isGenerating ? (
          <div className="w-64 h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <QRCodeSVG
            value={generateQRCode()}
            size={256}
            level="H"
            includeMargin={true}
          />
        )}
      </div>
      
      <div className="text-center">
        <p className="text-lg font-semibold">Amount: {amount} USDC</p>
        <p className="text-sm text-gray-600">Scan to pay with USDC on Base</p>
      </div>

      <button
        onClick={handlePayment}
        disabled={!writeContract}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Pay with Base Wallet
      </button>
    </div>
  );
} 
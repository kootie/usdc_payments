import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function WalletConnect() {
  const { isConnected } = useAccount();

  return (
    <div className="flex items-center gap-4">
      <ConnectButton />
      {isConnected && (
        <div className="text-sm text-gray-600">
          Connected to Base Mainnet
        </div>
      )}
    </div>
  );
} 
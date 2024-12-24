import React from 'react';

interface AddressDisplayProps {
  raiseWalletAddress: string;
  traderAddress: string;
  tokenAddress: string;
}

interface AddressFieldProps {
  label: string;
  address: string;
}

const AddressDisplay: React.FC<AddressDisplayProps> = ({ 
  raiseWalletAddress, 
  traderAddress, 
  tokenAddress 
}) => {
  const truncateAddress = (address: string): string => {
    if (!address) return 'Not Available';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text);
  };

  const AddressField: React.FC<AddressFieldProps> = ({ label, address }) => (
    <div className="mb-4 last:mb-0">
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {label}
      </label>
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
        <span className="text-sm font-mono text-gray-800">
          {truncateAddress(address)}
        </span>
        <button
          onClick={() => copyToClipboard(address)}
          className="ml-2 p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Copy to clipboard"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
            />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-white rounded-lg p-6">
      <div className="space-y-4">
        <AddressField label="Raise Wallet Address" address={raiseWalletAddress} />
        <AddressField label="Trader Address" address={traderAddress} />
        <AddressField label="Token Address" address={tokenAddress} />
      </div>
    </div>
  );
};

export default AddressDisplay;
import React, { useState } from 'react';
import { ethers } from 'ethers';

interface EarningsManagementProps {
 
}

const EarningsManagement: React.FC<EarningsManagementProps> = ({ }) => {
  const [contractAddress, setContractAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [earnings, setEarnings] = useState('0.00');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleWithdraw = async () => {
    if (!contractAddress || !tokenId) {
      setErrorMessage('Please enter both contract address and token ID');
      return;
    }

  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-6">Earnings Management</h2>
      
      <div className="bg-gray-700 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium text-white mb-2">Current Earnings</h3>
        <p className="text-3xl font-bold text-blue-400">{earnings} ETH</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Contract Address
          </label>
          <input
            type="text"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            placeholder="Enter contract address"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Token ID
          </label>
          <input
            type="text"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="Enter token ID"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {errorMessage && (
          <div className="text-red-400 text-sm mt-2">
            {errorMessage}
          </div>
        )}

        <button
          onClick={handleWithdraw}
          disabled={isLoading}
          className={`w-full px-4 py-2 ${
            isLoading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white rounded-lg transition-colors`}
        >
          {isLoading ? 'Processing...' : 'Withdraw Earnings'}
        </button>
      </div>
    </div>
  );
};

export default EarningsManagement;
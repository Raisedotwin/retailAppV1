import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface ContractPosition {
  id: string;
  amount: number;
  price: number;
  expiryTime: number;
  isWriter: boolean;
  premium: number;
  counterpartyAddress: string;
  tokenAddress: string;
}

interface ActiveContractsProps {
  tokenAddress?: string;
  optionsContract?: any;
  userAddress?: string;
}

const PaginationControls = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => (
  <div className="flex items-center justify-center gap-4 mt-6">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <span className="text-gray-300">←</span>
    </button>
    
    <span className="text-gray-300">
      Page {currentPage} of {totalPages}
    </span>
    
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <span className="text-gray-300">→</span>
    </button>
  </div>
);

const ActiveContracts: React.FC<ActiveContractsProps> = ({ 
  tokenAddress, 
  optionsContract,
  userAddress
}) => {
  const [activeContracts, setActiveContracts] = useState<ContractPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<ContractPosition | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchContracts = async () => {
      if (!optionsContract || !tokenAddress || !userAddress) {
        setIsLoading(false);
        return;
      }

      try {
        const writtenCalls = await optionsContract.getCallsByWriterAndToken(userAddress, tokenAddress);
        const boughtCalls = await optionsContract.getCallsByBuyerAndToken(userAddress, tokenAddress);

        const writtenPositions = writtenCalls.map((call: any) => ({
          id: call.id.toString(),
          amount: Number(ethers.formatEther(call.amount)),
          price: Number(ethers.formatEther(call.strikePrice)),
          expiryTime: Number(call.expiryTime),
          isWriter: true,
          premium: Number(ethers.formatEther(call.premium)),
          counterpartyAddress: call.buyer,
          tokenAddress: call.tokenAddress
        }));

        const boughtPositions = boughtCalls.map((call: any) => ({
          id: call.id.toString(),
          amount: Number(ethers.formatEther(call.amount)),
          price: Number(ethers.formatEther(call.strikePrice)),
          expiryTime: Number(call.expiryTime),
          isWriter: false,
          premium: Number(ethers.formatEther(call.premium)),
          counterpartyAddress: call.writer,
          tokenAddress: call.tokenAddress
        }));

        setActiveContracts([...writtenPositions, ...boughtPositions]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching contracts:', error);
        setIsLoading(false);
      }
    };

    fetchContracts();
  }, [optionsContract, tokenAddress, userAddress]);

  const handleClosePosition = async (position: ContractPosition) => {
    setSelectedPosition(position);
    setShowCloseModal(true);
    setErrorMessage(null);
  };

  const executeClosePosition = async () => {
    console.log('Closing position:', selectedPosition);
    if (!selectedPosition || !optionsContract) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = currentTime > selectedPosition.expiryTime;
      const isUnbought = selectedPosition.counterpartyAddress === ethers.ZeroAddress;

      let tx;

      if (selectedPosition.isWriter) {
        if (isExpired) {
          // Writer after expiry
          tx = await optionsContract.claimExpiredCallOption(selectedPosition.id);
        } else if (isUnbought) {
          // Writer before expiry with no buyer
          tx = await optionsContract.closeUnboughtOption(selectedPosition.id);
        } else {
          throw new Error("Cannot close a written option that has been bought before expiry");
        }
      } else {
        // Buyer exercising option
        tx = await optionsContract.exerciseCall(selectedPosition.id);
      }

      //await tx.wait();
      
      // Refresh the contracts list
      const updatedContracts = activeContracts.filter(
        contract => contract.id !== selectedPosition.id
      );
      setActiveContracts(updatedContracts);
      setShowCloseModal(false);
      setIsProcessing(false);

    } catch (error: any) {
      console.error('Error closing position:', error);
      setErrorMessage(error.message || 'Error closing position');
      setIsProcessing(false);
    }
  };

  // Calculate total pages and handle pagination
  const totalPages = Math.ceil(activeContracts.length / itemsPerPage);
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const currentContracts = activeContracts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCloseButtonText = (position: ContractPosition) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = currentTime > position.expiryTime;
    const isUnbought = position.counterpartyAddress === ethers.ZeroAddress;

    if (position.isWriter) {
      if (isExpired) return "Claim Expired Option";
      if (isUnbought) return "Close Unbought Option";
      return "Position Locked";
    }
    return "Exercise Option";
  };

  const isClosable = (position: ContractPosition) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = currentTime > position.expiryTime;
    const isUnbought = position.counterpartyAddress === ethers.ZeroAddress;

    if (position.isWriter) {
      return isExpired || isUnbought;
    }
    return true; // Buyers can always exercise
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin text-3xl mr-2">🔄</div>
        <span className="text-gray-300">Loading your contracts...</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl shadow-xl mt-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="text-purple-400 text-3xl">📊</span>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            Your Active Contracts
          </h2>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-700">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-4 text-gray-400">Role</th>
              <th className="p-4 text-gray-400">Amount</th>
              <th className="p-4 text-gray-400">Strike Price</th>
              <th className="p-4 text-gray-400">Premium</th>
              <th className="p-4 text-gray-400">Expiry</th>
              <th className="p-4 text-gray-400">Counterparty</th>
              <th className="p-4 text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentContracts.map((position) => (
              <tr key={position.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full ${
                    position.isWriter
                      ? 'bg-blue-400/10 text-blue-400'
                      : 'bg-purple-400/10 text-purple-400'
                  }`}>
                    {position.isWriter ? '🌊 Writer' : '🎯 Buyer'}
                  </span>
                </td>
                <td className="p-4">
                  <span className="bg-green-400/10 text-green-400 px-3 py-1 rounded-full">
                    {position.amount} 🪙
                  </span>
                </td>
                <td className="p-4">
                  <span className="bg-yellow-400/10 text-yellow-400 px-3 py-1 rounded-full">
                    {position.price} ETH
                  </span>
                </td>
                <td className="p-4">
                  <span className="bg-purple-400/10 text-purple-400 px-3 py-1 rounded-full">
                    {position.premium} ETH
                  </span>
                </td>
                <td className="p-4 text-gray-300">
                  {new Date(position.expiryTime * 1000).toLocaleDateString()}
                </td>
                <td className="p-4 font-mono text-gray-300">
                  {position.counterpartyAddress === ethers.ZeroAddress 
                    ? "No Counterparty" 
                    : `${position.counterpartyAddress.slice(0, 6)}...${position.counterpartyAddress.slice(-4)}`}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleClosePosition(position)}
                    disabled={!isClosable(position)}
                    className={`px-4 py-2 rounded-lg transition-all transform hover:scale-105 ${
                      isClosable(position)
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {getCloseButtonText(position)}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationControls 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {showCloseModal && selectedPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
            <h2 className="text-xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-4">
              {getCloseButtonText(selectedPosition)}
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-700/50 p-4 rounded-lg space-y-2">
                <p className="text-gray-300">Amount: <span className="text-green-400">{selectedPosition.amount} 🪙</span></p>
                <p className="text-gray-300">Strike Price: <span className="text-yellow-400">{selectedPosition.price} ETH</span></p>
                <p className="text-gray-300">Premium: <span className="text-purple-400">{selectedPosition.premium} ETH</span></p>
                <p className="text-gray-300">Expiry: <span className="text-blue-400">
                  {new Date(selectedPosition.expiryTime * 1000).toLocaleDateString()}
                </span></p>
              </div>

              {errorMessage && (
                <div className="bg-red-400/10 text-red-400 p-4 rounded-lg">
                  {errorMessage}
                </div>
              )}

              <div className="flex justify-between gap-4 mt-6">
                <button
                  onClick={() => setShowCloseModal(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeClosePosition}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin text-sm">🔄</div>
                      Processing...
                    </span>
                  ) : (
                    'Confirm'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveContracts;
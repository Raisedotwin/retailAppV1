import React, { useState } from 'react';

const TradingFeesManagement = () => {
  const [selectedStore, setSelectedStore] = useState(null);
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');

  // Dummy trading fees data
  const tradingFees = [
    { 
      id: '1', 
      storeName: 'Premium Collectibles', 
      balance: '0.45 ETH',
      address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
      lastWithdrawal: '2025-02-28'
    },
    { 
      id: '2', 
      storeName: 'Rare Digital Art', 
      balance: '1.23 ETH',
      address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
      lastWithdrawal: '2025-03-01'
    },
    { 
      id: '3', 
      storeName: 'NFT Marketplace', 
      balance: '0.78 ETH',
      address: '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB',
      lastWithdrawal: '2025-03-05'
    },
    { 
      id: '4', 
      storeName: 'Crypto Collectibles', 
      balance: '0.32 ETH',
      address: '0x1cbd3b2770909d4e10f157cabc84c7264073c9ec',
      lastWithdrawal: '2025-03-10'
    }
  ];

  const handleStoreSelect = (store:any) => {
    setSelectedStore(store);
    setIsWithdrawModalVisible(true);
  };

  const handleWithdraw = () => {
    setIsProcessing(true);
    setProcessingMessage('Processing withdrawal...');
    
    // Simulate processing
    setTimeout(() => {
      setProcessingMessage('Withdrawal successful!');
      
      // Close processing modal after a delay
      setTimeout(() => {
        setIsProcessing(false);
        setIsWithdrawModalVisible(false);
        setSelectedStore(null);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-6">Trading Fees</h2>
      
      <div className="space-y-4">
        {tradingFees.map((fee) => (
          <div 
            key={fee.id} 
            className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
            onClick={() => handleStoreSelect(fee)}
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h3 className="text-lg font-medium text-white mb-1">{fee.storeName}</h3>
                <p className="text-gray-400 font-mono text-xs mb-2 break-all">{fee.address}</p>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">Last Withdrawal: {fee.lastWithdrawal}</span>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex items-center">
                <span className="px-4 py-2 text-sm font-medium rounded-lg bg-green-500/20 text-green-300 border border-green-500/30 mr-2">
                  {fee.balance}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {tradingFees.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-400">No trading fees available</p>
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {isWithdrawModalVisible && selectedStore && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-white/10 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Withdraw Trading Fees</h3>
              <button 
                onClick={() => {
                  setIsWithdrawModalVisible(false);
                  setSelectedStore(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-gray-400 text-sm">Store</h4>
                <p className="text-white font-medium">{selectedStore}</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">Store Address</h4>
                <p className="text-gray-300 font-mono text-xs break-all">{selectedStore}</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">Available Balance</h4>
                <p className="text-green-400 font-medium text-xl">{selectedStore}</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">Last Withdrawal</h4>
                <p className="text-white">{selectedStore}</p>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-700">
              <button
                onClick={handleWithdraw}
                className="w-full py-3 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
              >
                Withdraw Fees
              </button>
              <p className="text-gray-400 text-sm text-center mt-4">
                Fees will be sent to your connected wallet address
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Processing Modal */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-white/10 flex flex-col items-center max-w-md w-full mx-4">
            <div className="bg-white/10 p-4 rounded-full mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Processing</h3>
            <p className="text-gray-300 text-center mb-6">
              {processingMessage}
            </p>
            <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingFeesManagement;
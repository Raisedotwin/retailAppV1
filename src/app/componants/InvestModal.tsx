import React, { useState, useEffect } from 'react';

interface InvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenSymbol?: string;
  ethUsdPrice?: number;
}

const InvestModal: React.FC<InvestModalProps> = ({
  isOpen,
  onClose,
  tokenSymbol = 'TOKEN',
  ethUsdPrice = 3000
}) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [ethAmount, setEthAmount] = useState<string>('');
  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Token price in ETH - this would normally come from your contract
  const dummyTokenPriceInEth = 0.000025;
  const dummyTokenPriceInUsd = dummyTokenPriceInEth * ethUsdPrice;
  
  // User's token balance - this would normally come from your contract
  const dummyTokenBalance = 25000;
  
  // User's ETH balance - this would normally come from your wallet
  const dummyEthBalance = 1.25;
  
  // Reset form when tab changes
  useEffect(() => {
    setEthAmount('');
    setTokenAmount('');
  }, [activeTab]);
  
  // Update token amount when ETH amount changes (for Buy)
  const handleEthAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEthAmount(value);
    
    if (value && !isNaN(parseFloat(value))) {
      const calculatedTokens = parseFloat(value) / dummyTokenPriceInEth;
      setTokenAmount(calculatedTokens.toFixed(2));
    } else {
      setTokenAmount('');
    }
  };
  
  // Update ETH amount when token amount changes (for Buy)
  const handleTokenAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTokenAmount(value);
    
    if (value && !isNaN(parseFloat(value))) {
      const calculatedEth = parseFloat(value) * dummyTokenPriceInEth;
      setEthAmount(calculatedEth.toFixed(6));
    } else {
      setEthAmount('');
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      onClose();
      
      // In a real app, you would call your contract methods here
      // For buy: token_contract.buy(ethAmount)
      // For sell: token_contract.sell(tokenAmount)
    }, 2000);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-violet-800">Invest in {tokenSymbol}</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 18" />
            </svg>
          </button>
        </div>
        
        {/* Token Price Info */}
        <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 p-4 rounded-xl border border-violet-100 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Current Price</p>
              <p className="text-2xl font-bold text-violet-700">${dummyTokenPriceInUsd.toFixed(6)}</p>
              <p className="text-sm text-gray-500">{dummyTokenPriceInEth.toFixed(6)} ETH</p>
            </div>
            <div className="h-12 w-12 bg-violet-100 rounded-full flex items-center justify-center">
              <span className="text-violet-700 font-bold">{tokenSymbol}</span>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
          <button
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'buy' 
                ? 'bg-white text-violet-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('buy')}
          >
            Buy
          </button>
          <button
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'sell' 
                ? 'bg-white text-violet-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('sell')}
          >
            Sell
          </button>
        </div>
        
        {/* Buy/Sell Form */}
        <form onSubmit={handleSubmit}>
          {activeTab === 'buy' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (ETH)</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.0"
                    step="0.000001"
                    min="0"
                    value={ethAmount}
                    onChange={handleEthAmountChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    ETH
                  </div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    ≈ ${ethAmount ? (parseFloat(ethAmount) * ethUsdPrice).toFixed(2) : '0.00'} USD
                  </span>
                  <span className="text-xs text-violet-600">
                    Balance: {dummyEthBalance.toFixed(4)} ETH
                  </span>
                </div>
              </div>
              
              <div className="flex justify-center my-2">
                <div className="bg-gray-200 p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">You'll Receive ({tokenSymbol})</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.0"
                    step="0.01"
                    min="0"
                    value={tokenAmount}
                    onChange={handleTokenAmountChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    {tokenSymbol}
                  </div>
                </div>
                <div className="flex justify-end mt-1">
                  <button 
                    type="button"
                    onClick={() => {
                      setEthAmount(dummyEthBalance.toFixed(6));
                      setTokenAmount((dummyEthBalance / dummyTokenPriceInEth).toFixed(2));
                    }}
                    className="text-xs text-violet-600 hover:text-violet-700"
                  >
                    Max
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={!ethAmount || parseFloat(ethAmount) <= 0 || isProcessing}
                className="w-full py-3 mt-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : `Buy ${tokenSymbol}`}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ({tokenSymbol})</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.0"
                    step="0.01"
                    min="0"
                    value={tokenAmount}
                    onChange={handleTokenAmountChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    {tokenSymbol}
                  </div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    ≈ ${tokenAmount ? (parseFloat(tokenAmount) * dummyTokenPriceInUsd).toFixed(2) : '0.00'} USD
                  </span>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-violet-600">
                      Balance: {dummyTokenBalance.toLocaleString()} {tokenSymbol}
                    </span>
                    <button 
                      type="button"
                      onClick={() => {
                        setTokenAmount(dummyTokenBalance.toString());
                        setEthAmount((dummyTokenBalance * dummyTokenPriceInEth).toFixed(6));
                      }}
                      className="text-xs text-violet-600 hover:text-violet-700"
                    >
                      Max
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center my-2">
                <div className="bg-gray-200 p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">You'll Receive (ETH)</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.0"
                    step="0.000001"
                    min="0"
                    value={ethAmount}
                    onChange={handleEthAmountChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    ETH
                  </div>
                </div>
                <div className="flex justify-start mt-1">
                  <span className="text-xs text-gray-500">
                    ≈ ${ethAmount ? (parseFloat(ethAmount) * ethUsdPrice).toFixed(2) : '0.00'} USD
                  </span>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={!tokenAmount || parseFloat(tokenAmount) <= 0 || isProcessing}
                className="w-full py-3 mt-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : `Sell ${tokenSymbol}`}
              </button>
            </div>
          )}
        </form>
        
        {/* Fee Info */}
        <div className="mt-4">
          <p className="text-xs text-gray-500 text-center">
            Network Fee: ~0.0005 ETH • Slippage Tolerance: 1%
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvestModal;
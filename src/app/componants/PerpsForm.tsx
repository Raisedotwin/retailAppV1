"use client";

import React, { useState } from "react";

// Simple SVG icons as components
const PowerIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const WalletIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 7v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7m16 0a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2m16 0h-2v3a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V7H8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowDownIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v8m-4-4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowUpIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16V8m-4 4l4-4 4 4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PerpsForm = () => {
  const [wethBalance, setWethBalance] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!isNaN(amount) && amount > 0) {
      setWethBalance((prevBalance) => prevBalance + amount);
      setDepositAmount("");
    }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!isNaN(amount) && amount > 0 && amount <= wethBalance) {
      setWethBalance((prevBalance) => prevBalance - amount);
      setWithdrawAmount("");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Perps Trading Panel
          </h2>
          <p className="text-gray-400 text-sm">Manage your perpetual positions</p>
        </div>

        {/* Initialize/Disconnect Section */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/20 group"
          >
            <PowerIcon />
            Initialize
          </button>
          <button 
            className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg shadow-red-500/20 group"
          >
            <PowerIcon />
            Disconnect
          </button>
        </div>

        {/* Balance Display */}
        <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Balance</span>
            <div className="flex items-center space-x-2">
              <WalletIcon />
              <span className="text-lg font-semibold text-white">{wethBalance.toFixed(2)} WETH</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-gray-800/30 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`flex items-center justify-center space-x-2 py-2 rounded-lg transition-all duration-200 ${
              activeTab === 'deposit' 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowDownIcon />
            <span>Deposit</span>
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex items-center justify-center space-x-2 py-2 rounded-lg transition-all duration-200 ${
              activeTab === 'withdraw' 
                ? 'bg-purple-500 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowUpIcon />
            <span>Take Profit</span>
          </button>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          {activeTab === 'deposit' ? (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter WETH amount"
                  className="w-full bg-gray-800/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                />
                <span className="absolute right-4 top-3 text-gray-400">WETH</span>
              </div>
              <button
                onClick={handleDeposit}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg text-white font-medium transition-all duration-200 shadow-lg shadow-blue-500/20"
              >
                Deposit Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount to withdraw"
                  className="w-full bg-gray-800/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200"
                />
                <span className="absolute right-4 top-3 text-gray-400">WETH</span>
              </div>
              <button
                onClick={handleWithdraw}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-lg text-white font-medium transition-all duration-200 shadow-lg shadow-purple-500/20"
              >
                Take Profit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerpsForm;
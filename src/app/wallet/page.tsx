"use client";

import React from 'react';
import Link from 'next/link';
import { useAccount } from '../context/AccountContext';
import { useState } from 'react';

const WalletPage: React.FC = () => {
  const { account } = useAccount();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Example balance; in a real app, you'd fetch this from a blockchain API
  const ethBalance = "0.000319176803865112 ETH";

  const handleDeposit = async () => {
    if (!account) {
      alert('Please connect your wallet first.');
      return;
    }

    // Handle the deposit logic here
    console.log("Deposit amount:", depositAmount);
  };

  const handleWithdraw = async () => {
    if (!account) {
      alert('Please connect your wallet first.');
      return;
    }

    // Handle the withdraw logic here
    console.log("Withdraw amount:", withdrawAmount);
  };

  const handleClaim = async () => {
    // Handle the claim logic here
    console.log("Claim function triggered");
  };

  const handleCreate = async () => {
    // Handle the claim logic here
    console.log("Claim function triggered");
  };

  return (
    <div className="min-h-screen bg-black flex flex-col p-6">
      <div className="max-w-3xl w-full mx-auto p-8 bg-gray-900 rounded-lg shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">Raise Wallet:</h2>
              {account ? (
                <button
                  type="button"
                  onClick={handleClaim}
                  className="px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-lg hover:from-green-500 hover:to-blue-600 transition duration-300"
                >
                  Claim
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-lg hover:from-green-500 hover:to-blue-600 transition duration-300"
                >
                  Create
                </button>
              )}
            </div>
            <div className="flex space-x-4">
              <Link href="/dashboard">
                <div className="px-4 py-2 bg-gradient-to-r from-orange-400 to-purple-500 text-white rounded-lg shadow-lg hover:from-orange-500 hover:to-purple-600 transition duration-300 cursor-pointer">
                  Dashboard
                </div>
              </Link>
              <Link href="/positions">
                <div className="px-4 py-2 bg-gradient-to-r from-orange-400 to-purple-500 text-white rounded-lg shadow-lg hover:from-orange-500 hover:to-purple-600 transition duration-300 cursor-pointer">
                  Positions
                </div>
              </Link>
            </div>
          </div>

          {account ? (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white">Connected Address:</h3>
              <p className="text-gray-400 break-words">{account}</p>
            </div>
          ) : (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white">No Address Connected</h3>
            </div>
          )}
        </div>
        
        <div>
          <div className="p-4 mb-6 bg-gray-800 rounded-lg shadow-lg text-center text-white text-lg">
            {ethBalance}
          </div>
          <form className="p-8 bg-gray-800 rounded-lg shadow-md">
            <div className="mb-6">
              <label className="block text-white text-sm font-bold mb-2">Deposit</label>
              <div className="flex">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="e.g. 100"
                  className="bg-gray-800 border border-gray-700 text-white p-3 w-full rounded-l focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={handleDeposit}
                  className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-4 py-3 rounded-r shadow-lg hover:from-blue-500 hover:to-purple-600 transition duration-300"
                >
                  Deposit
                </button>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-white text-sm font-bold mb-2">Withdraw</label>
              <div className="flex">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 50"
                  className="bg-gray-800 border border-gray-700 text-white p-3 w-full rounded-l focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={handleWithdraw}
                  className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-4 py-3 rounded-r shadow-lg hover:from-blue-500 hover:to-purple-600 transition duration-300"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;


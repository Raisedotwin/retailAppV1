"use client";

import React, { useState } from 'react';
import { useAccount } from '../context/AccountContext';

const DashboardPage: React.FC = () => {
  const { account } = useAccount();
  const [switchAddress, setSwitchAddress] = useState('');
  const [spendAmount, setSpendAmount] = useState('20%');

  // Example data; in a real app, these would be fetched from a backend or blockchain API
  const tokenomics = {
    supply: 2,
    holders: 5,
    marketCap: 0.0005,
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl w-full mx-auto p-6 bg-gray-900 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 md:mb-0">Dashboard:</h2>
        </div>
 

        {/* Tokenomics Section */}
        <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">Tokenomics</h3>
          <div className="text-gray-400">
            <p className="mb-2"><strong>Supply:</strong> {tokenomics.supply}</p>
            <p className="mb-2"><strong>Holders:</strong> {tokenomics.holders}</p>
            <p className="mb-2"><strong>Market Cap:</strong> {tokenomics.marketCap}</p>
          </div>
        </div>

        {/* Update Wallet Section */}
        <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">Raise Wallet Settings</h3>
          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2">Switch Address</label>
            <div className="flex">
              <input
                type="text"
                value={switchAddress}
                onChange={(e) => setSwitchAddress(e.target.value)}
                placeholder="Enter new wallet address"
                className="bg-gray-800 border border-gray-700 text-white p-3 w-full rounded-l focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-4 py-3 rounded-r shadow-lg hover:from-blue-500 hover:to-purple-600 transition duration-300"
              >
                Switch
              </button>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2">Automatic Spend Amount</label>
            <div className="flex">
              <select
                value={spendAmount}
                onChange={(e) => setSpendAmount(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white p-3 w-full rounded-l focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="20%">20%</option>
                <option value="40%">40%</option>
                <option value="60%">60%</option>
                <option value="90%">90%</option>
              </select>
              <button
                type="button"
                className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-4 py-3 rounded-r shadow-lg hover:from-blue-500 hover:to-purple-600 transition duration-300"
              >
                Set
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

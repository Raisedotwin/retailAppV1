"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { getEmbeddedConnectedWallet, usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';

const ChatPage: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('marketplace');
  const { user, login } = usePrivy();
  const { wallets } = useWallets();
  const [balance, setBalance] = useState("0.00");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Check if user is authenticated with X
  const isAuthenticated = user?.twitter?.username;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <Image 
                  src="/icons/logo.png" 
                  alt="NFT Marketplace" 
                  width={180} 
                  height={180}
                  className="transform transition-all duration-300 group-hover:scale-110"
                />
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-4">
              NFT Marketplace
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Trade NFTs seamlessly using your WETH balance. Connect with OpenSea's extensive marketplace.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center space-x-4 mb-12">
            <button
              onClick={() => handleTabChange('marketplace')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'marketplace'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Marketplace
            </button>
            <button
              onClick={() => handleTabChange('collection')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'collection'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              My Collection
            </button>
          </div>

          {/* Content Section */}
          <div className="max-w-4xl mx-auto">
            {activeTab === 'marketplace' ? (
              <div className="grid gap-8 md:grid-cols-2">
                {/* Feature Card - Trading */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">NFT Trading</h3>
                    <span className="text-2xl">🎭</span>
                  </div>
                  <p className="text-gray-400 mb-4">
                    Buy and sell NFTs using WETH. Access OpenSea's vast marketplace directly through our platform.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Powered by OpenSea</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm">Live</span>
                    </div>
                  </div>
                </div>

                {/* Feature Card - Analytics */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-pink-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Market Analytics</h3>
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-gray-400 mb-4">
                    Track floor prices, trading volume, and market trends for your favorite collections.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Real-time data</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-yellow-400 text-sm">Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mb-6">
                  <span className="text-6xl">🎨</span>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Your NFT Collection</h3>
                <p className="text-gray-400">
                  Connect your wallet to view your NFT collection
                </p>
              </div>
            )}
          </div>

          {/* NFT Trading Form */}
          <div className="mt-12 max-w-lg mx-auto">
            <div className="bg-gray-800/30 backdrop-blur-md rounded-2xl p-8 border border-gray-700/50">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                  Trade NFTs
                </h2>
                <p className="text-gray-400 mt-2">Coming Soon!</p>
              </div>

              <div className="space-y-6 opacity-50 pointer-events-none">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <label className="block text-gray-400 text-sm mb-2">NFT Contract Address</label>
                  <input
                    type="text"
                    placeholder="Enter NFT contract address"
                    className="w-full bg-gray-700 text-white p-3 rounded-lg"
                    disabled
                  />
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4">
                  <label className="block text-gray-400 text-sm mb-2">Token ID</label>
                  <input
                    type="text"
                    placeholder="Enter token ID"
                    className="w-full bg-gray-700 text-white p-3 rounded-lg"
                    disabled
                  />
                </div>

                <button
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium opacity-50"
                  disabled
                >
                  Trade NFT
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 py-8 border-t border-gray-800">
          <div className="text-center text-gray-500 text-sm">
            Powered by OpenSea Protocol
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      {!isAuthenticated && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50">
          <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-purple-500/20 flex flex-col items-center max-w-md w-full mx-4">
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-4 rounded-full mb-6">
              <Image src="/icons/logo.png" alt="X Logo" width={80} height={80} className="rounded-full" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Welcome to NFT Marketplace</h3>
            <p className="text-gray-300 text-center mb-6">
              Connect with X to access NFT trading features and explore the marketplace.
            </p>
            <div className="w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6"></div>
            <button 
              onClick={() => login()}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02]"
            >
              Connect with X
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatPage;
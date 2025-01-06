"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import SwapForm from '../componants/SwapForm';
import FollowSwapsForm from '../componants/FollowSwapsForm';
import { usePrivy, useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { EIP155_CHAINS } from '@/data/EIP155Data';
import Image from 'next/image';

const SwapsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'followSwaps' | 'swapDirect'>('swapDirect');
  const { user, login } = usePrivy();
  const [isProfileAssociated, setIsProfileAssociated] = useState(false);
  const [ethBalance, setEthBalance] = useState('0');
  const [profile, setProfile] = useState<any>(null);
  const { wallets } = useWallets();
  const wallet = getEmbeddedConnectedWallet(wallets);
  const nativeAddress = user?.wallet?.address;

  const rpcURL = EIP155_CHAINS["eip155:8453"].rpc;
  const provider = useMemo(() => new ethers.JsonRpcProvider(rpcURL), [rpcURL]);

  const profileAddr = '0xF449ee02878297d5bc73E69a1A5B379E503806cE';
  const profileABI = require("../abi/profile");
  const profileContract = useMemo(() => new ethers.Contract(profileAddr, profileABI, provider), [profileAddr, profileABI, provider]);

  const tokenPoolABI = require("../abi/traderPool");

 // Check if address is associated with a profile
  useEffect(() => {
  const checkProfileAssociation = async () => {
    if (!nativeAddress || !profileContract) {
      console.log('No address or contract:', { nativeAddress, hasContract: !!profileContract });
      setIsProfileAssociated(false);
      return;
    }

    try {
      // First try getting profile by address
      const isAssociated = await profileContract.isProfileAssociated(nativeAddress);
      console.log('Profile check results:', {
        address: nativeAddress,
        isAssociated: isAssociated
      });

      setIsProfileAssociated(isAssociated);

      if (isAssociated) {
        try {
          // If we have a Twitter username, try getting profile that way too
          if (user?.twitter?.username) {
            const profile = await profileContract.getProfile(user.twitter.username);
            setProfile(profile);

            if (profile && profile.length > 5) {
              const traderPoolAddr = profile[5];
              if (traderPoolAddr && traderPoolAddr !== ethers.ZeroAddress) {
                const traderPoolInstance = new ethers.Contract(traderPoolAddr, tokenPoolABI, provider);
                const balance = await traderPoolInstance.getTotal();
                setEthBalance(ethers.formatEther(balance));
              }
            }
          }
        } catch (profileError) {
          console.error('Error fetching profile details:', profileError);
          // Don't set isProfileAssociated to false here - the address is still associated
        }
      }
    } catch (error) {
      console.error('Error checking profile association:', error);
      setIsProfileAssociated(false);
    }
  };

  checkProfileAssociation();
}, [nativeAddress, profileContract, provider, tokenPoolABI, user?.twitter?.username]);

  return (
    <div className="min-h-screen bg-[#0e1016]">
      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1c1f2a] rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Balance</p>
                <p className="text-2xl font-bold text-white">{ethBalance} ETH</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1c1f2a] rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Network</p>
                <p className="text-2xl font-bold text-white">Base Chain</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <span className="text-xl">🌐</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1c1f2a] rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <p className="text-2xl font-bold text-white">Active</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-xs mx-auto mt-8">
          <div className="bg-[#1c1f2a] p-1.5 rounded-xl border border-gray-800">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab('followSwaps')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'followSwaps'
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Follow Swaps
              </button>
              <button
                onClick={() => setActiveTab('swapDirect')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'swapDirect'
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Swap Direct
              </button>
            </div>
          </div>
        </div>

        {/* Forms */}
        <div className="mt-8">
          {activeTab === 'followSwaps' && <FollowSwapsForm />}
          {activeTab === 'swapDirect' && <SwapForm balance={ethBalance} profile={profile} />}
        </div>
      </div>

      {/* Authentication Modals */}
      {nativeAddress && !isProfileAssociated && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50">
          <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-purple-500/20 flex flex-col items-center max-w-md w-full mx-4">
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-4 rounded-full mb-6">
              <Image src="/icons/logo.png" alt="Profile Required" width={80} height={80} className="rounded-full" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Profile Required</h3>
            <p className="text-gray-300 text-center mb-6">
              Your address must be associated with a Raise profile to access trading features.
            </p>
            <div className="w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6"></div>
            <button 
              onClick={() => window.location.href = '/wallet'}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02]"
            >
              Create Profile
            </button>
          </div>
        </div>
      )}

      {!nativeAddress && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50">
          <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-purple-500/20 flex flex-col items-center max-w-md w-full mx-4">
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-4 rounded-full mb-6">
              <Image src="/icons/logo.png" alt="Connect Wallet" width={80} height={80} className="rounded-full" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h3>
            <p className="text-gray-300 text-center mb-6">
              Connect your wallet to access swaps and trading features.
            </p>
            <div className="w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6"></div>
            <button 
              onClick={() => login()}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02]"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapsPage;
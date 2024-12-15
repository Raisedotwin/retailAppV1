"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import SwapForm from '../componants/SwapForm';
import FollowSwapsForm from '../componants/FollowSwapsForm';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { EIP155_CHAINS } from '@/data/EIP155Data';
import Image from 'next/image';

const SwapsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'followSwaps' | 'swapDirect'>('swapDirect');
  const { user } = usePrivy();
  const [loggedIntoWallet, setLoggedIntoWallet] = useState(true);
  const [loggedInToX, setLoggedInToXChain] = useState(true);
  const [ethBalance, setEthBalance] = useState('0');
  const [profile, setProfile] = useState<any>(null);

  const rpcURL = EIP155_CHAINS["eip155:8453"].rpc;
  const provider = useMemo(() => new ethers.JsonRpcProvider(rpcURL), [rpcURL]);

  const profileAddr = '0x4731d542b3137EA9469c7ba76cD16E4a563f0a16';
  const profileABI = require("../abi/profile");
  const profileContract = useMemo(() => new ethers.Contract(profileAddr, profileABI, provider), [profileAddr, profileABI, provider]);

  const tokenPoolABI = require("../abi/traderPool");

  const fetchProfile = useCallback(async () => {
    try {
      let username = user?.twitter?.username;
      if (username) {
        const profile = await profileContract.getProfileByName(username);
        setProfile(profile);
        return profile;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [profileContract, user?.twitter?.username]);

  useEffect(() => {
    const initContract = async () => {
      try {
        if (user?.twitter?.username) {
          setLoggedInToXChain(true);
          let profile = await fetchProfile();

          if (profile && profile.length > 5) {
            setLoggedIntoWallet(true);
            const traderPoolAddr = profile[5];

            if (traderPoolAddr) {
              const traderPoolInstance = new ethers.Contract(traderPoolAddr, tokenPoolABI, provider);
              const balance = await traderPoolInstance.getTotal();
              setEthBalance(ethers.formatEther(balance));
            }
          } else {
            console.log('Profile does not contain sufficient data.');
            setLoggedIntoWallet(false);
          }
        } else {
          setLoggedInToXChain(false);
        }
      } catch (error) {
        console.error('Error initializing contract:', error);
      }
    };

    initContract();
  }, [fetchProfile, user?.twitter?.username, provider]);

  return (
    <div className="min-h-screen bg-[#0e1016]"> {/* Dark background */}
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
      {!loggedInToX && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50">
          <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-purple-500/20 flex flex-col items-center max-w-md w-full mx-4">
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-4 rounded-full mb-6">
              <Image src="/icons/logo.png" alt="X Logo" width={80} height={80} className="rounded-full" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Welcome to Swaps</h3>
            <p className="text-gray-300 text-center mb-6">
              Connect with X to access advanced trading features and your personalized wallet.
            </p>
            <div className="w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6"></div>
            <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02]">
              Connect with X
            </button>
          </div>
        </div>
      )}

      {!loggedIntoWallet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50">
          <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-purple-500/20 flex flex-col items-center max-w-md w-full mx-4">
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-4 rounded-full mb-6">
              <Image src="/icons/logo.png" alt="Wallet Logo" width={80} height={80} className="rounded-full" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Create Your Wallet</h3>
            <p className="text-gray-300 text-center mb-6">
              Set up your trading wallet to start swapping tokens and following traders.
            </p>
            <div className="w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6"></div>
            <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02]">
              Create Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapsPage;
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
    <div className="min-h-screen p-6" style={{ backgroundColor: '#edf2f7' }}>
      <div className="max-w-4xl w-full mx-auto p-6">
        <div className="flex justify-center space-x-4 mb-6">
          <button
            className={`px-6 py-3 rounded-full transition-colors duration-300 ${activeTab === 'followSwaps' ? 'bg-purple-600 text-white shadow-lg transform scale-105' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
            onClick={() => setActiveTab('followSwaps')}
          >
            Follow Swaps
          </button>
          <button
            className={`px-6 py-3 rounded-full transition-colors duration-300 ${activeTab === 'swapDirect' ? 'bg-purple-600 text-white shadow-lg transform scale-105' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
            onClick={() => setActiveTab('swapDirect')}
          >
            Swap Direct
          </button>
        </div>

        {activeTab === 'followSwaps' && <FollowSwapsForm />}
        {activeTab === 'swapDirect' && <SwapForm balance={ethBalance} profile={profile} />}
      </div>

      {/* Updated X Authentication Modal */}
      {!loggedInToX && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-white/10 flex flex-col items-center max-w-md w-full mx-4">
            <div className="bg-white/10 p-4 rounded-full mb-6">
              <Image src="/icons/logo.png" alt="X Logo" width={80} height={80} className="rounded-full" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Authentication Required</h3>
            <p className="text-gray-300 text-center mb-6">
              Please authenticate with X to access your trading wallet and begin trading.
            </p>
            <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6"></div>
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200">
              Connect with X
            </button>
          </div>
        </div>
      )}

      {/* Updated Wallet Setup Modal */}
      {!loggedIntoWallet && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-white/10 flex flex-col items-center max-w-md w-full mx-4">
            <div className="bg-white/10 p-4 rounded-full mb-6">
              <Image src="/icons/logo.png" alt="Wallet Logo" width={80} height={80} className="rounded-full" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Wallet Setup Required</h3>
            <p className="text-gray-300 text-center mb-6">
              Please create a wallet with this address to start trading.
            </p>
            <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6"></div>
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200">
              Create Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapsPage;
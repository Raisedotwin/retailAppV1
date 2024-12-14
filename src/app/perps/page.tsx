"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import PerpsForm from "../componants/PerpsForm";
import HowToTrade from "../componants/HowToTrade";
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { EIP155_CHAINS } from '@/data/EIP155Data';
import Image from 'next/image';

const PerpsPage: React.FC = () => {
  const { user } = usePrivy();
  const [loggedIntoWallet, setLoggedIntoWallet] = useState(true);
  const [loggedInToX, setLoggedInToX] = useState(true);
  const [ethBalance, setEthBalance] = useState('0');
  const [profile, setProfile] = useState<any>(null);
  const [balance, setBalance] = useState<number>(0);

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
          setLoggedInToX(true);
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
          setLoggedInToX(false);
        }
      } catch (error) {
        console.error('Error initializing contract:', error);
      }
    };

    initContract();
  }, [fetchProfile, user?.twitter?.username, provider]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      {/* Header Section */}
      <div className="w-full bg-black/30 backdrop-blur-sm py-6 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Perpetuals Trading
            </h1>
            {user?.twitter?.username && (
              <div className="flex items-center space-x-4">
                <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="text-gray-300">Balance:</span>
                  <span className="ml-2 text-white font-semibold">{ethBalance} ETH</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Image 
                    src="/icons/logo.png" 
                    alt="Profile" 
                    width={24} 
                    height={24} 
                    className="rounded-full"
                  />
                  <span className="text-white">{user.twitter.username}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Trading Form Section */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">Trade Perpetuals</h2>
              <p className="text-gray-300">Execute your trades with advanced perpetuals trading features</p>
            </div>
            <PerpsForm />
          </div>

          {/* How To Trade Section */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">Trading Guide</h2>
              <p className="text-gray-300">Learn how to trade effectively and manage your positions</p>
            </div>
            <HowToTrade />
          </div>
        </div>
      </div>

      {/* Authentication Modals */}
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

      {!loggedIntoWallet && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-white/10 flex flex-col items-center max-w-md w-full mx-4">
            <div className="bg-white/10 p-4 rounded-full mb-6">
              <Image src="/icons/logo.png" alt="Wallet Logo" width={80} height={80} className="rounded-full" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Wallet Setup Required</h3>
            <p className="text-gray-300 text-center mb-6">
              Please create a wallet with this address to start trading perpetuals.
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

export default PerpsPage;
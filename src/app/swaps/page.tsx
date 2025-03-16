"use client";

import React, { useEffect, useState, useMemo } from 'react';
import SwapForm from '../componants/SwapForm';
import { usePrivy, useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { EIP155_CHAINS } from '@/data/EIP155Data';
import Image from 'next/image';

const SwapsPage: React.FC = () => {
  const { user, login } = usePrivy();
  const [isProfileAssociated, setIsProfileAssociated] = useState(true);
  const [ethBalance, setEthBalance] = useState('0');
  const [profile, setProfile] = useState<any>(null);
  const [enableBuying, setEnableBuying] = useState(false); // Toggle for buy functionality
  const { wallets } = useWallets();
  const wallet = getEmbeddedConnectedWallet(wallets);
  const nativeAddress = user?.wallet?.address;

  const rpcURL = EIP155_CHAINS["eip155:8453"].rpc;
  const provider = useMemo(() => new ethers.JsonRpcProvider(rpcURL), [rpcURL]);

  const profileAddr = '0x33E04eC91A04F8791927C06EF5E862e6AA09b71a';
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
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1f] via-[#141429] to-[#0e0e20]">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-indigo-600/20 blur-xl"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${20 + Math.random() * 80}px`,
                height: `${20 + Math.random() * 80}px`,
                opacity: 0.2 + Math.random() * 0.3,
                animation: `float ${10 + Math.random() * 20}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Page Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 mb-4">
            Loyalty Exchange
          </h1>
          <p className="text-indigo-200 max-w-2xl mx-auto">
            Redeem your loyalty points for rewards and watch your balance grow!
          </p>
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-2xl p-6 border border-indigo-500/30 backdrop-blur-sm transform transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-300 text-sm">Total Balance</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-white">{ethBalance} ETH</p>
                  <span className="ml-2 text-xl animate-pulse">💎</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 rounded-2xl p-6 border border-indigo-500/30 backdrop-blur-sm transform transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-300 text-sm">Network</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-white">Base Chain</p>
                  <span className="ml-2 text-xl animate-pulse">⚡</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                <span className="text-2xl">🌐</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-2xl p-6 border border-indigo-500/30 backdrop-blur-sm transform transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-300 text-sm">Status</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-white">Active</p>
                  <span className="ml-2 text-xl animate-bounce">✨</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-300 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Controls - you can place this wherever appropriate */}
        <div className="flex justify-end mb-4">
          <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-indigo-500/20">
            <label className="flex items-center cursor-pointer">
              <span className="text-indigo-200 mr-3 text-sm">Enable Buying</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={enableBuying}
                  onChange={() => setEnableBuying(!enableBuying)}
                />
                <div className={`w-10 h-5 ${enableBuying ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gray-600'} rounded-full shadow-inner transition-colors duration-300`}></div>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${enableBuying ? 'translate-x-5' : ''}`}></div>
              </div>
            </label>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="mt-8">
          <SwapForm balance={ethBalance} profile={profile} enableBuying={enableBuying} />
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(15px) translateX(15px); }
          50% { transform: translateY(0px) translateX(30px); }
          75% { transform: translateY(-15px) translateX(15px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SwapsPage;
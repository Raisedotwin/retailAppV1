"use client";

import React, { useEffect, useState, useMemo } from 'react';
import PerpsForm from "../componants/PerpsForm";
import { usePrivy, useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { EIP155_CHAINS } from '@/data/EIP155Data';
import Image from 'next/image';

const PerpsPage: React.FC = () => {
  const { user, login } = usePrivy();
  const { wallets } = useWallets();
  const [isProfileAssociated, setIsProfileAssociated] = useState(false);
  const [netValueUSDC, setNetValueUSDC] = useState('0');
  const [isProfit, setIsProfit] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const wallet = getEmbeddedConnectedWallet(wallets);
  const nativeAddress = user?.wallet?.address;

  const rpcURL = EIP155_CHAINS["eip155:8453"].rpc;
  const provider = useMemo(() => new ethers.JsonRpcProvider(rpcURL), [rpcURL]);

  const profileAddr = '0x05d3D90AEF1fbD9b5CD16d15839C5f7B4159340f';
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
        const isAssociated = await profileContract.isProfileAssociated(nativeAddress);
        console.log('Profile check results:', {
          address: nativeAddress,
          isAssociated: isAssociated
        });

        setIsProfileAssociated(isAssociated);

        if (isAssociated) {
            const profile = await profileContract.getProfile(nativeAddress);
            setProfile(profile);

            if (profile && profile.length > 5) {
              const traderPoolAddr = profile[5];
              if (traderPoolAddr && traderPoolAddr !== ethers.ZeroAddress) {
                const traderPoolInstance = new ethers.Contract(traderPoolAddr, tokenPoolABI, provider);
                const stats = await traderPoolInstance.getAccountStats();
                // Net value is returned in USDC (6 decimals)
                const formattedValue = ethers.formatUnits(stats[0], 6);
                setNetValueUSDC(formattedValue);
                setIsProfit(stats[4]); // Fourth boolean value indicates profit status
              }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      {/* Header Section */}
      <div className="w-full bg-black/30 backdrop-blur-sm py-6 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Perpetuals Trading
            </h1>
            {isProfileAssociated && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="text-gray-300">Net Value:</span>
                  <span className="ml-2 text-white font-semibold">${parseFloat(netValueUSDC).toFixed(2)}</span>
                  <div className={`ml-2 px-2 py-1 rounded ${isProfit ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {isProfit ? '▲ Profit' : '▼ Loss'}
                  </div>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Image 
                    src="/icons/logo.png" 
                    alt="Profile" 
                    width={24} 
                    height={24} 
                    className="rounded-full"
                  />
                  <span className="text-white">{nativeAddress?.slice(0, 6)}...{nativeAddress?.slice(-4)}</span>
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
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="text-yellow-500 mt-1">⚠️</div>
                  <div>
                    <p className="text-yellow-200 font-medium">EOA Required for Perpetuals Trading</p>
                    <p className="text-yellow-200/80 text-sm mt-1">
                      You need to switch to a MetaMask address to trade perpetuals.{' '}
                      <a 
                        href="/wallet" 
                        className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200"
                      >
                        Switch address here
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <PerpsForm />
          </div>

          {/* How To Trade Section */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6 shadow-xl">
            <h2 className="text-2xl font-semibold text-white mb-4">Trading Guide</h2>
            
            {/* Added text container */}
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 mb-6 border border-white/5">
              <p className="text-gray-300 leading-relaxed">
                Step by step walkthrough on trading perpetuals with Raise. All trades are powered by JOJO exchange and trades are made directly on the JOJO platform. To begin trading on JOJO simply click the initialize button to connect your Raise account.
              </p>
            </div>

            {/* Video container with better centering */}
            <div className="flex flex-col items-center bg-black/30 rounded-xl p-6 mb-6">
            <div className="w-full max-w-2xl aspect-video bg-gray-800 rounded-lg overflow-hidden">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/22wxQIPH6Ck"
                  title="Trading Guide"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            {/* JOJO button container */}
            <div className="flex justify-center">
              <a
                href="#"
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-colors duration-200 rounded-lg text-white font-medium w-full max-w-md"
                onClick={() => window.open('https://jojo.exchange','blank')}
              >
                <span>Go to JOJO</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Modals */}
      {nativeAddress && !isProfileAssociated && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-white/10 flex flex-col items-center max-w-md w-full mx-4">
            <div className="bg-white/10 p-4 rounded-full mb-6">
              <Image src="/icons/logo.png" alt="Profile Required" width={80} height={80} className="rounded-full" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Profile Required</h3>
            <p className="text-gray-300 text-center mb-6">
              Your address must be associated with a Raise profile to access trading features.
            </p>
            <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6"></div>
            <button 
              onClick={() => window.location.href = '/wallet'}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-300"
            >
              Create Profile
            </button>
          </div>
        </div>
      )}

      {!nativeAddress && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-white/10 flex flex-col items-center max-w-md w-full mx-4">
            <div className="bg-white/10 p-4 rounded-full mb-6">
              <Image src="/icons/logo.png" alt="Connect Wallet" width={80} height={80} className="rounded-full" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h3>
            <p className="text-gray-300 text-center mb-6">
              Connect your wallet to access perpetuals trading features.
            </p>
            <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6"></div>
            <button 
              onClick={() => login()}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-300"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerpsPage;
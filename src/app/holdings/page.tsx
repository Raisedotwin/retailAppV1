"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Holdings from '../componants/Holdings';
import { usePrivy } from '@privy-io/react-auth';
import { EIP155_CHAINS } from '@/data/EIP155Data';
import { ethers } from 'ethers';
import LogoLoader from '../componants/LogoLoader';

type AccountBalance = {
  account: string;
  balance: string;
  profileName: string;
  logo: string;
  username: string;
};

const HoldingsPage = () => {
  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  let rpcURL = EIP155_CHAINS["eip155:8453"].rpc;
  const provider = useMemo(() => new ethers.JsonRpcProvider(rpcURL), [rpcURL]);

  const tokenContractAddr = '0x9641d68B8d47A0fa34eC63a7b4c9CedcE3222027';
  const createAccountAddr = '0xf4A04e6a10C3f929Aa8f1f14766D226CAf904140';
  const profileAddr = '0x1330DF62D4CA561B96C2F7B69fd1F490c654B690';

  const tokenMarketABI = require("../abi/tokenMarket");
  const createAccountABI = require("../abi/createAccount");
  const profileABI = require("../abi/profile");

  const createProfile = useMemo(() => new ethers.Contract(createAccountAddr, createAccountABI, provider), [createAccountAddr, createAccountABI, provider]);
  const marketContract = useMemo(() => new ethers.Contract(tokenContractAddr, tokenMarketABI, provider), [tokenContractAddr, tokenMarketABI, provider]);
  const profileContract = useMemo(() => new ethers.Contract(profileAddr, profileABI, provider), [profileAddr, profileABI, provider]);

  const { login, logout, user } = usePrivy();

  useEffect(() => {
    const initContract = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let accountCounter = await createProfile.accountCounter();
        accountCounter = accountCounter.toString();

        let balances: AccountBalance[] = [];
        for (let i = 1; i <= accountCounter; i++) {
          const name = await profileContract.getNameByAccount(i);
          const marketCap = await marketContract.getMarketCap(i);
          const profileItem = await profileContract.getProfileByName(name);
          const profileName = profileItem[3];
          const link = profileItem[4];

          let marketCapEth = ethers.formatEther(marketCap);
          console.log("market cap", marketCapEth);
          
          balances.push({
            account: name,
            balance: marketCapEth.toString(),
            profileName,
            logo: link || `https://unavatar.io/twitter/${name}`,
            username: name,
          });
        }

        setAccountBalances(balances);
      } catch (error) {
        console.error('Error initializing contract:', error);
        setError('Failed to load holdings data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.wallet?.address) {
      initContract();
    }
  }, [user, createProfile, marketContract, profileContract]);

  if (!user?.wallet?.address) {
    return (
      <div className="min-h-screen relative">
        {/* Background Image Section */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ 
            backgroundImage: "url('/icons/balloonphoto.jpg')",
            filter: "brightness(0.9)"
          }}
        />
        
        {/* Content Overlay */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6 bg-black bg-opacity-30">
          <div className="bg-white backdrop-blur-lg bg-opacity-90 rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-8 transform transition-all hover:scale-102">
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 p-5 rounded-full mb-6 transform rotate-3 hover:rotate-6 transition-transform">
                <svg
                  className="w-10 h-10 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <path d="M3.3 7l8.7 5 8.7-5" />
                  <path d="M12 22V12" />
                </svg>
              </div>
              
              <h2 className="text-4xl font-bold text-gray-800 mb-4 text-center">
                Ready to Take Off?
              </h2>
              
              <p className="text-gray-600 text-center text-lg mb-8 leading-relaxed">
                Purchase tokens that track the performance of traders and AI agents. 
              </p>
            </div>
            
            <button
              onClick={() => login()}
              className="w-full group relative flex items-center justify-center px-8 py-4 text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="text-lg font-semibold mr-2">Launch App</span>
              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
            
            <div className="pt-6 mt-6">
              <p className="text-sm text-gray-500 text-center">
                By connecting your wallet, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <>
      {isLoading ? (
        <LogoLoader />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {error ? (
              <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg">
                <p>{error}</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <Holdings
                  data={accountBalances.map((balance, index) => ({
                    token: index + 1,
                    name: balance.profileName,
                    username: balance.username,
                    balance: balance.balance,
                    logo: balance.logo,
                    link: balance.profileName ? 
                      `/trader?name=${balance.profileName}&logo=${balance.logo}&username=${balance.username}` : 
                      '#',
                  }))}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default HoldingsPage;
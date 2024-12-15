"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Holdings from '../componants/Holdings';
import { usePrivy } from '@privy-io/react-auth';
import { EIP155_CHAINS } from '@/data/EIP155Data';
import { ethers } from 'ethers';
import NextLink from 'next/link';

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

  const tokenContractAddr = '0xc3369746eeC430A3D79EfA908698E1323333BB1d';
  const createAccountAddr = '0x65fe166D99CD92B0e19B4bAF47300A7866B9D249';
  const profileAddr = '0x4731d542b3137EA9469c7ba76cD16E4a563f0a16';

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

          balances.push({
            account: name,
            balance: marketCap.toString(),
            profileName,
            logo: link,
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">View Active Creators</h2>
          <p className="text-gray-600">Please connect your wallet to view raise creators.</p>
          <button
            onClick={() => login()}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">


        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
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
                link: balance.profileName ? 
                  `/trader?name=${balance.profileName}&logo=${balance.logo}&username=${balance.username}` : 
                  '#',
              }))}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HoldingsPage;
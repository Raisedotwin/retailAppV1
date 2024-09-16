"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Holdings from '../componants/Holdings';
import { usePrivy } from '@privy-io/react-auth';
import { EIP155_CHAINS } from '@/data/EIP155Data';
import { ethers } from 'ethers';
import NextLink from 'next/link'; // Import NextLink


// Define the type for account balances
type AccountBalance = {
  account: string;
  balance: string;
  profileName: string;
  logo: string;
  username: string;
};

const HoldingsPage = () => {
  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([]); // State for account balances

  let rpcURL = EIP155_CHAINS["eip155:8453"].rpc;

  const provider = useMemo(() => new ethers.JsonRpcProvider(rpcURL), [rpcURL]);

  const tokenContractAddr = '0xa9A9D98f70E79E90ad515472B56480A48891DB5c';
  const createAccountAddr = '0xf1AEFC101507e508e77CDA8080a4Fb10899eb620';
  const profileAddr = '0x1dF214861B5A87F3751D1442ec7802d01c07072E';

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
        let accountCounter = await createProfile.accountCounter();
        accountCounter = accountCounter.toString();

        let balances: AccountBalance[] = [];
        for (let i = 1; i <= accountCounter; i++) {
          const balance = await marketContract.sharesBalance(user?.wallet?.address, i);
          const name = await profileContract.getNameByAccount(i); 

          if (parseFloat(balance.toString()) > 0) {
            const profileItem = await profileContract.getProfileByName(name);
            const profileName = profileItem[3]; 
            const link = profileItem[4]; 
            const username = name;

            balances.push({
              account: name,
              balance: balance.toString(), // Format balance using formatEther
              profileName,
              logo: link,
              username: name,
            });
          }
        }

        setAccountBalances(balances);
      } catch (error) {
        console.error('Error initializing contract:', error);
      }
    };

    if (user?.wallet?.address) {
      initContract();
    }
  }, [user, createProfile, marketContract, profileContract]);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#edf2f7' }}>
      <Holdings 
        data={accountBalances.map((balance, index) => ({
          token: index + 1, // Token id or identifier
          name: balance.profileName, // Account name
          username: balance.username, // Username
          balance: balance.balance, // Balance
          link: balance.profileName ? `/trader?name=${balance.profileName}&logo=${balance.logo}&username=${balance.username}` : '#', // Dynamic link to trader page
        }))} 
      />
    </div>
  );
};

export default HoldingsPage;

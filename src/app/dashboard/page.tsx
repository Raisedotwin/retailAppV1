"use client";

import React, { useEffect, useState, useMemo, useCallback  } from 'react';
import { useAccount } from '../context/AccountContext';
import { ethers } from 'ethers';
import { EIP155_CHAINS, TEIP155Chain } from '@/data/EIP155Data';
import { usePrivy } from '@privy-io/react-auth'; // Import usePrivy hook

interface Position {
  token: string;
  amount: string;
}

const DashboardPage: React.FC = () => {
  const { account } = useAccount();
  const [switchAddress, setSwitchAddress] = useState('');
  const [spendAmount, setSpendAmount] = useState('20%');
  const [supply, setSupply] = useState('0');  
  const [marketC, setMarketC] = useState('0');
  const [holders, setHolders] = useState('0');
  const [profileExists, setProfileExists] = useState(false);
  const { user } = usePrivy(); // Use the usePrivy hoo

  const nativeAddress = user?.wallet?.address; //right now supply isd not showing because this is not a connected address

  const [balance, setBalance] = useState('0');

  let rpcURL = EIP155_CHAINS["eip155:8453"].rpc;

  const provider = useMemo(() => new ethers.JsonRpcProvider(rpcURL), [rpcURL]);

  const tokenContractAddr = '0x78Ce14DAA797D49fDD42025243c3B8d79110BF8C';
  const tokenMarketABI = require("../abi/tokenMarket");

  const tokenPoolABI = require("../abi/traderPool");

  const profileAddr = '0x80B2FAA3D1FBD00e88941D76866420198B693329';
  const profileABI = require("../abi/profile");

  const profileContract = useMemo(() => new ethers.Contract(profileAddr, profileABI, provider), [profileAddr, profileABI, provider]);
  const tokenMarket = useMemo(() => new ethers.Contract(tokenContractAddr, tokenMarketABI, provider), [tokenContractAddr, tokenMarketABI, provider]);

  const fetchProfile = useCallback(async () => {
    try {
      let username = user?.twitter?.username;
      if (username) {
        const profile = await profileContract.getProfileByName(username);
        if (profile) {
          setProfileExists(true);
          return profile;
        } else {
          setProfileExists(false);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileExists(false);
    }
  }, [profileContract, user?.twitter?.username]);

  useEffect(() => {
    const initContract = async () => {
      try {
        let profile = await fetchProfile();

          if (profile && profile.length > 5) {
            const traderPoolAddr = profile[5];
            console.log(traderPoolAddr);

            const traderAcc = profile[1];
            console.log("trader account", traderAcc.toString());

            const MCAP = await tokenMarket.getMarketCap(traderAcc);
            const MCAPFormat = ethers.formatEther(MCAP);
            console.log("market cap", MCAPFormat.toString());
            setMarketC(MCAPFormat.toString());

            const holders = await tokenMarket.holders(nativeAddress);
            console.log("holders", holders.toString());
            setHolders(holders.toString());

            if (traderPoolAddr) {
              const traderPoolInstance = new ethers.Contract(traderPoolAddr, tokenPoolABI, provider);
              const balance = await traderPoolInstance.getTotal();
              setBalance(ethers.formatEther(balance));
              console.log(balance);

              const tokenSupply = await tokenMarket.sharesSupply(nativeAddress);
              console.log("tokenSupply", tokenSupply.toString());
              setSupply(tokenSupply.toString());

            }
          } else {
            console.log('Profile does not contain sufficient data.');
          }

          console.log(user);
    
      } catch (error) {
        console.error('Error initializing contract:', error);
      }
    };

    initContract();
  }, [
    user,
    tokenPoolABI
  ]);
  
  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl w-full mx-auto p-6 bg-gray-900 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 md:mb-0">Dashboard:</h2>
        </div>
 

        {/* Tokenomics Section */}
        <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">Tokenomics</h3>
          <div className="text-gray-400">
            <p className="mb-2"><strong>Supply:</strong> {supply}</p>
            <p className="mb-2"><strong>Holders:</strong> {holders}</p>
            <p className="mb-2"><strong>Market Cap:</strong> {marketC}</p>
          </div>
        </div>

        {/* Update Wallet Section */}
        <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">Raise Wallet Settings <span className="text-purple-300">(Coming Soon)</span></h3>
          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2">Switch Address</label>
            <div className="flex">
              <input
                type="text"
                value={switchAddress}
                onChange={(e) => setSwitchAddress(e.target.value)}
                placeholder="Enter new wallet address"
                className="bg-gray-800 border border-gray-700 text-white p-3 w-full rounded-l focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled // Disable input field
              />
              <button
                type="button"
                className="bg-gradient-to-r from-gray-500 to-gray-700 text-white px-4 py-3 rounded-r shadow-lg cursor-not-allowed"
                disabled // Disable button
              >
                Switch
              </button>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2">Automatic Spend Amount</label>
            <div className="flex">
              <select
                value={spendAmount}
                onChange={(e) => setSpendAmount(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white p-3 w-full rounded-l focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled // Disable select input
              >
                <option value="20%">20%</option>
                <option value="40%">40%</option>
                <option value="60%">60%</option>
                <option value="90%">90%</option>
              </select>
              <button
                type="button"
                className="bg-gradient-to-r from-gray-500 to-gray-700 text-white px-4 py-3 rounded-r shadow-lg cursor-not-allowed"
                disabled // Disable button
              >
                Set
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

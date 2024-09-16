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
  const [profile, setProfile] = useState<any>(null); // State for the profile

  const rpcURL = EIP155_CHAINS["eip155:8453"].rpc;
  const provider = useMemo(() => new ethers.JsonRpcProvider(rpcURL), [rpcURL]);

  const profileAddr = '0x1dF214861B5A87F3751D1442ec7802d01c07072E';
  const profileABI = require("../abi/profile");
  const profileContract = useMemo(() => new ethers.Contract(profileAddr, profileABI, provider), [profileAddr, profileABI, provider]);

  const tokenPoolABI = require("../abi/traderPool");

  const fetchProfile = useCallback(async () => {
    try {
      let username = user?.twitter?.username;
      if (username) {
        const profile = await profileContract.getProfileByName(username);
        setProfile(profile); // Set the profile state
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
              setEthBalance(ethers.formatEther(balance)); // Set the balance
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

        {/* Conditionally render the forms based on the active tab */}
        {activeTab === 'followSwaps' && <FollowSwapsForm />}
        {activeTab === 'swapDirect' && <SwapForm balance={ethBalance} profile={profile} />} {/* Pass balance and profile */}
      </div>
      {/* Modal for Processing */}
      {!loggedInToX && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-md flex flex-col items-center w-1/5 h-1/3.5 max-w-1xl max-h- 1xl">
            <Image src="/icons/logo.png" alt="Twitter Icon" width={120} height={120} />
            <br />
            <p className="mb-2 text-gray-700 font-semibold" >Please Authenticate With X To View Wallet</p>
              <div className="mt-4">
              </div>
           
          </div>
        </div>
      )}

  {!loggedIntoWallet && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-md flex flex-col items-center w-1/5 h-1/3.5 max-w-1xl max-h- 1xl">
            <Image src="/icons/logo.png" alt="Twitter Icon" width={120} height={120} />
            <br />
            <p className="mb-2 text-gray-700 font-semibold" >Please Create A Wallet With This Address</p>
              <div className="mt-4">
              </div>
           
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapsPage;

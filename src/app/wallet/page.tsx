"use client";

import React, { use } from 'react';
import Link from 'next/link';
import { useAccount } from '../context/AccountContext';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { getEmbeddedConnectedWallet, usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import Image from 'next/image';
import { EIP155_CHAINS, TEIP155Chain } from '@/data/EIP155Data';

const WalletPage: React.FC = () => {
  const [profileExists, setProfileExists] = useState(false);
  const [ethBalance, setEthBalance] = useState('0.00');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [loggedInToX, setLoggedIntoX] = useState(false);
  const [isProfileAssociated, setIsProfileAssociated] = useState(false);
  const [profileAddress, setProfileAddress] = useState('');
  const [claimableBalance, setClaimableBalance] = useState('0.00');
  const [isWhitelistEnabled, setIsWhitelistEnabled] = useState(false); // New state for whitelist toggle


  let rpcURL = EIP155_CHAINS["eip155:8453"].rpc;

  const provider = useMemo(() => new ethers.JsonRpcProvider(rpcURL), [rpcURL]);

  const { login, logout, user } = usePrivy();

  const { wallets } = useWallets();

  const wallet = getEmbeddedConnectedWallet(wallets);

  const nativeAddress = user?.wallet?.address;

  

  const tokenPoolABI = require("../abi/traderPool");
  const traderPayoutsABI = require("../abi/traderPayouts");

  const profileAddr = '0x0106381DaDbcc6b862B4cecdD253fD0E3626738E';
  const profileABI = require("../abi/profile");

  const whitelist = require("../abi/BETAWhitelist.json");
  const whitelistAddr = '0x36dc0FE2E558E0d7a5505CE717bc01470D52C353';

  const profileContract = useMemo(() => new ethers.Contract(profileAddr, profileABI, provider), [profileAddr, profileABI, provider]);
  const whitelistContract = useMemo(() => new ethers.Contract(whitelistAddr, whitelist, provider), [whitelistAddr, whitelist, provider]);

  const [showSwitchAddressModal, setShowSwitchAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);

    // Create a wallet instance from the private key
  const adminWallet = useMemo(() => {
      if (typeof process !== 'undefined' && process.env.PRIVATE_KEY) {
        return new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      }
      return null;
  }, [provider]);

  const checkWhitelistStatus = async (address: string | undefined): Promise<boolean> => {
    try {
      const isWhitelisted = await whitelistContract.isWhitelisted(address);
      return isWhitelisted;
    } catch (error) {
      console.error('Error checking whitelist status:', error);
      return false;
    }
  };

  const getPrivyProvider = async (chainName: string) => {
    if (!wallet) {
      console.error("Wallet not initialized");
      return null;
    }

    let chainId: number;

    switch (chainName.toLowerCase()) {
      case "avax":
        chainId = 43114;
        break;
      case "base":
        chainId = 8453;
        break;
      default:
        console.error("Unsupported chain name");
        return null;
    }

    try {
      await wallet.switchChain(chainId);
      return await wallet.getEthersProvider();
    } catch (error) {
      console.error("Failed to switch chain or get provider:", error);
      return null;
    }
  };

  // Add helper function for number formatting
const formatEthValue = (value: string) => {
  const num = parseFloat(value);
  if (num === 0) return "0.00";
  return num.toFixed(6);
};

  const checkProfileAssociation = useCallback(async () => {
    if (!nativeAddress || !profileContract) return false;
    try {
      const isAssociated = await profileContract.isProfileAssociated(nativeAddress);
      setIsProfileAssociated(isAssociated);
      return isAssociated;
    } catch (error) {
      console.error('Error checking profile association:', error);
      setIsProfileAssociated(false);
      return false;
    }
  }, [nativeAddress, profileContract]);

  const handleWalletClaim = async () => {
    if (profileAddr && wallet) {
      if (isWhitelistEnabled) {
        const isWhitelisted = await checkWhitelistStatus(nativeAddress);
        if (!isWhitelisted) {
          setIsModalVisible(true);
          setModalMessage('Address not whitelisted. Please contact support.');
          setTimeout(() => setIsModalVisible(false), 2000);
          return;
        }
      }

      setModalMessage('Claiming wallet...');
      setIsModalVisible(true);
      try {
        getPrivyProvider("base");
        const privyProvider = await wallet.getEthersProvider();
        const signer: any = privyProvider?.getSigner();

        const profileContractTwo = new ethers.Contract(profileAddr, profileABI, signer);

        let username = user?.twitter?.username;
        let profile = await profileContractTwo.getProfileByName(username);
        let payouts = profile[6];

        if (profile[2] === username) {
          await profileContractTwo.claimProfile(nativeAddress, username, true);
        } else {
          alert('Incorrect Twitter AUTH');
          return;
        }

        if (payouts !== "0x0000000000000000000000000000000000000000") {
          const traderPayoutsInstance = new ethers.Contract(payouts, traderPayoutsABI, signer);

          const ethBalance = await provider.getBalance(payouts);
          console.log('ETH Balance:', ethers.formatEther(ethBalance));
          const amountMsg = ethBalance.toString();

          const tx = await traderPayoutsInstance.withdraw();
          await tx.wait();

          setModalMessage('Congratulations! You have successfully earned ' + amountMsg);
          await new Promise((resolve) => setTimeout(resolve, 500));
          setIsModalVisible(false);
        }
      } catch (error) {
        console.error('Error claiming wallet:', error);
        setModalMessage('Wallet Claim Failed');
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsModalVisible(false);
      }
    }
  };

  // Add new function to fetch claimable balance
const fetchClaimableBalance = useCallback(async (username: string) => {
  if (!username || !profileContract) return;
  
  try {
    const profile = await profileContract.getProfileByName(username);
    const payoutsAddress = profile[6];
    
    if (payoutsAddress && payoutsAddress !== "0x0000000000000000000000000000000000000000") {
      const balance = await provider.getBalance(payoutsAddress);
      setClaimableBalance(ethers.formatEther(balance));
    } else {
      setClaimableBalance('0.00');
    }
  } catch (error) {
    console.error('Error fetching claimable balance:', error);
    setClaimableBalance('0.00');
  }
}, [profileContract, provider]);

  // New function to fetch profile by username
  const fetchProfileByUsername = useCallback(async (username: string) => {
    try {
      if (username) {
        const profile = await profileContract.getProfileByName(username);
        if (profile) {
          setProfileExists(true);
          return profile;
        }
      }
      setProfileExists(false);
      return null;
    } catch (error) {
      console.error('Error fetching profile by username:', error);
      setProfileExists(false);
      return null;
    }
  }, [profileContract]);

  // New function to fetch profile by address
  const fetchProfileByAddress = useCallback(async (address: string) => {
    try {
      if (address && ethers.isAddress(address)) {
        const profile = await profileContract.getProfile(address); 
        if (profile) {
          setProfileExists(true);
          return profile;
        }
      }
      setProfileExists(false);
      return null;
    } catch (error) {
      console.error('Error fetching profile by address:', error);
      setProfileExists(false);
      return null;
    }
  }, [profileContract]);

  const fetchBalanceFromProfile = async (profile: any) => {
    if (profile && profile.length > 5) {
      const traderPoolAddr = profile[5];
      setProfileAddress(traderPoolAddr);
      if (traderPoolAddr) {
        const traderPoolInstance = new ethers.Contract(traderPoolAddr, tokenPoolABI, provider);
        const balance = await traderPoolInstance.getTotal();
        setEthBalance(ethers.formatEther(balance));
      }
    }
  };

  const loginWithPrivy = async () => {
    try {
      await login();
      console.log('Logged in with Privy:', user);
    } catch (error) {
      console.error('Error logging in with Privy:', error);
    }
  };

  const executeAdminFunction = async () => {
    if (!adminWallet) {
      console.error("Admin wallet not initialized");
      return;
    }

    try {
      // Example transaction
      const tx = await profileContract.someAdminFunction();
      await tx.wait();
      console.log("Transaction successful");
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  useEffect(() => {
    const initContract = async () => {
      try {
        const isAssociated = await checkProfileAssociation();
        
        // Try fetching by username first if available
        let profile = null;
        if (user?.twitter?.username) {
          profile = await fetchProfileByUsername(user.twitter.username);
          await fetchClaimableBalance(user.twitter.username);
        }
        
        // If no profile found by username and we have an address, try fetching by address
        if (!profile && nativeAddress) {
          profile = await fetchProfileByAddress(nativeAddress);
        }

        if (profile) {
          await fetchBalanceFromProfile(profile);
        }
      } catch (error) {
        console.error('Error initializing contract:', error);
      }
    };

    initContract();
  }, [user, nativeAddress, fetchProfileByUsername, fetchProfileByAddress, checkProfileAssociation, fetchClaimableBalance]);

  const handleSwitchAddress = async () => {
    if (!ethers.isAddress(newAddress)) {
      alert('Please enter a valid Ethereum address');
      return;
    }

    setIsSwitching(true);
    setModalMessage('Switching address...');
    setIsModalVisible(true);

    try {
      await getPrivyProvider("base");
      const privyProvider = await wallet?.getEthersProvider();
      const signer: any = privyProvider?.getSigner();

      const profileContractWithSigner = new ethers.Contract(profileAddr, profileABI, signer);

      const tx = await profileContractWithSigner.updateUserAddress(newAddress);
      await tx.wait();

      setModalMessage('Address switched successfully');
      setTimeout(() => {
        setIsModalVisible(false);
        setShowSwitchAddressModal(false);
        setNewAddress('');
      }, 2000);
    } catch (error) {
      console.error('Error switching address:', error);
      setModalMessage('Failed to switch address. Please ensure you own this profile.');
      setTimeout(() => {
        setIsModalVisible(false);
      }, 2000);
    }
    setIsSwitching(false);
  };

  // Add whitelist toggle to the admin section (if needed)
  const toggleWhitelist = () => {
      setIsWhitelistEnabled(!isWhitelistEnabled);
  };
  
  return (
    <div className="min-h-screen bg-black flex flex-col p-6">
      {!isProfileAssociated && !user?.twitter?.username ? (
        <div className="max-w-3xl w-full mx-auto p-8 bg-gray-900 rounded-lg shadow-lg flex flex-col items-center">
          <div className="bg-white/10 p-4 rounded-full mb-6">
            <Image src="/icons/logo.png" alt="Wallet" width={80} height={80} className="rounded-full" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-6">Connect Twitter or Wallet To View</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={loginWithPrivy}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition duration-300"
            >
              Connect with X
            </button>
            {!nativeAddress && (
              <button
                onClick={loginWithPrivy}
                className="px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-lg hover:from-green-500 hover:to-blue-600 transition duration-300"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-3xl w-full mx-auto p-8 bg-gray-900 rounded-lg shadow-lg flex flex-col">
          <div>
<div className="flex flex-col md:flex-row justify-between items-center mb-8">
  <div className="flex items-center space-x-4">
    <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">Raise Wallet:</h2>
    {profileExists && (
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={handleWalletClaim}
          className="px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-lg hover:from-green-500 hover:to-blue-600 transition duration-300"
        >
          Claim
        </button>
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-blue-400">Claimable</span>
          <div className="bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              {formatEthValue(claimableBalance)} ETH
            </span>
          </div>
        </div>
      </div>
    )}
  </div>
  <div>
    <button
      onClick={() => setShowSwitchAddressModal(true)}
      className="px-4 py-2 bg-gradient-to-r from-orange-400 to-purple-500 text-white rounded-lg shadow-lg hover:from-orange-500 hover:to-purple-600 transition duration-300"
    >
      Switch Address
    </button>
  </div>
</div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-white">Connected Address:</h3>
                {nativeAddress && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isProfileAssociated 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {isProfileAssociated ? 'Linked to Raise' : 'Not Linked to Raise'}
                  </span>
                )}
                
              </div>
              
              <p className="text-gray-400 break-words">{nativeAddress || 'No Address Connected'}</p>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-white mb-2">Raise Wallet:</h3>
                <p className="text-gray-400 break-words">
                  {profileAddress || 'No Raise Wallet Connected'}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Available Balance</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                  {ethBalance} ETH
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
              How To Use Your Raise Wallet
            </h2>
            <div className="relative w-full aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-xl">
              <video 
                controls 
                className="w-full h-full object-cover"
                poster="/api/placeholder/400/320"
              >
                <source src="/path-to-your-wallet-guide-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}

      {isModalVisible && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-white/10 flex flex-col items-center max-w-md w-full mx-4">
            <div className="bg-white/10 p-4 rounded-full mb-6">
              <Image src="/icons/waitlogo.png" alt="Processing" width={80} height={80} className="rounded-full" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Processing</h3>
            <p className="text-gray-300 text-center mb-6">
              {modalMessage}
            </p>
            <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>
        </div>
      )}

      {showSwitchAddressModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-white/10 flex flex-col items-center max-w-md w-full mx-4">
            <div className="bg-white/10 p-4 rounded-full mb-6">
              <Image src="/icons/logo.png" alt="Switch Address" width={80} height={80} className="rounded-full" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Switch Address</h3>
            <div className="w-full mb-6">
              <input
                type="text"
                placeholder="Enter new Ethereum address"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6"></div>
            <div className="flex space-x-4 w-full">
              <button 
                onClick={() => setShowSwitchAddressModal(false)}
                className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleSwitchAddress}
                disabled={isSwitching || !newAddress}
                className={`w-full py-3 ${
                  isSwitching || !newAddress 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white rounded-lg font-medium transition-all duration-200`}
              >
                {isSwitching ? 'Switching...' : 'Switch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WalletPage;
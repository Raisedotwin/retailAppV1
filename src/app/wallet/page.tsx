"use client";

import React, { use } from 'react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { getEmbeddedConnectedWallet, usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import Image from 'next/image';
import { EIP155_CHAINS } from '@/data/EIP155Data';
import TradingFeesManagement from '../componants/TradingFeesManagement';

const WalletPage: React.FC = () => {
  const [profileExists, setProfileExists] = useState(false);
  const [ethBalance, setEthBalance] = useState('0.00');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isProfileAssociated, setIsProfileAssociated] = useState(false);
  const [profileAddress, setProfileAddress] = useState('');
  const [claimableBalance, setClaimableBalance] = useState('0.00');
  const [isWhitelistEnabled, setIsWhitelistEnabled] = useState(true);
  const [payoutsAddress, setPayoutsAddress] = useState('');
  const [name, setName] = useState('');

  // New store management state
  const [activeTab, setActiveTab] = useState('wallet');
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    images: []
  });


  // Orders management state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  let rpcURL = EIP155_CHAINS["eip155:84532"].rpc;

  const provider = useMemo(() => new ethers.JsonRpcProvider(rpcURL), [rpcURL]);

  const { login, logout, user } = usePrivy();

  const { wallets } = useWallets();
  let wallet = wallets[0];

  // Add new function to get the appropriate wallet
  const getWallet = useCallback(async () => {
    if (user?.twitter?.username) {
      const embeddedWallet = getEmbeddedConnectedWallet(wallets);
      const privyProvider = await embeddedWallet?.address;
      return wallets.find(w => w.address === privyProvider) || wallet;
    }
    return wallet;
  }, [user, wallets, wallet]);

  // Update getSigner function
  const getSigner = async () => {
    const currentWallet = await getWallet();
    if (!currentWallet) throw new Error("No wallet available");
    
    try {
      await currentWallet.switchChain(8453);
      const provider = await currentWallet.getEthersProvider();
      return provider.getSigner();
    } catch (error) {
      console.error("Failed to get signer:", error);
      throw error;
    }
  };

  const nativeAddress = user?.wallet?.address;

  const tokenPoolABI = require("../abi/traderPool");
  const storePayoutsABI = require("../abi/traderPayouts");

  const profileAddr = '0x006208E5BDAF546245Ae5A9eece0f4B30a466241';
  const profileABI = require("../abi/profile");

  const whitelist = require("../abi/BETAWhitelist.json");
  const whitelistAddr = '0x0735b6E3b28A32423B6BaED39381866fDA5E6786';

  const ordersAddr = "0x8fD29d66c4819BBf4884C8F93Ce0d9655145Ea91";
  const ordersABI = require("../abi/orders");

  const marketData = "0x21A3b74c864C3157A37Eb18ECEB7B377358A4F58";
  const marketDataABI = require("../abi/marketData");

  const profileContract = useMemo(() => new ethers.Contract(profileAddr, profileABI, provider), [profileAddr, profileABI, provider]);
  const whitelistContract = useMemo(() => new ethers.Contract(whitelistAddr, whitelist, provider), [whitelistAddr, whitelist, provider]);

  const [showSwitchAddressModal, setShowSwitchAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);

  // Create a wallet instance from the private key
  const adminWallet = useMemo(() => {
        return new ethers.Wallet('cac636e07dd1ec983b66c5693b97ac5150d9a0cc5db8dd39ddb58b2e142cb192', provider);
  }, [provider]);

  // Dummy orders data
  const [orders] = useState([
    { 
      id: '1', 
      tokenId: '2458', 
      collection: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
      collectionName: 'Azuki',
      price: '0.45 ETH',
      buyer: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
      status: 'Pending',
      date: '2025-03-01'
    },
    { 
      id: '2', 
      tokenId: '1867', 
      collection: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
      collectionName: 'BAYC',
      price: '2.1 ETH',
      buyer: '0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199',
      status: 'Pending',
      date: '2025-03-02'
    },
    { 
      id: '3', 
      tokenId: '9532', 
      collection: '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB',
      collectionName: 'CryptoPunks',
      price: '5.8 ETH',
      buyer: '0x1cbd3b2770909d4e10f157cabc84c7264073c9ec',
      status: 'Pending',
      date: '2025-03-04'
    }
  ]);

  const handleWithdrawRewards = async () => {
    if (!wallet) {
      console.error("Wallet not available");
      return;
    }

    setModalMessage('Processing withdrawal...');
    setIsModalVisible(true);

    try {
      const signer: any = await getSigner();
      const currentWallet = await getWallet();
      const walletAddress = currentWallet?.address || user?.wallet?.address;

      const profile = await profileContract.getProfile(walletAddress);
      const payoutsAddress = profile[5];
      console.log('Payouts Address:', payoutsAddress);

      setPayoutsAddress(payoutsAddress);

      if (payoutsAddress && payoutsAddress !== "0x0000000000000000000000000000000000000000") {
        const traderPayoutsInstance = new ethers.Contract(payoutsAddress, storePayoutsABI, signer);
        const tx = await traderPayoutsInstance.withdraw();
        //await tx.wait();

        setModalMessage('Rewards successfully withdrawn!');
        setClaimableBalance('0.00');
      } else {
        setModalMessage('No rewards contract found');
      }

      setTimeout(() => setIsModalVisible(false), 2000);
    } catch (error) {
      console.error('Error withdrawing rewards:', error);
      //setModalMessage('Failed to withdraw rewards');
      setTimeout(() => setIsModalVisible(false), 2000);
    }
  };

  const checkWhitelistStatus = async (username: string | undefined): Promise<boolean> => {
    try {
      const isWhitelisted = await whitelistContract.isUsernameWhitelisted(username);
      return isWhitelisted;
    } catch (error) {
      console.error('Error checking whitelist status:', error);
      return false;
    }
  };

  // Add the approval function before wallet claim
  const approveAddressForClaim = async (addressToApprove: string) => {
  if (!adminWallet) {
    console.error("Admin wallet not initialized");
    return false;
  }

  try {
    // Create contract instance with admin wallet as signer
    const profileContractWithAdmin = new ethers.Contract(profileAddr, profileABI, adminWallet);
    const tx = await profileContractWithAdmin.approveAddressForClaim(addressToApprove);
    //await tx.wait();
    console.log("Address approved successfully");
    return true;
  } catch (error) {
    console.error("Error approving address:", error);
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
      console.log('Profile check results:', isAssociated);
      return isAssociated;
    } catch (error) {
      console.error('Error checking profile association:', error);
      setIsProfileAssociated(false);
      return false;
    }
  }, [nativeAddress, profileContract]);

  const handleWalletClaim = async () => {
    if (!profileAddr || !wallet) {
      console.error("Missing required parameters");
      return;
    }

    if (isWhitelistEnabled && user?.twitter?.username) {
      const userprofile = user.twitter.username;
      console.log('Checking whitelist status for:', userprofile);
      const isWhitelisted = await checkWhitelistStatus(userprofile);
      if (!isWhitelisted) {
        setIsModalVisible(true);
        setModalMessage('Address not whitelisted. Please contact support.');
        setTimeout(() => setIsModalVisible(false), 2000);
        return;
      }
    }

    setModalMessage('Approving address...');
    setIsModalVisible(true);

    try {
      const currentWallet = await getWallet();
      const walletAddress: any = currentWallet?.address || user?.wallet?.address;

      // First, approve the address
      const isApproved = await approveAddressForClaim(walletAddress);
      if (!isApproved) {
        setModalMessage('Address approval failed');
        setTimeout(() => setIsModalVisible(false), 2000);
        return;
      }

      setModalMessage('Address approved. Claiming wallet...');

      const signer: any = await getSigner();
      const profileContractTwo = new ethers.Contract(profileAddr, profileABI, signer);

      let username = user?.twitter?.username;
      let profile = username ? await profileContractTwo.getProfileByName(username) : null;
      
      if (profile && profile[2] === username) {
        await profileContractTwo.claimProfile(username, true);
      } else {
        // Handle non-Twitter users or invalid profiles
        setModalMessage('Unable to claim profile. Please check requirements.');
        setTimeout(() => 
          setIsModalVisible(false),
        2000);
        return;
      }

      let payouts = profile[6];
      if (payouts !== "0x0000000000000000000000000000000000000000") {
        const traderPayoutsInstance = new ethers.Contract(payouts, storePayoutsABI, signer);
        const ethBalance = await provider.getBalance(payouts);
        const formattedBalance = ethers.formatEther(ethBalance);
        const amountMsg = formattedBalance.toString();

        const tx = await traderPayoutsInstance.withdraw();
        //await tx.wait();

        setModalMessage('Congratulations! You have successfully earned ' + amountMsg);
        setTimeout(() => {
          setIsModalVisible(false),
          window.location.reload();
        },
        2000);
        return;
      } else {
        setModalMessage('Wallet claimed successfully!');
        setTimeout(() => {
          setIsModalVisible(false),
          window.location.reload();
        }, 2000);
      }
      
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsModalVisible(false);
      
    } catch (error) {
      console.error('Error in wallet claim process:', error);
      //setModalMessage('Error processing claim. Please try again.');
      setTimeout(() => 
        setIsModalVisible(false),
        2000);
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

  useEffect(() => {
    const initContract = async () => {
      try {
        const currentWallet = await getWallet();
        const walletAddress = currentWallet?.address || user?.wallet?.address;
        
        if (walletAddress) {
          
          // Try fetching by username first if available
          let profile = null;
          if (user?.twitter?.username) {
            profile = await fetchProfileByUsername(user.twitter.username);
            console.log('Profile fetched by username:', profile);
          }
          
          // If no profile found by username and we have an address, try fetching by address
          if (!profile) {
            profile = await fetchProfileByAddress(walletAddress.toString());
            console.log('Profile fetched by address:', profile);
          }

          if (profile) {
            let storeName = profile[2];
            setName(storeName);
            if(storeName) {
              setProfileExists(true);
            }
            console.log('Profile found:', storeName);
            let payouts = profile[5];
            console.log('Payouts Address:', payouts);
            setPayoutsAddress(payouts);
          }
        }
      } catch (error) {
        console.error('Error initializing contract:', error);
      }
    };

    initContract();
  }, [user, wallet, getWallet, fetchProfileByUsername, fetchProfileByAddress, checkProfileAssociation, fetchClaimableBalance]);

  const handleSwitchAddress = async () => {
    if (!ethers.isAddress(newAddress)) {
      alert('Please enter a valid Ethereum address');
      return;
    }

    setIsSwitching(true);
    setModalMessage('Switching address...');
    setIsModalVisible(true);

    try {
      const signer:any = await getSigner();
      const profileContractWithSigner = new ethers.Contract(profileAddr, profileABI, signer);

      const tx = await profileContractWithSigner.updateUserAddress(newAddress);
      //await tx.wait();

      setModalMessage('Address switched successfully');
      setTimeout(() => {
        setIsModalVisible(false);
        setShowSwitchAddressModal(false);
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error switching address:', error);
      setModalMessage('Failed to switch address. Please ensure you own this profile.');
      setTimeout(() => {
        setIsModalVisible(false);
        //window.location.reload();
      }, 2000);
    }
    //setIsSwitching(false);
  };

  // Handler for viewing order details
  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsOrderModalVisible(true);
  };

  // Handler for fulfilling order
  const handleFulfillOrder = () => {
    if (!trackingNumber.trim()) {
      alert('Please enter a tracking number');
      return;
    }

    setModalMessage('Processing order fulfillment...');
    setIsModalVisible(true);

    // Simulate order fulfillment
    setTimeout(() => {
      setModalMessage('Order fulfilled successfully!');
      setTimeout(() => {
        setIsModalVisible(false);
        setIsOrderModalVisible(false);
        setTrackingNumber('');
        // In a real app, you would update the order status in your state here
      }, 1500);
    }, 1500);
  };

  const MyCurvesContent = () => (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-6">Collect Proceeds From Sales</h2>
      <div className="space-y-4">
        {[
          { address: '0x1234567890abcdef1234567890abcdef12345678', name: 'Cool Clothing' },
          { address: '0xabcdef1234567890abcdef1234567890abcdef12', name: 'Premium Accessories' },
          { address: '0x7890abcdef1234567890abcdef1234567890abcd', name: 'Limited Edition Sneakers' },
          { address: '0xdef1234567890abcdef1234567890abcdef12345', name: 'Vintage Collection' }
        ].map((curve) => (
          <div key={curve.address} className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <a href="#" className="block">
              <h3 className="text-lg font-medium text-white mb-2">{curve.name}</h3>
              <p className="text-gray-400 font-mono text-sm break-all">{curve.address}</p>
            </a>
          </div>
        ))}
      </div>
    </div>
  );

  const OrdersContent = () => (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-6">Orders</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div 
            key={order.id} 
            className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
            onClick={() => handleViewOrder(order)}
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h3 className="text-lg font-medium text-white mb-1">{order.collectionName} #{order.tokenId}</h3>
                <p className="text-gray-400 font-mono text-xs mb-2 break-all">{order.collection}</p>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">Price: <span className="text-blue-400">{order.price}</span></span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-300">Date: {order.date}</span>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                  {order.status}
                </span>
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-400">No orders to display</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col p-6">
     
        <div className="max-w-6xl w-full mx-auto">
          {/* Tab Navigation - Updated to replace Earnings with Trading Fees */}
          <div className="flex space-x-2 mb-6 overflow-x-auto">
            {['wallet', 'trading-fees', 'redemptions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
            {/* Only keeping the orange Orders tab */}
            <div className="relative">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-3 ${
                  activeTab === 'orders'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600'
                    : 'bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700'
                } text-white rounded-lg shadow-lg transition duration-300 flex items-center space-x-2`}
              >
                <span>Orders</span>
                <div className="absolute -top-0 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {orders.length}
                </div>
              </button>
            </div>
          </div>
  
          {/* Tab Content */}
          <div className="bg-gray-900 rounded-lg shadow-lg">
            {activeTab === 'wallet' && (
              <div className="p-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                  {/* Existing wallet content */}
                  <div className="flex items-center space-x-4">
                    <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">Dashboard Panel:</h2>
                  
                  </div>
                </div>
  
                {/* Rest of the wallet content */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">Connected Address:</h3>
                    {nativeAddress && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        profileExists
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {profileExists ? `Linked to ${name}` : 'Not Linked to a store'}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-400 break-words">{nativeAddress || 'No Address Connected'}</p>
        
                </div>
  
                <div>
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
                    How To Use The Seller Dashboard
                  </h2>
                  <div className="relative w-full aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-xl">
                    <iframe 
                      className="absolute top-0 left-0 w-full h-full"
                      src="https://www.youtube.com/embed/tJAeaTa1O3Q?si=frBVOd42kLHOEKSJ"
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                </div>
                </div>
            )}
            
            {activeTab === 'orders' && <OrdersContent />}
            
            {/* Replacing Earnings with Trading Fees component */}
            {activeTab === 'trading-fees' && (
              <div className="p-8">
                <TradingFeesManagement />
              </div>
            )}
            
            {activeTab === 'redemptions' && <MyCurvesContent />}
          </div>
        </div>
  
  
      {/* Modals */}
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
  
      {/* Switch Address Modal */}
      {showSwitchAddressModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-white/10 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Switch Address</h3>
              <button 
                onClick={() => setShowSwitchAddressModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-300 text-sm mb-2">New Address</label>
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Enter new Ethereum address"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            
            <button
              onClick={handleSwitchAddress}
              disabled={isSwitching}
              className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                isSwitching
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
              } text-white`}
            >
              {isSwitching ? 'Processing...' : 'Switch Address'}
            </button>
          </div>
        </div>
      )}
      
      {/* Order Details Modal */}
      {isOrderModalVisible && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-white/10 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Order Details</h3>
              <button 
                onClick={() => {
                  setIsOrderModalVisible(false);
                  setSelectedOrder(null);
                  setTrackingNumber('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-gray-400 text-sm">Collection</h4>
                <p className="text-white font-medium">{selectedOrder}</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">Token ID</h4>
                <p className="text-white font-medium">#{selectedOrder}</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">Collection Address</h4>
                <p className="text-gray-300 font-mono text-xs break-all">{selectedOrder}</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">Buyer</h4>
                <p className="text-gray-300 font-mono text-xs break-all">{selectedOrder}</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">Price</h4>
                <p className="text-blue-400 font-medium">{selectedOrder}</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">Date</h4>
                <p className="text-white">{selectedOrder}</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">Status</h4>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                  {selectedOrder}
                </span>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-700">
              <h4 className="text-lg font-medium text-white mb-3">Fulfill Order</h4>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              
              <button
                onClick={handleFulfillOrder}
                disabled={!trackingNumber.trim()}
                className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                  !trackingNumber.trim()
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700'
                } text-white`}
              >
                Fulfill Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WalletPage;
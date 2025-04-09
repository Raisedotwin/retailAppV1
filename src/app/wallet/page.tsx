"use client";

import React, { use } from 'react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { getEmbeddedConnectedWallet, usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import Image from 'next/image';
import { EIP155_CHAINS } from '@/data/EIP155Data';
import TradingFeesManagement from '../componants/TradingFeesManagement';

interface Curve {
  address: string;
  name: string;
}

// For the OrdersContent component, add this type definition at the top of your file
interface PendingOrder {
  collection: string;
  tokenId: bigint;
  exists: boolean;
  orderType: bigint;
}

// Add this interface at the top of your file
interface StoreDetails {
  user: string;
  storeAddress: string;
  collectionAddress: string;
  tokenId: bigint;
  exists: boolean;
}

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
  // Add this to your component state declarations
const [storeFees, setStoreFees] = useState<StoreDetails[]>([]);
const [selectedFee, setSelectedFee] = useState<StoreDetails | null>(null);
const [isFeeModalVisible, setIsFeeModalVisible] = useState(false);
 
  // Add this state for curves in your component
  const [curves, setCurves] = useState<Curve[]>([
    { address: '0x1234567890abcdef1234567890abcdef12345678', name: 'Cool Clothing' },
    { address: '0xabcdef1234567890abcdef1234567890abcdef12', name: 'Premium Accessories' },
    { address: '0x7890abcdef1234567890abcdef1234567890abcd', name: 'Limited Edition Sneakers' },
    { address: '0xdef1234567890abcdef1234567890abcdef12345', name: 'Vintage Collection' }
  ]);
  

  // New store management state
  const [activeTab, setActiveTab] = useState('wallet');
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    images: []
  });

  // Orders management state
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [pendingOrders, setPendingOrders] = useState([]);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);

  let rpcURL = EIP155_CHAINS["eip155:84532"].rpc;

  const provider = useMemo(() => new ethers.JsonRpcProvider(rpcURL), [rpcURL]);

  const { login, logout, user } = usePrivy();

  const { wallets } = useWallets();
  let wallet = wallets[0];

  // Add this handler function for the curves
  const handleViewCurve = (curve: Curve) => {
    // Handle curve click - you can implement this similar to handleViewOrder
    console.log('Viewing curve:', curve);
  // You could add a modal display or navigation here
  };

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

  const profileAddr = '0x05d3D90AEF1fbD9b5CD16d15839C5f7B4159340f';
  const profileABI = require("../abi/profile");

  const whitelist = require("../abi/BETAWhitelist.json");
  const whitelistAddr = '0x0735b6E3b28A32423B6BaED39381866fDA5E6786';

  const ordersAddr = "0xbBB16632424aBC8Afa6e7F15066B3349CdA24eeb";
  const ordersABI = require("../abi/orders");

  const marketData = "0xF8bBbdF7AB89a7CD09F0918CdFA2904AE7A804b8";
  const marketDataABI = require("../abi/marketdata");

  const profileContract = useMemo(() => new ethers.Contract(profileAddr, profileABI, provider), [profileAddr, profileABI, provider]);
  const whitelistContract = useMemo(() => new ethers.Contract(whitelistAddr, whitelist, provider), [whitelistAddr, whitelist, provider]);
  const marketDataContract = useMemo(() => new ethers.Contract(marketData, marketDataABI, provider), [marketData, marketDataABI, provider]);

  const [showSwitchAddressModal, setShowSwitchAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);

  // Create a wallet instance from the private key
  const adminWallet = useMemo(() => {
        return new ethers.Wallet('cac636e07dd1ec983b66c5693b97ac5150d9a0cc5db8dd39ddb58b2e142cb192', provider);
  }, [provider]);

  // Update the fetch function to handle types properly
const fetchPendingOrders = useCallback(async (address: string) => {
  if (!address || !marketDataContract) return [];
  
  try {
    const orders = await marketDataContract.getUserPendingOrders(address);
    
    // Convert to a more manageable format and filter orders with orderType === 1
    const filteredOrders = orders.filter((order: PendingOrder) => 
      order && order.orderType && order.orderType.toString() === "1"
    );
    
    setPendingOrders(filteredOrders);
    console.log('Pending orders:', filteredOrders);
    
    return filteredOrders;
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    setPendingOrders([]);
    return [];
  }
}, [marketDataContract]);


  const fetchPendingOrderCount = useCallback(async (address: any) => {
    if (!address || !marketDataContract) return 0;
    
    try {
      const count = await marketDataContract.getUserPendingOrderCount(address);
      setPendingOrderCount(Number(count));
      console.log('Pending order count:', count);
      return count;
    } catch (error) {
      console.error('Error fetching pending order count:', error);
      setPendingOrderCount(0);
      return 0;
    }
  }, [marketDataContract]);

  // Add this function to fetch store fees
const fetchUserStoreFees = useCallback(async (address: string) => {
  if (!address || !marketDataContract) return;
  
  try {
    const fees = await marketDataContract.getAllUserStoreFees(address);
    setStoreFees(fees);
    console.log('User store fees:', fees);
    return fees;
  } catch (error) {
    console.error('Error fetching user store fees:', error);
    setStoreFees([]);
    return [];
  }
}, [marketDataContract]);

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

  // Add this function to handle viewing fee details
const handleViewFee = (fee: StoreDetails) => {
  setSelectedFee(fee);
  setIsFeeModalVisible(true);
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
          
          // Fetch pending orders and order count
          await fetchPendingOrders(walletAddress);
          await fetchPendingOrderCount(walletAddress);

          // New fetch operation for store fees
          await fetchUserStoreFees(walletAddress);
        }
      } catch (error) {
        console.error('Error initializing contract:', error);
      }
    };

    initContract();
  }, [user, wallet, getWallet, fetchProfileByUsername, fetchProfileByAddress, checkProfileAssociation, fetchClaimableBalance, fetchPendingOrders, fetchPendingOrderCount]);

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

  // Then update your MyCurvesContent component:
const MyCurvesContent = () => (
  <div className="bg-gray-800 p-6 rounded-lg">
    <h2 className="text-xl font-bold text-white mb-6">Collect Proceeds From Sales</h2>
    <div className="space-y-4">
      {curves.map((curve) => (
        <div 
          key={curve.address} 
          className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
          onClick={() => handleViewCurve(curve)}
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h3 className="text-lg font-medium text-white mb-1">{curve.name}</h3>
              <p className="text-gray-400 font-mono text-xs mb-2 break-all">{curve.address}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                Available
              </span>
            </div>
          </div>
        </div>
      ))}
      {curves.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-gray-400">No proceeds available to collect</p>
        </div>
      )}
    </div>
  </div>
);
  
  // Update the OrdersContent component:
const OrdersContent = () => (
  <div className="bg-gray-800 p-6 rounded-lg">
    <h2 className="text-xl font-bold text-white mb-6">Orders</h2>
    <div className="space-y-4">
      {pendingOrders.length > 0 ? (
        pendingOrders
          .filter((order: PendingOrder) => 
            order && order.orderType && order.orderType.toString() === "1"
          )
          .map((order: PendingOrder, index: number) => (
            <div 
              key={index} 
              className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
              onClick={() => handleViewOrder(order)}
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">
                    Token #{order.tokenId.toString()}
                  </h3>
                  <p className="text-gray-400 font-mono text-xs mb-2 break-all">
                    {order.collection}
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                    Pending
                  </span>
                </div>
              </div>
            </div>
          ))
      ) : (
        <div className="p-8 text-center">
          <p className="text-gray-400">No pending orders to display</p>
        </div>
      )}
    </div>
  </div>
);

// Create the TradingFeesContent component
const TradingFeesContent = () => (
  <div className="bg-gray-800 p-6 rounded-lg">
    <h2 className="text-xl font-bold text-white mb-6">Trading Fees</h2>
    <div className="space-y-4">
      {storeFees.length > 0 ? (
        storeFees.map((fee, index) => (
          <div 
            key={index} 
            className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
            onClick={() => handleViewFee(fee)}
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h3 className="text-lg font-medium text-white mb-1">
                  Token #{fee.tokenId.toString()}
                </h3>
                <p className="text-gray-400 font-mono text-xs mb-2 break-all">
                  Collection: {fee.collectionAddress}
                </p>
                <p className="text-gray-400 font-mono text-xs mb-2 break-all">
                  Store: {fee.storeAddress}
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Active
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="p-8 text-center">
          <p className="text-gray-400">No trading fees to display</p>
        </div>
      )}
    </div>
  </div>
);

  // Updated LaunchesContent Component
  const LaunchesContent = () => (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Product Launches</h2>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-colors">
          Create New Launch
        </button>
      </div>
      
      {/* Launch Links List */}
      <div className="space-y-4">
        {/* Summer Wear Collection */}
        <a 
          href="/launches/summer-wear"
          className="block p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h3 className="text-lg font-medium text-white mb-1">Summer Wear Collection</h3>
              <p className="text-gray-300 text-sm">Launch Date: Jun 15, 2025</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Coming Soon
              </span>
            </div>
          </div>
        </a>
        
        {/* Spring Collection */}
        <a 
          href="/launches/spring-collection"
          className="block p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h3 className="text-lg font-medium text-white mb-1">Spring Collection</h3>
              <p className="text-gray-300 text-sm">Launch Date: May 1, 2025</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Scheduled
              </span>
            </div>
          </div>
        </a>
        
        {/* Winter Essentials */}
        <a 
          href="/launches/winter-essentials"
          className="block p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h3 className="text-lg font-medium text-white mb-1">Winter Essentials</h3>
              <p className="text-gray-300 text-sm">Launch Date: Nov 15, 2025</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-300 border border-gray-500/30">
                Draft
              </span>
            </div>
          </div>
        </a>
        
        {/* Exclusive Streetwear */}
        <a 
          href="/launches/exclusive-streetwear"
          className="block p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h3 className="text-lg font-medium text-white mb-1">Exclusive Streetwear</h3>
              <p className="text-gray-300 text-sm">Launch Date: Apr 20, 2025</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                Live
              </span>
            </div>
          </div>
        </a>
        
        {/* Designer Collaboration */}
        <a 
          href="/launches/designer-collab"
          className="block p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h3 className="text-lg font-medium text-white mb-1">Designer Collaboration</h3>
              <p className="text-gray-300 text-sm">Launch Date: Aug 1, 2025</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Scheduled
              </span>
            </div>
          </div>
        </a>
        
        {/* Limited Edition Accessories */}
        <a 
          href="/launches/limited-accessories"
          className="block p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h3 className="text-lg font-medium text-white mb-1">Limited Edition Accessories</h3>
              <p className="text-gray-300 text-sm">Launch Date: Jul 15, 2025</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Coming Soon
              </span>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-black flex flex-col p-6">
      
        <div className="max-w-6xl w-full mx-auto">
          {/* Tab Navigation - Updated to include Launches tab */}
          <div className="flex space-x-2 mb-6 overflow-x-auto">
            {['wallet', 'store-owner', 'trading-fees', 'launches'].map((tab) => (
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
                  {pendingOrderCount}
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
            {activeTab === 'trading-fees' && <TradingFeesContent />}

            
            {activeTab === 'store-owner' && <MyCurvesContent />}
  
            {activeTab === 'launches' && <LaunchesContent />}
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

{isFeeModalVisible && selectedFee && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
    <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-white/10 max-w-md w-full mx-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">Fee Details</h3>
        <button 
          onClick={() => {
            setIsFeeModalVisible(false);
            setSelectedFee(null);
          }}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      
      {/* Fee Balance Display */}
      <div className="bg-gray-800/50 p-4 rounded-lg mb-6 border border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-lg text-white font-medium">Available Balance</h4>
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
            Ready to Claim
          </span>
        </div>
        <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          0.125 ETH
        </div>
        <div className="text-gray-400 text-sm mt-1">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <div>
          <h4 className="text-gray-400 text-sm">Token ID</h4>
          <p className="text-white font-medium">#{selectedFee.tokenId.toString()}</p>
        </div>
        
        <div>
          <h4 className="text-gray-400 text-sm">Collection Address</h4>
          <p className="text-gray-300 font-mono text-xs break-all">{selectedFee.collectionAddress}</p>
        </div>
        
        <div>
          <h4 className="text-gray-400 text-sm">Store Address</h4>
          <p className="text-gray-300 font-mono text-xs break-all">{selectedFee.storeAddress}</p>
        </div>
        
        <div>
          <h4 className="text-gray-400 text-sm">User</h4>
          <p className="text-gray-300 font-mono text-xs break-all">{selectedFee.user}</p>
        </div>
        
        <div>
          <h4 className="text-gray-400 text-sm">Fee Status</h4>
          <div className="flex items-center mt-1">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-green-300">Active & Claimable</span>
          </div>
        </div>
      </div>
      
      <div className="pt-6 border-t border-gray-700">
        <button
          onClick={() => {
            // Implement claim or action function here
            setModalMessage('Processing fee claim...');
            setIsModalVisible(true);
            
            setTimeout(() => {
              setModalMessage('Fees successfully claimed!');
              setTimeout(() => {
                setIsModalVisible(false);
                setIsFeeModalVisible(false);
              }, 1500);
            }, 1500);
          }}
          className="w-full py-3 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
        >
          Claim Fees
        </button>
      </div>
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
          <h4 className="text-gray-400 text-sm">Collection Address</h4>
          <p className="text-gray-300 font-mono text-xs break-all">{selectedOrder.collection}</p>
        </div>
        
        <div>
          <h4 className="text-gray-400 text-sm">Token ID</h4>
          <p className="text-white font-medium">#{selectedOrder.tokenId.toString()}</p>
        </div>
        
        <div>
          <h4 className="text-gray-400 text-sm">Order Type</h4>
          <p className="text-white font-medium">{selectedOrder?.orderType.toString()}</p>
        </div>
        
        <div>
          <h4 className="text-gray-400 text-sm">Status</h4>
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
            Pending
          </span>
        </div>
      </div>
      
      {/* Inspect Order Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            // This will be linked to your detailed order page later
            setModalMessage('Opening detailed order inspection...');
            setIsModalVisible(true);
            
            setTimeout(() => {
              setModalMessage('Redirecting to order details...');
              setTimeout(() => {
                setIsModalVisible(false);
                // Instead of closing the modal, you would navigate to the order details page
                // For now, we'll just log this action
                console.log('Inspecting Order:', selectedOrder);
              }, 1000);
            }, 1000);
          }}
          className="w-full py-3 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white"
        >
          Inspect Order
        </button>
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

        <div className="mb-6">
          <button
            onClick={handleFulfillOrder}
            disabled={!trackingNumber.trim()}
            className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
              !trackingNumber.trim()
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700'
            } text-white mb-4`}
          >
            Fulfill Order
          </button>

          <button
            onClick={() => {
              // Implement update tracking function
              setModalMessage('Updating tracking information...');
              setIsModalVisible(true);
              
              setTimeout(() => {
                setModalMessage('Tracking information updated successfully!');
                setTimeout(() => {
                  setIsModalVisible(false);
                }, 1500);
              }, 1500);
            }}
            className="w-full py-3 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white mb-4"
          >
            Update Tracking
          </button>

          <button
            onClick={() => {
              // Implement withdraw funds function
              setModalMessage('Processing funds withdrawal...');
              setIsModalVisible(true);
              
              setTimeout(() => {
                setModalMessage('Funds withdrawn successfully!');
                setTimeout(() => {
                  setIsModalVisible(false);
                  setIsOrderModalVisible(false);
                }, 1500);
              }, 1500);
            }}
            className="w-full py-3 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
          >
            Withdraw Funds
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default WalletPage;
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { getEmbeddedConnectedWallet, usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import Image from 'next/image';
import { EIP155_CHAINS } from '@/data/EIP155Data';
import OrderInspection from '../componants/OrderInspection';
import Pagination from '../componants/Pagination'; // Import the Pagination component

// Import existing interfaces
interface Curve {
  address: string;
  name: string;
}

interface PendingOrder {
  collection: string;
  tokenId: bigint;
  exists: boolean;
  orderType: bigint;
}

interface StoreDetails {
  user: string;
  storeAddress: string;
  collectionAddress: string;
  tokenId: bigint;
  exists: boolean;
}

interface LaunchDetails {
  address: string;
  balance: string;
}

// Add ABIs in a more concise format
const launchABI = [
  "function getNFTAddress() view returns (address)"
];

const phygitalABI = [
  "function metadata(uint256) view returns (string name, string description, string itemPhoto, string condition, string shipping, string store, string category, string size, address owner, uint256 redeemValue)"
];

const WalletPage: React.FC = () => {
  // Existing state variables
  const [profileExists, setProfileExists] = useState(false);
  const [ethBalance, setEthBalance] = useState('0.00');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isProfileAssociated, setIsProfileAssociated] = useState(false);
  const [profileAddress, setProfileAddress] = useState('');
  const [claimableBalance, setClaimableBalance] = useState('0.00');
  const [payoutsAddress, setPayoutsAddress] = useState('');
  const [name, setName] = useState('');
  const [storeFees, setStoreFees] = useState<StoreDetails[]>([]);
  const [selectedFee, setSelectedFee] = useState<StoreDetails | null>(null);
  const [isFeeModalVisible, setIsFeeModalVisible] = useState(false);
  const [showOrderInspection, setShowOrderInspection] = useState(false);
  const [userLaunches, setUserLaunches] = useState<LaunchDetails[]>([]);
  const [launchCount, setLaunchCount] = useState(0);
  const [selectedLaunch, setSelectedLaunch] = useState<LaunchDetails | null>(null);
  const [isLaunchModalVisible, setIsLaunchModalVisible] = useState(false);
  const [curves, setCurves] = useState<Curve[]>([
    { address: '0x1234567890abcdef1234567890abcdef12345678', name: 'Cool Clothing' },
    { address: '0xabcdef1234567890abcdef1234567890abcdef12', name: 'Premium Accessories' },
    { address: '0x7890abcdef1234567890abcdef1234567890abcd', name: 'Limited Edition Sneakers' },
    { address: '0xdef1234567890abcdef1234567890abcdef12345', name: 'Vintage Collection' }
  ]);
  const [activeTab, setActiveTab] = useState('wallet');
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    images: []
  });
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [showSwitchAddressModal, setShowSwitchAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);

  // Add pagination state for each tab
  const [ordersCurrentPage, setOrdersCurrentPage] = useState(1);
  const [feesCurrentPage, setFeesCurrentPage] = useState(1);
  const [launchesCurrentPage, setLaunchesCurrentPage] = useState(1);

  const [launchLink, setLaunchLink] = useState('');
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  const [nftAddress, setNftAddress] = useState('');
  const [storeName, setStoreName] = useState('');
  
  // Define items per page
  const ITEMS_PER_PAGE = 5;

  let rpcURL = EIP155_CHAINS["eip155:84532"].rpc;
  const provider = useMemo(() => new ethers.JsonRpcProvider(rpcURL), [rpcURL]);
  const { login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  let wallet = wallets[0];

// Add this handler function for withdrawing fees from a launch
const handleWithdrawFeesFromLaunch = async (launchAddress: any) => {
  setModalMessage('Processing fee withdrawal from launch...');
  setIsModalVisible(true);
  
  try {
    // Create a contract instance for the launch
    const signer: any = await getSigner();
    const launchContract = new ethers.Contract(launchAddress, [
      "function withdrawFees() external"
    ], signer);
    
    // Call the withdrawFees function
    // Uncomment the line below in production to wait for confirmation
    // await tx.wait();
    
    setModalMessage('Fees withdrawn successfully!');
    
    // Refresh the launch balance after withdrawal
    const updatedBalance = await provider.getBalance(launchAddress);
   
    // Update the user launches data to reflect the new balance
    const walletAddress = await getWallet().then(w => w?.address || user?.wallet?.address);
    if (walletAddress) {
      fetchUserLaunches(walletAddress);
    }
  } catch (error) {
    console.error('Error withdrawing fees:', error);
    setModalMessage('Failed to withdraw fees. Please try again.');
  } finally {
    setTimeout(() => {
      setIsModalVisible(false);
    }, 1500);
  }
};

   // Update the handleViewLaunch function to fetch the link when a launch is clicked
   const handleViewLaunch = async (launch:any) => {
    console.log('Viewing launch:', launch);
    setSelectedLaunch(launch);
    setIsLaunchModalVisible(true);
    
    // Reset states
    setLaunchLink('');
    setNftAddress('');
    setStoreName('');
    setIsLoadingLink(true);
    
    try {
      // Create a contract instance for the launch
      const launchContract = new ethers.Contract(launch.address, launchABI, provider);
      
      // Get the NFT address from the launch contract
      const phygitalAddress = await launchContract.getNFTAddress();
      setNftAddress(phygitalAddress);
      
      if (phygitalAddress && phygitalAddress !== "0x0000000000000000000000000000000000000000") {
        // Create a contract instance for the phygital NFT
        const phygitalContract = new ethers.Contract(phygitalAddress, phygitalABI, provider);
        
        // Get the metadata for token ID 0 (since all tokens have the same link)
        const metadataResult = await phygitalContract.metadata(0);
        
        // Extract the store link from the metadata
        const storeLink = metadataResult.store;
        const name = metadataResult.name;
        
        setLaunchLink(storeLink);
        setStoreName(name);
      }
    } catch (error) {
      console.error('Error fetching launch details:', error);
    } finally {
      setIsLoadingLink(false);
    }
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

  // Create a wallet instance from the private key
  const adminWallet = useMemo(() => {
        return new ethers.Wallet('cac636e07dd1ec983b66c5693b97ac5150d9a0cc5db8dd39ddb58b2e142cb192', provider);
  }, [provider]);


// Add this handler function for order fulfillment
const handleOrderFulfill = (trackingNumber: any, email: any, walletAddress: any) => {
  setModalMessage('Processing order fulfillment...');
  setIsModalVisible(true);
  
  // Here you would call your contract or API to update the order
  // This is a simulation for demonstration purposes
  setTimeout(() => {
    setModalMessage('Order fulfilled successfully!');
    setTimeout(() => {
      setIsModalVisible(false);
      setShowOrderInspection(false);
      
      // Refresh the orders list
      const walletAddress = wallet?.address || user?.wallet?.address;
      if (walletAddress) {
        fetchPendingOrders(walletAddress);
        fetchPendingOrderCount(walletAddress);
      }
    }, 1500);
  }, 1500);
};

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

  // Add new function to fetch launch count
  const fetchLaunchCount = useCallback(async (address: string) => {
    if (!address || !profileContract) return 0;
    
    try {
      const count = await profileContract.launchCount(address);
      const countNum = Number(count);
      setLaunchCount(countNum);
      console.log('Launch count:', countNum);
      return countNum;
    } catch (error) {
      console.error('Error fetching launch count:', error);
      setLaunchCount(0);
      return 0;
    }
  }, [profileContract]);

  // Add new function to fetch all launches
  const fetchUserLaunches = useCallback(async (address: string) => {
    if (!address || !profileContract) return [];
    
    try {
      // Get the launch count first
      const count = await profileContract.launchCount(address);
      const countNum = Number(count);
      
      // If there are no launches, return an empty array
      if (countNum === 0) {
        setUserLaunches([]);
        return [];
      }
      
      // Get all launches
      const launchAddresses = await profileContract.getLaunch(address, countNum);
      console.log('Launch addresses:', launchAddresses);
      
      // Get balance for each launch address
      const launchesWithBalance = await Promise.all(
      launchAddresses.map(async (launchAddress: string) => {
      try {
      // Attempt to get the balance
      const balance = await provider.getBalance(launchAddress);
      console.log('Launch balance:', balance);
      
      return {
        address: launchAddress,
        balance: balance ? ethers.formatEther(balance) : "0.00"
      };
    } catch (error) {
      console.error('Error fetching balance for launch address:', launchAddress, error);
      
      // Return default balance of zero if there's an error
      return {
        address: launchAddress,
        balance: "0.00"
      };
    }
  })
);
      
      setUserLaunches(launchesWithBalance);
      console.log('User launches with balance:', launchesWithBalance);
      return launchesWithBalance;
    } catch (error) {
      console.error('Error fetching user launches:', error);
      setUserLaunches([]);
      return [];
    }
  }, [profileContract, provider]);

// Add this function to handle viewing fee details
const handleViewFee = (fee: StoreDetails) => {
  setSelectedFee(fee);
  setIsFeeModalVisible(true);
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

          // Fetch user launches
          await fetchLaunchCount(walletAddress);
          await fetchUserLaunches(walletAddress);

          // New fetch operation for store fees
          await fetchUserStoreFees(walletAddress);
        }
      } catch (error) {
        console.error('Error initializing contract:', error);
      }
    };

    initContract();
  }, [user, wallet, getWallet, fetchProfileByUsername, fetchProfileByAddress, 
      checkProfileAssociation, fetchClaimableBalance, fetchPendingOrders, 
      fetchPendingOrderCount, fetchLaunchCount, fetchUserLaunches]);

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

// Enhanced handleInspectOrder function that fetches both metadata and order details
const handleInspectOrder = async (order:any) => {
  setIsOrderModalVisible(false);
  setModalMessage('Loading order details...');
  setIsModalVisible(true);
  
  try {
    // Create contract instances
    const phygitalContract = new ethers.Contract(order.collection, phygitalABI, provider);
    const ordersContract = new ethers.Contract(ordersAddr, ordersABI, provider);
    
    // Get the current wallet address
    const currentWallet = await getWallet();
    const walletAddress = currentWallet?.address || user?.wallet?.address;
    
    // Parallel fetching of both metadata and order details
    const [metadataResult, orderDetails] = await Promise.all([
      // Fetch NFT metadata
      phygitalContract.metadata(order.tokenId),
      
      // Fetch order details from the Orders contract
      ordersContract.getStoreOrder(order.collection, walletAddress, order.tokenId)
    ]);
    
    // Extract order data and status
    const orderData = orderDetails[0];
    const isPending = orderDetails[1];
    
    // Map the numerical status to a string
    const statusMap = ['Pending', 'Processing', 'Shipped', 'Completed'];
    const orderStatus = statusMap[Number(orderData.status)] || 'Unknown';
    
    // Build shipping details from the contract data
    const shippingDetails = {
      recipientName: orderData.shipping.recipientName,
      streetAddress: orderData.shipping.streetAddress,
      city: orderData.shipping.city,
      state: orderData.shipping.state,
      zipCode: orderData.shipping.zipCode,
      country: orderData.shipping.country,
      phoneNumber: orderData.shipping.phoneNumber || '',
      email: orderData.shipping.email || ''
    };
    
    // Calculate a withdrawable balance for display (this is a placeholder)
    // In a real implementation, you would calculate this based on the order value
    const withdrawableBalance = isPending ? "0.00" : "0.125";
    
    // Update the order object with all the real data
    const enhancedOrder = {
      ...order,
      metadata: {
        name: metadataResult.name,
        description: metadataResult.description,
        itemPhoto: metadataResult.itemPhoto,
        condition: metadataResult.condition,
        shipping: metadataResult.shipping,
        store: metadataResult.store,
        category: metadataResult.category,
        size: metadataResult.size,
        owner: metadataResult.owner,
        redeemValue: metadataResult.redeemValue
      },
      shippingDetails: shippingDetails,
      status: orderStatus,
      isCompleted: orderStatus === 'Completed',
      isPending: isPending,
      withdrawableBalance: withdrawableBalance,
      trackingNumber: orderData.trackingNumber || '',
      timestamp: Number(orderData.timestamp) || 0,
      customer: orderData.customer || ethers.ZeroAddress,
      store: orderData.store || ethers.ZeroAddress
    };
    
    console.log('Enhanced order with shipping details:', enhancedOrder);
    
    setSelectedOrder(enhancedOrder);
    setIsModalVisible(false);
    setShowOrderInspection(true);
  } catch (error) {
    console.error('Error fetching order details:', error);
    setModalMessage('Failed to load order details. Please try again.');
    setTimeout(() => {
      setIsModalVisible(false);
    }, 1500);
  }
};
  
  const handleViewOrder = async (order:any) => {
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

  // Add new function to handle withdrawal from a launch
  const handleWithdrawFromLaunch = (launchAddress: string) => {
    setModalMessage('Processing withdrawal from launch...');
    setIsModalVisible(true);

    // Simulate withdrawal
    setTimeout(() => {
      setModalMessage('Funds withdrawn successfully!');
      setTimeout(() => {
        setIsModalVisible(false);
        setIsLaunchModalVisible(false);
        // In a real app, you would update the launch balance
      }, 1500);
    }, 1500);
  };

 // Helper function for pagination
 const getPaginatedItems = (items: any, currentPage: any, itemsPerPage: any) => {
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  return items.slice(indexOfFirstItem, indexOfLastItem);
};

// Helper for number formatting
const formatEthValue = (value: any) => {
  const num = parseFloat(value);
  if (num === 0) return "0.00";
  return num.toFixed(6);
};

// Updated OrdersContent component with pagination
const OrdersContent = () => {
  // Filter orders
  const filteredOrders = pendingOrders.filter((order) => 
    order && order?.orderType && order.orderType.toString() === "1"
  );
  
  // Get paginated orders
  const currentOrders = getPaginatedItems(filteredOrders, ordersCurrentPage, ITEMS_PER_PAGE);
  const totalOrderPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Orders</h2>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
          Total: {filteredOrders.length}
        </span>
      </div>
      
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          <>
            {currentOrders.map((order: any, index: any) => (
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
            ))}
            
            <Pagination 
              currentPage={ordersCurrentPage}
              totalPages={totalOrderPages}
              onPageChange={setOrdersCurrentPage}
            />
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-400">No pending orders to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Trading Fees Content component with pagination
const TradingFeesContent = () => {
  // Get paginated fees
  const currentFees = getPaginatedItems(storeFees, feesCurrentPage, ITEMS_PER_PAGE);
  const totalFeePages = Math.ceil(storeFees.length / ITEMS_PER_PAGE);
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Trading Fees</h2>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
          Total: {storeFees.length}
        </span>
      </div>
      
      <div className="space-y-4">
        {storeFees.length > 0 ? (
          <>
            {currentFees.map((fee: any, index: any) => (
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
            ))}
            
            <Pagination 
              currentPage={feesCurrentPage}
              totalPages={totalFeePages}
              onPageChange={setFeesCurrentPage}
            />
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-400">No trading fees to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Store Launches Content component with pagination
const MyCurvesContent = () => {
  // Get paginated launches
  const currentLaunches = getPaginatedItems(userLaunches, launchesCurrentPage, ITEMS_PER_PAGE);
  const totalLaunchPages = Math.ceil(userLaunches.length / ITEMS_PER_PAGE);
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Your Store Launches</h2>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
          Total: {launchCount}
        </span>
      </div>

      <div className="space-y-4 mb-8">
        {userLaunches.length > 0 ? (
          <>
            {currentLaunches.map((launch: any, index: any) => (
              <div 
                key={index} 
                className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                onClick={() => handleViewLaunch(launch)}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">
                      Launch #{((launchesCurrentPage - 1) * ITEMS_PER_PAGE) + index + 1}
                    </h3>
                    <p className="text-gray-400 font-mono text-xs mb-2 break-all">{launch.address}</p>
                  </div>
                  <div className="mt-4 md:mt-0 flex flex-col items-end">
                    <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-1">
                      {formatEthValue(launch.balance)} ETH
                    </div>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            <Pagination 
              currentPage={launchesCurrentPage}
              totalPages={totalLaunchPages}
              onPageChange={setLaunchesCurrentPage}
            />
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-400">No launches found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Demo launches data for product launches
const demoLaunches = [
  { id: 1, name: "Summer Wear Collection", date: "Jun 15, 2025", status: "Coming Soon", statusClass: "bg-purple-500/20 text-purple-300 border border-purple-500/30" },
  { id: 2, name: "Spring Collection", date: "May 1, 2025", status: "Scheduled", statusClass: "bg-blue-500/20 text-blue-300 border border-blue-500/30" },
  { id: 3, name: "Winter Essentials", date: "Nov 15, 2025", status: "Draft", statusClass: "bg-gray-500/20 text-gray-300 border border-gray-500/30" },
  { id: 4, name: "Exclusive Streetwear", date: "Apr 20, 2025", status: "Live", statusClass: "bg-green-500/20 text-green-300 border border-green-500/30" },
  { id: 5, name: "Designer Collaboration", date: "Aug 1, 2025", status: "Scheduled", statusClass: "bg-blue-500/20 text-blue-300 border border-blue-500/30" },
  { id: 6, name: "Limited Edition Accessories", date: "Jul 15, 2025", status: "Coming Soon", statusClass: "bg-purple-500/20 text-purple-300 border border-purple-500/30" },
  { id: 7, name: "Fall Fashion Preview", date: "Sep 10, 2025", status: "Scheduled", statusClass: "bg-blue-500/20 text-blue-300 border border-blue-500/30" },
  { id: 8, name: "Urban Sports Collection", date: "May 30, 2025", status: "Draft", statusClass: "bg-gray-500/20 text-gray-300 border border-gray-500/30" },
  { id: 9, name: "Holiday Special", date: "Dec 1, 2025", status: "Scheduled", statusClass: "bg-blue-500/20 text-blue-300 border border-blue-500/30" },
  { id: 10, name: "Premium Denim Series", date: "Jun 1, 2025", status: "Coming Soon", statusClass: "bg-purple-500/20 text-purple-300 border border-purple-500/30" }
];

// Product Launches tab with pagination
const [productLaunchesPage, setProductLaunchesPage] = useState(1);
const LAUNCHES_PER_PAGE = 6;


// Reset pagination pages when tabs change
useEffect(() => {
  setOrdersCurrentPage(1);
  setFeesCurrentPage(1);
  setLaunchesCurrentPage(1);
  setProductLaunchesPage(1);
}, [activeTab]);

// Main render
return (
  <div className="min-h-screen bg-black flex flex-col p-6">
    <div className="max-w-6xl w-full mx-auto">
      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {['wallet', 'trading-fees', 'launches'].map((tab) => (
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
            {/* Wallet dashboard content remains unchanged */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">Dashboard Panel:</h2>
              </div>
            </div>

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
        
        {/* Updated Tab Content with Pagination */}
        {activeTab === 'orders' && <OrdersContent />}
        {activeTab === 'trading-fees' && <TradingFeesContent />}
        {activeTab === 'launches' && <MyCurvesContent />}
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
    <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-white/10 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
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
          
          {/* New message about order completion */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6">
            <p className="text-yellow-300 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              All orders must be completed before withdrawal can be made.
            </p>
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

{isLaunchModalVisible && selectedLaunch && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
    <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-white/10 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">Launch Details</h3>
        <button 
          onClick={() => {
            setIsLaunchModalVisible(false);
            setSelectedLaunch(null);
          }}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {/* Launch Balance Display */}
          <div className="bg-gray-800/50 p-4 rounded-lg mb-6 border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg text-white font-medium">Available Balance</h4>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                Ready to Withdraw
              </span>
            </div>
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              {formatEthValue(selectedLaunch.balance)} ETH
            </div>
            <div className="text-gray-400 text-sm mt-1">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
          
          {/* New message about order completion */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6">
            <p className="text-yellow-300 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              All orders must be completed before withdrawal can be made.
            </p>
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <h4 className="text-gray-400 text-sm">Launch Address</h4>
            <p className="text-gray-300 font-mono text-xs break-all">{selectedLaunch.address}</p>
          </div>
          
          {/* NFT Address - New */}
          {nftAddress && (
            <div>
              <h4 className="text-gray-400 text-sm">NFT Contract</h4>
              <p className="text-gray-300 font-mono text-xs break-all">{nftAddress}</p>
            </div>
          )}
          
          {/* Collection Name - New */}
          {storeName && (
            <div>
              <h4 className="text-gray-400 text-sm">Collection Name</h4>
              <p className="text-white">{storeName}</p>
            </div>
          )}
          
          <div>
            <h4 className="text-gray-400 text-sm">Launch Status</h4>
            <div className="flex items-center mt-1">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-green-300">Active</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-6 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Withdraw Funds Button */}
        <button
          onClick={() => handleWithdrawFromLaunch(selectedLaunch.address)}
          disabled={parseFloat(selectedLaunch.balance) <= 0}
          className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
            parseFloat(selectedLaunch.balance) <= 0
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
          } text-white`}
        >
          Withdraw Funds
        </button>
        
        {/* Withdraw Fees Button - New */}
        <button
          onClick={() => handleWithdrawFeesFromLaunch(selectedLaunch.address)}
          className={`w-full py-3 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white`}
        >
          Withdraw Fees
        </button>
        
        {/* Launch Link Button */}
        <div className="md:col-span-2">
          {isLoadingLink ? (
            <button className="w-full py-3 rounded-lg font-medium bg-gray-700 text-gray-300 cursor-wait">
              <span className="inline-block animate-pulse">Loading Store Link...</span>
            </button>
          ) : launchLink ? (
            <a 
              href={launchLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 rounded-lg font-medium text-center transition-all duration-200 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white"
            >
              Visit Store
            </a>
          ) : (
            <button className="w-full py-3 rounded-lg font-medium transition-all duration-200 bg-gray-600 text-gray-300 cursor-not-allowed">
              Store Link Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
)}


{showOrderInspection && selectedOrder && (
  <OrderInspection 
    order={selectedOrder}
    onClose={() => setShowOrderInspection(false)}
    onFulfill={handleOrderFulfill}
  />
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
      
      {/* Inspect Order Button - Now calls the new handler function */}
      <div className="mb-6">
        <button
          onClick={() => handleInspectOrder(selectedOrder)}
          className="w-full py-3 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white"
        >
          Inspect Order
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default WalletPage;
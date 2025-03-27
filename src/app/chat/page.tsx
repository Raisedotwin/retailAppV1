"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { getEmbeddedConnectedWallet, usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { EIP155_CHAINS } from '@/data/EIP155Data';

interface CurveParams {
  initialSupply: string;
  name: string;
  symbol: string;
  timeLimit: string;
  allowOthersToList: boolean; // Add this new field
}

interface LaunchData {
  address: string;
  date: string;
  status: 'active' | 'completed' | 'pending';
}

interface StoreFormData {
  name: string;
  description: string;
  logo: File | null;
  userName: string;
  tokenName: string;
  symbol: string;
  bio: string;
  avatarURL: string;
  customWalletAddress: string;
}

interface CurveModalProps {
  isOpen: boolean;
  onClose: () => void;
  curveType: string;
}

const Chat: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'stores'>('marketplace');
  const [mintAmount, setMintAmount] = useState<string>('');
  const [showOpenCurveModal, setShowOpenCurveModal] = useState<boolean>(false);
  const [showClosedCurveModal, setShowClosedCurveModal] = useState<boolean>(false);
  const [isLaunchingOpenCurve, setIsLaunchingOpenCurve] = useState(false);
  const [isLaunchingClosedCurve, setIsLaunchingClosedCurve] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [recentLaunches, setRecentLaunches] = useState<LaunchData[]>([]);
  const [tokenPreview, setTokenPreview] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoadingLaunches, setIsLoadingLaunches] = useState(false);
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const [curveParams, setCurveParams] = useState<CurveParams>({
    initialSupply: '',
    name: '',
    symbol: '',
    timeLimit: '',
    allowOthersToList: true // Default to true
  });
  const [storeFormData, setStoreFormData] = useState<StoreFormData>({
    name: '',
    description: '',
    logo: null,
    userName: '',
    tokenName: '',
    symbol: '',
    bio: '',
    avatarURL: '',
    customWalletAddress: ''
  });

  const { user, login } = usePrivy();
  const { wallets } = useWallets();

  // Contract setup
  const rpcURL = EIP155_CHAINS["eip155:84532"].rpc;
  const provider = useMemo(() => new ethers.JsonRpcProvider(rpcURL), [rpcURL]);

  let wallet = wallets[0];

  // Contract addresses and ABIs
  const createAddr = '0xD4C1AEd05eC6b9FB319378d86a8e0Df131C0397C';
  const createABI = require("../abi/createAccount");
  const launchFactory = '0x79fBBABadBF9931a7E81da7af2eBC5A2b030390f';
  const launchFactoryABI = require("../abi/launchFactory");
  const openFactory = '0x8beb7041719830E9ebe5714fCaa34BBf03C43e4f';
  const openFactoryABI = require("../abi/openFactory");
  const profileAddr = '0x006208E5BDAF546245Ae5A9eece0f4B30a466241';
  const profileABI = require("../abi/profile");
  const launchABI = require("../abi/launch");
  const openABI = require("../abi/open");

  const tokenMarketAddr = '0xB0B747C3A92c720f3a856E218F3f07e38939190c';
  const tokenMarketABI = require("../abi/tokenMarket");

  // Then update your useEffect for Twitter username changes:
useEffect(() => {
  const updateProfileImage = async () => {
    if (user?.twitter?.username) {
      const twitterUsername = user.twitter.username;
      
      // First update the basic fields
      setStoreFormData(prev => ({
        ...prev,
        userName: twitterUsername,
        name: twitterUsername,
        // Temporarily set unavatar as fallback while fetching
        avatarURL: `https://unavatar.io/twitter/${twitterUsername}`
      }));
      
      // Then fetch the actual Twitter profile image
      try {
        const profileImageUrl = await fetchTwitterProfileImage(twitterUsername);
        setStoreFormData(prev => ({
          ...prev,
          avatarURL: profileImageUrl
        }));
      } catch (error) {
        console.error('Failed to fetch Twitter profile image:', error);
        // Fallback is already set, so no need to update
      }
    }
  };
  
  updateProfileImage();
}, [user?.twitter?.username]);

const fetchTokenAddress = async () => {
  if (!wallet) return;
  
  try {
    const signer: any = await getSigner();
    if (!signer) return;

    const userAddress = await signer.getAddress();
    
    // Get account number from profile contract
    const profileContract = new ethers.Contract(profileAddr, profileABI, signer);
    const tokenMarketContract = new ethers.Contract(tokenMarketAddr, tokenMarketABI, signer);
    
    try {
      // Get the token address from the account
      const accountNumber = await profileContract.getAccountNumber(userAddress);
      console.log('Account Number:', accountNumber.toString());
      const tokenAddr = await tokenMarketContract.getTokenAddressByAccount(accountNumber);
      console.log('Token Address:', tokenAddr);
      
      // Check if it's a valid address and not zero address
      if (tokenAddr && tokenAddr !== '0x0000000000000000000000000000000000000000') {
        setTokenAddress(tokenAddr);
      } else {
        setTokenAddress('');
      }
    } catch (error) {
      console.error('Error fetching token address:', error);
      setTokenAddress('');
    }
  } catch (error) {
    console.error('Error getting signer or user address:', error);
    setTokenAddress('');
  }
};


  const getSigner = async () => {
    if (user?.twitter?.username) {
      let embeddedWallet = getEmbeddedConnectedWallet(wallets);
      let privyProvider = await embeddedWallet?.address;
      
      const foundWallet = wallets.find((w) => w.address === privyProvider);
      if (foundWallet) {
        wallet = foundWallet;
      }
    }
  
    if (!wallet) {
      throw new Error("No wallet available");
    }
  
    const privyProvider = await getPrivyProvider("base-sepolia");
    return privyProvider?.getSigner();
  };

  const getPrivyProvider = async (chainName: string) => {
    if (!wallet) {
      console.error("Wallet not initialized");
      return null;
    }
  
    let chainId: number;
    switch (chainName.toLowerCase()) {
      case "base":
        chainId = 8453;
        break;
      case "base-sepolia":
        chainId = 84532;
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

  // Add this function to your Chat component
const fetchTwitterProfileImage = async (username: string): Promise<string> => {
  try {
    // Use the same Twitter API endpoint that SearchModal is using
    const response = await fetch(`/api/twitter/user/${username}`);
    if (!response.ok) {
      console.error(`Error fetching Twitter profile: ${response.status}`);
      // Fallback to unavatar if API fails
      return `https://unavatar.io/twitter/${username}`;
    }
    
    const userData = await response.json();
    
    if (userData.data && userData.data.profile_image_url) {
      // Twitter API returns a low-res image by default, replace _normal with _400x400 for higher resolution
      return userData.data.profile_image_url.replace('_normal', '_400x400');
    } else {
      return `https://unavatar.io/twitter/${username}`;
    }
  } catch (error) {
    console.error('Error fetching Twitter profile image:', error);
    // Fallback to unavatar if any error occurs
    return `https://unavatar.io/twitter/${username}`;
  }
};
  
  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.twitter?.username) {
      alert('You must be logged in with Twitter to create a store');
      return;
    }
    
    if (storeFormData.customWalletAddress && !ethers.isAddress(storeFormData.customWalletAddress)) {
      alert('Please enter a valid wallet address or leave it empty');
      return;
    }
    
    setIsCreating(true);
    try {
      const signer: any = await getSigner();
      if (!signer) {
        alert('Failed to get signer. Please try again.');
        return;
      }
  
      const createContract = new ethers.Contract(createAddr, createABI, signer);
      const userAddress = storeFormData.customWalletAddress || await signer.getAddress();
  
      const tx = await createContract.createAccount(
        user.twitter.username,
        storeFormData.tokenName,
        storeFormData.symbol,
        storeFormData.bio,
        storeFormData.avatarURL,
        userAddress
      );
      
      alert('Store created successfully!');
      
      setStoreFormData({
        name: '',
        description: '',
        logo: null,
        userName: user.twitter.username || '',
        tokenName: '',
        symbol: '',
        bio: '',
        avatarURL: '',
        customWalletAddress: ''
      });
  
    } catch (error: any) {
      console.error('Error creating store:', error);
      alert(`Error creating store: ${error.message || 'Please try again.'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const calculateTokenAmount = async (ethAmount: string) => {
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      setTokenPreview('');
      return;
    }

    setIsCalculating(true);
    try {
      const signer: any = await getSigner();
      if (!signer) return;

      const userAddress = await signer.getAddress();
      
      // Get account number from profile contract
      const profileContract = new ethers.Contract(profileAddr, profileABI, signer);
      const accountNumber = await profileContract.getAccountNumber(userAddress);
      
      // Calculate tokens from token market contract
      const tokenMarketContract = new ethers.Contract(tokenMarketAddr, tokenMarketABI, signer);
      const amountInWei = ethers.parseEther(ethAmount);
      const tokenAmount = await tokenMarketContract.getNumberOfTokensForAmount(accountNumber, amountInWei);
      
      // Convert to a readable format
      setTokenPreview(ethers.formatUnits(tokenAmount, 18));
    } catch (error) {
      console.error('Error calculating token amount:', error);
      setTokenPreview('Error calculating');
    } finally {
      setIsCalculating(false);
    }
  };

  // Add effect to calculate tokens when mint amount changes
  useEffect(() => {
    calculateTokenAmount(mintAmount);
  }, [mintAmount]);

  const handleMintTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mintAmount || parseFloat(mintAmount) <= 0) {
      alert('Please enter a valid amount to mint');
      return;
    }
  
    setIsMinting(true);
    try {
      const signer: any = await getSigner();
      if (!signer) {
        alert('Failed to get signer. Please connect your wallet.');
        return;
      }

      const userAddress = await signer.getAddress();
      
      // Get account number
      const profileContract = new ethers.Contract(profileAddr, profileABI, signer);
      const accountNumber = await profileContract.getAccountNumber(userAddress);

      // Calculate token amount
      const tokenMarketContract = new ethers.Contract(tokenMarketAddr, tokenMarketABI, signer);
      let amountInWei = ethers.parseEther(mintAmount);
      let tokenAmount = await tokenMarketContract.getNumberOfTokensForAmount(accountNumber, amountInWei);

      // If tokenAmount is 0, mint 1 token with a minimal ETH amount
      if (tokenAmount.toString() === '0') {
        // Get the cost for 1 token
        const oneToken = ethers.parseUnits('1', 18); // 1 token with 18 decimals
        const costForOneToken = ethers.parseEther('0.0000000000000116');;
        
        // Update values for the transaction
        tokenAmount = oneToken;
        amountInWei = costForOneToken;
      }

      // Create and execute transaction
      const createContract = new ethers.Contract(createAddr, createABI, signer);
      const tx = await createContract.launchToken(
        tokenAmount,  // Use calculated token amount (either original or 1 token)
        { value: amountInWei }  // Send ETH amount (either original or cost for 1 token)
      );
      
      alert(`Successfully minted ${ethers.formatUnits(tokenAmount, 18)} tokens! Transaction hash: ${tx.hash}`);
      setMintAmount('');
      setTokenPreview('');
      
    } catch (error: any) {
      console.error('Error minting tokens:', error);
      alert(`Error minting tokens: ${error.message || 'Please try again.'}`);
    } finally {
      setIsMinting(false);
    }
  };

  const handleCreateCurve = async (isOpen: boolean): Promise<void> => {
    try {
      const signer:any = await getSigner();
      if (!signer) {
        alert('Failed to get signer. Please connect your wallet.');
        return;
      }
  
      console.log('isOpen:', isOpen);
      console.log('allowOthersToList:', curveParams.allowOthersToList);
  
      // Get user address
      const userAddress = await signer.getAddress();
      
      // Get the most recent launch address from profile contract
      const profileContract = new ethers.Contract(profileAddr, profileABI, signer);
      const launchCount = await profileContract.launchCount(userAddress);
      
      if (launchCount.toString() === '0') {
        alert('No launches found. Please create a launch first.');
        return;
      }
  
      // Get the most recent launch
      const recentLauncher = await profileContract.getLaunch(userAddress, launchCount);
      console.log('Recent Launcher:', recentLauncher);
      const launchAddress = recentLauncher.launchAddr;
  
      if (!launchAddress) {
        alert('No valid launch address found.');
        return;
      }
  
      // Convert string values to appropriate types
      const initialSupply = ethers.parseUnits(curveParams.initialSupply, 18);
      const timeLimit = parseInt(curveParams.timeLimit);
  
      if (isOpen) {
        // Handle Open Curve creation using open contract ABI
        const openContract = new ethers.Contract(launchAddress, openABI, signer);
        const tx = await openContract.create(
          initialSupply,
          curveParams.name,
          curveParams.symbol,
          timeLimit,
          curveParams.allowOthersToList // Use the value from the checkbox
        );
        alert('Open curve created successfully!');
      } else if (!isOpen) {
        // Handle Launch (Closed) Curve creation using launch contract ABI
        const launchContract = new ethers.Contract(launchAddress, launchABI, signer);
        const tx = await launchContract.create(
          initialSupply,
          curveParams.name,
          curveParams.symbol,
          timeLimit,
          curveParams.allowOthersToList // Use the value from the checkbox
        );
        alert('Closed curve created successfully!');
      }
  
      // Close the modal
      if (isOpen) {
        setShowOpenCurveModal(false);
      } else {
        setShowClosedCurveModal(false);
      }
  
      // Reset form
      setCurveParams({
        initialSupply: '',
        name: '',
        symbol: '',
        timeLimit: '',
        allowOthersToList: true // Reset to default
      });
  
    } catch (error: any) {
      console.error('Error creating curve:', error);
      alert(`Error creating curve: ${error.message || 'Please try again.'}`);
    }
  };

  const fetchUserLaunches = async () => {
    if (!wallet) return;
    
    setIsLoadingLaunches(true);
    try {
      const signer:any = await getSigner();
      if (!signer) return;

      const userAddress = await signer.getAddress();
      const profileContract = new ethers.Contract(profileAddr, profileABI, signer);
      
      const launchCount = await profileContract.launchCount(userAddress);
      const count = Number(launchCount);
      
      const launches: LaunchData[] = [];
      
      for (let i = count; i > Math.max(0, count - 5); i--) {
        try {
          const launch = await profileContract.getLaunch(userAddress, i);
          const timestamp = Number(launch.dateSinceExpiry) * 1000;
          
          launches.push({
            address: launch.launchAddr,
            date: new Date(timestamp).toISOString(),
            status: Date.now() < timestamp ? 'active' : 'completed'
          });
        } catch (error) {
          console.error(`Error fetching launch ${i}:`, error);
        }
      }
      
      setRecentLaunches(launches);
    } catch (error) {
      console.error('Error fetching launches:', error);
    } finally {
      setIsLoadingLaunches(false);
    }
  };

  useEffect(() => {
    if (wallet && activeTab === 'stores') {
      fetchUserLaunches();
      fetchTokenAddress();
    }
  }, [wallet, activeTab]);

 // Update the launchOpenCurve and launchClosedCurve functions inside the CurveModal component:

 // Update the CurveModal component with a force refresh mechanism:

 const CurveModal: React.FC<CurveModalProps> = ({ isOpen, onClose, curveType }) => {
  // Add a key state to force component remounting
  const [refreshKey, setRefreshKey] = useState<number>(0);
  
  const [localParams, setLocalParams] = useState<CurveParams>({
    initialSupply: curveParams.initialSupply,
    name: curveParams.name,
    symbol: curveParams.symbol,
    timeLimit: curveParams.timeLimit,
    allowOthersToList: curveParams.allowOthersToList
  });
  
  // State variables for launch detection
  const [isCheckingLaunch, setIsCheckingLaunch] = useState<boolean>(true);
  const [launchAddress, setLaunchAddress] = useState<string>('');
  const [launchDetected, setLaunchDetected] = useState<boolean>(false);
  
  // Add a formatted time display state
  const [formattedTime, setFormattedTime] = useState<string>('');

  // Function to calculate and format time based on seconds
  const calculateTimeDisplay = (seconds: number) => {
    if (!seconds || seconds <= 0) {
      setFormattedTime('');
      return;
    }
    
    const days = Math.floor(seconds / 86400); // 86400 seconds in a day
    const hours = Math.floor((seconds % 86400) / 3600); // 3600 seconds in an hour
    const minutes = Math.floor((seconds % 3600) / 60);
    
    let timeString = '';
    
    if (days > 0) {
      timeString += `${days} day${days !== 1 ? 's' : ''}`;
    }
    
    if (hours > 0) {
      timeString += timeString ? ` ${hours} hour${hours !== 1 ? 's' : ''}` : `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    
    if (minutes > 0 && days === 0) { // Only show minutes if less than a day
      timeString += timeString ? ` ${minutes} minute${minutes !== 1 ? 's' : ''}` : `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    setFormattedTime(timeString || 'Less than a minute');
  };

  // Function to check for launch address - improved with retry mechanism
  const checkForLaunch = async (retry = true) => {
    setIsCheckingLaunch(true);
    try {
      const signer: any = await getSigner();
      if (!signer) {
        setLaunchDetected(false);
        return;
      }

      const userAddress = await signer.getAddress();
       
      // Get the most recent launch address from profile contract
      const profileContract = new ethers.Contract(profileAddr, profileABI, signer);
      const launchCount = await profileContract.launchCount(userAddress);
      
      if (launchCount.toString() === '0') {
        // No launches found
        setLaunchDetected(false);
        setLaunchAddress('');
      } else {
        // Get the most recent launch
        const recentLauncher = await profileContract.getLaunch(userAddress, launchCount);
        const address = recentLauncher.launchAddr;
        
        if (!address || address === '0x0000000000000000000000000000000000000000') {
          setLaunchDetected(false);
          setLaunchAddress('');
        } else {
          setLaunchDetected(true);
          setLaunchAddress(address);
        }
      }
    } catch (error) {
      console.error('Error checking for launch:', error);
      setLaunchDetected(false);
      setLaunchAddress('');
    } finally {
      setIsCheckingLaunch(false);
    }
  };

  // Force a refresh of the component
  const forceRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Modified launchOpenCurve function with enhanced transaction handling
  const launchOpenCurve = async () => {
    setIsLaunchingOpenCurve(true);
    try {
      const signer: any = await getSigner();
      if (!signer) {
        alert('Failed to get signer. Please connect your wallet.');
        return;
      }
  
      const openFactoryContract = new ethers.Contract(openFactory, openFactoryABI, signer);
      const tx = await openFactoryContract.createTokenMarket();
      
      // Show pending message
      alert('Transaction submitted! Waiting for confirmation...');
      
      // Wait for blockchain state to update (additional delay)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Force refresh the component
      forceRefresh();
      
      // Run the check for launch
      await checkForLaunch();
      
      alert('Open curve successfully created! You can now configure it.');
    } catch (error) {
      console.error('Error creating open curve token market:', error);
      alert(`Error creating open curve: ${'Please try again.'}`);
    } finally {
      setIsLaunchingOpenCurve(false);
    }
  };
  
  // Modified launchClosedCurve function with enhanced transaction handling
  const launchClosedCurve = async () => {
    setIsLaunchingClosedCurve(true);
    try {
      const signer: any = await getSigner();
      if (!signer) {
        alert('Failed to get signer. Please connect your wallet.');
        return;
      }
  
      const launchFactoryContract = new ethers.Contract(launchFactory, launchFactoryABI, signer);
      const tx = await launchFactoryContract.createTokenMarket();
      
      // Show pending message
      alert('Transaction submitted! Waiting for confirmation...');
      
      // Wait for blockchain state to update (additional delay)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Force refresh the component
      forceRefresh();
      
      // Run the check for launch
      await checkForLaunch();
      
      alert('Closed curve successfully created! You can now configure it.');
    } catch (error) {
      console.error('Error creating closed curve token market:', error);
      alert(`Error creating closed curve: ${'Please try again.'}`);
    } finally {
      setIsLaunchingClosedCurve(false);
    }
  };

  // Manual refresh button handler
  const handleManualRefresh = async () => {
    setIsCheckingLaunch(true);
    // Force a small delay to ensure visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));
    await checkForLaunch();
  };

  // Reset and check for launch when component mounts or when refreshKey changes
  useEffect(() => {
    if (isOpen) {
      checkForLaunch();
    }
  }, [isOpen, refreshKey]);

  // Initialize local state when modal opens
  useEffect(() => {
    setLocalParams({
      initialSupply: curveParams.initialSupply,
      name: curveParams.name,
      symbol: curveParams.symbol,
      timeLimit: curveParams.timeLimit,
      allowOthersToList: curveParams.allowOthersToList
    });
    
    // Calculate formatted time based on initial timeLimit
    if (curveParams.timeLimit) {
      calculateTimeDisplay(Number(curveParams.timeLimit));
    }
  }, [isOpen, refreshKey]);
  
  // Update formatted time whenever timeLimit changes
  useEffect(() => {
    calculateTimeDisplay(Number(localParams.timeLimit));
  }, [localParams.timeLimit]);
  
  // Handle time limit change with calculation
  const handleTimeLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeLimit = e.target.value;
    setLocalParams({...localParams, timeLimit: newTimeLimit});
    calculateTimeDisplay(Number(newTimeLimit));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update the parent state with local values
    setCurveParams(localParams);
    // Then create the curve
    handleCreateCurve(curveType === 'Open');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50">
      <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-purple-500/20 max-w-2xl w-full mx-4">
        <h3 className="text-2xl font-bold text-white mb-6">Create {curveType} Curve</h3>
        
        {/* Launch button section */}
        <div className="mb-6 pb-6 border-b border-gray-700">
          <p className="text-gray-400 mb-4">
            First, launch a new {curveType.toLowerCase()} curve token market contract.
          </p>
          <button
            onClick={curveType === 'Open' ? launchOpenCurve : launchClosedCurve}
            disabled={curveType === 'Open' ? isLaunchingOpenCurve : isLaunchingClosedCurve}
            className={`w-full py-3 ${
              (curveType === 'Open' ? isLaunchingOpenCurve : isLaunchingClosedCurve)
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
            } text-white rounded-xl font-medium transition-all duration-200 mb-2`}
          >
            {(curveType === 'Open' ? isLaunchingOpenCurve : isLaunchingClosedCurve)
              ? `Launching ${curveType} Curve...`
              : `Launch ${curveType} Curve`}
          </button>
          <p className="text-gray-500 text-xs text-center">
            This will deploy a new token market contract
          </p>
        </div>
        
        {/* Launch status indicator with manual refresh button */}
        <div className="mb-6 bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-lg font-semibold text-white">Launch Status</h4>
            <button 
              onClick={handleManualRefresh}
              disabled={isCheckingLaunch}
              className={`px-3 py-1 rounded-lg text-xs flex items-center space-x-1 ${
                isCheckingLaunch 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${isCheckingLaunch ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{isCheckingLaunch ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
          
          {isCheckingLaunch ? (
            <div className="flex items-center space-x-3 text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
              <p>Checking for launch address...</p>
            </div>
          ) : launchDetected ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-400">Most recent launch detected</p>
              </div>
              <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg">
                <p className="text-xs text-gray-300 font-mono break-all">
                  {launchAddress}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(launchAddress);
                    alert("Launch address copied to clipboard!");
                  }}
                  className="ml-2 p-1.5 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="text-red-400">No launch detected</p>
              </div>
              <p className="text-gray-400 text-sm">
                Please click the "{curveType === 'Open' ? 'Launch Open Curve' : 'Launch Closed Curve'}" button above to create a launch first.
              </p>
            </div>
          )}
        </div>
        
        {/* The rest of your component remains the same */}
        <h4 className="text-lg font-semibold text-white mb-4">List A Product Or Category Of Products</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Token Details Row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Product Name</label>
              <input
                type="text"
                value={localParams.name}
                onChange={(e) => setLocalParams({...localParams, name: e.target.value})}
                className={`w-full bg-gray-700 text-white p-3 rounded-lg ${!launchDetected && 'opacity-50 cursor-not-allowed'}`}
                placeholder="Category or name"
                required
                disabled={!launchDetected}
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Symbol</label>
              <input
                type="text"
                value={localParams.symbol}
                onChange={(e) => setLocalParams({...localParams, symbol: e.target.value})}
                className={`w-full bg-gray-700 text-white p-3 rounded-lg ${!launchDetected && 'opacity-50 cursor-not-allowed'}`}
                placeholder="Enter symbol"
                required
                disabled={!launchDetected}
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Product Supply</label>
              <input
                type="number"
                value={localParams.initialSupply}
                onChange={(e) => setLocalParams({...localParams, initialSupply: e.target.value})}
                className={`w-full bg-gray-700 text-white p-3 rounded-lg ${!launchDetected && 'opacity-50 cursor-not-allowed'}`}
                placeholder="10 or more"
                required
                disabled={!launchDetected}
              />
            </div>
          </div>
  
          {/* Time Parameters Row - MODIFIED */}
          <div className="grid grid-cols-3 gap-4">
            <div className={curveType === 'Open' ? '' : 'col-span-3'}>
              <label className="block text-gray-400 text-sm mb-2">Time Until Curve Expiry</label>
              <input
                type="number"
                value={localParams.timeLimit}
                onChange={handleTimeLimitChange}
                className={`w-full bg-gray-700 text-white p-3 rounded-lg ${!launchDetected && 'opacity-50 cursor-not-allowed'}`}
                placeholder="Enter in seconds"
                required
                disabled={!launchDetected}
              />
              <div className="mt-2 space-y-1">
                <p className="text-gray-500 text-xs">
                  Total before the curve expires
                </p>
                {formattedTime && (
                  <div className="bg-purple-500/10 rounded-lg p-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-purple-300 text-xs font-medium">
                      = {formattedTime}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Add the checkbox for allowing others to list */}
          <div className={`bg-gray-800/50 rounded-xl p-4 ${!launchDetected && 'opacity-70'}`}>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowOthersToList"
                checked={localParams.allowOthersToList}
                onChange={(e) => setLocalParams({...localParams, allowOthersToList: e.target.checked})}
                className="h-5 w-5 rounded border-gray-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-800"
                disabled={!launchDetected}
              />
              <label htmlFor="allowOthersToList" className={`ml-2 block text-gray-300 ${!launchDetected && 'opacity-70'}`}>
                Allow others to list on your curve
              </label>
            </div>
            <p className={`text-gray-500 text-xs mt-2 ${!launchDetected && 'opacity-70'}`}>
              {curveType === 'Open' 
                ? "If checked, others can list their items on your curve, you will receive surplus profit and fees."
                : "If checked, others can list their items on your closed curve, you will receive surplus profit and fees."}
            </p>
          </div>
  
          <div className="flex space-x-4 mt-6">
            <button
              type="submit"
              disabled={!launchDetected}
              className={`flex-1 py-3 ${
                !launchDetected
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              } text-white rounded-xl font-medium transition-all duration-200`}
            >
              {launchDetected ? 'Create' : 'Launch Required'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
  const renderContent = () => {
    if (activeTab === 'marketplace') {
      return (
        <div className="max-w-lg mx-auto">
          <div className="bg-gray-800/30 backdrop-blur-md rounded-2xl p-8 border border-gray-700/50">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                Create Your Store
              </h2>
              {!user?.twitter?.username && (
                <p className="text-gray-400 mt-2">
                  Connect your X account to create a store
                </p>
              )}
            </div>
            {/* Store creation form - Unchanged */}
            <form onSubmit={handleStoreSubmit} className="space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-4">
                <label className="block text-gray-400 text-sm mb-2">Store Name (X Username)</label>
                <input
                  type="text"
                  name="userName"
                  value={user?.twitter?.username || 'Connect X to set store name'}
                  disabled
                  className="w-full bg-gray-700 text-gray-400 p-3 rounded-lg cursor-not-allowed"
                />
              </div>
  
              <div className="bg-gray-800/50 rounded-xl p-4">
                <label className="block text-gray-400 text-sm mb-2">Token Name</label>
                <input
                  type="text"
                  name="tokenName"
                  value={storeFormData.tokenName}
                  onChange={(e) => setStoreFormData({...storeFormData, tokenName: e.target.value})}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg"
                  placeholder="Enter token name"
                />
              </div>
  
              <div className="bg-gray-800/50 rounded-xl p-4">
                <label className="block text-gray-400 text-sm mb-2">Token Symbol</label>
                <input
                  type="text"
                  name="symbol"
                  value={storeFormData.symbol}
                  onChange={(e) => setStoreFormData({...storeFormData, symbol: e.target.value})}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg"
                  placeholder="Enter token symbol"
                />
              </div>
  
              <div className="bg-gray-800/50 rounded-xl p-4">
                <label className="block text-gray-400 text-sm mb-2">Store Description</label>
                <textarea
                  name="bio"
                  value={storeFormData.bio}
                  onChange={(e) => setStoreFormData({...storeFormData, bio: e.target.value})}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg min-h-24"
                  placeholder="Tell us about your store"
                />
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4">
              <label className="block text-gray-400 text-sm mb-2">Avatar URL</label>
            <input
              type="text"
              name="avatarURL"
              value={storeFormData.avatarURL || 'Connect X to set avatar URL'}
              disabled
              className="w-full bg-gray-700 text-gray-400 p-3 rounded-lg cursor-not-allowed"
            />
          {user?.twitter?.username && (
            <p className="text-gray-500 text-xs mt-1">
              Automatically set from your X profile
            </p>
          )}
          </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4">
                <label className="block text-gray-400 text-sm mb-2">
                  Admin Wallet (Use Any Ethereum Address)
                </label>
                <input
                  type="text"
                  name="customWalletAddress"
                  value={storeFormData.customWalletAddress}
                  onChange={(e) => setStoreFormData({...storeFormData, customWalletAddress: e.target.value})}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg"
                  placeholder="Leave empty to use your connected wallet"
                />
                {storeFormData.customWalletAddress && !ethers.isAddress(storeFormData.customWalletAddress) && (
                  <p className="text-red-400 text-sm mt-1">Please enter a valid Ethereum address</p>
                )}
              </div>
  
              <button
                type="submit"
                onClick={() => !user?.twitter?.username && login()}
                className={`w-full py-4 ${
                  user?.twitter?.username
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                } text-white rounded-xl font-medium transition-all duration-200`}
              >
                {user?.twitter?.username ? 'Create Store' : 'Connect with X to Create Store'}
              </button>
            </form>
          </div>
        </div>
      );
    } else {
      return (
        <div className="max-w-lg mx-auto space-y-8">
          {/* Recent Launches Section */}
<div className="bg-gray-800/30 backdrop-blur-md rounded-2xl p-8 border border-gray-700/50">
  <div className="text-center mb-8">
    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
      Recent Launches
    </h2>
  </div>
  <div className="space-y-4">
    {isLoadingLaunches ? (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading launches...</p>
      </div>
    ) : recentLaunches.length > 0 ? (
      // Only show the first 4 launches
      recentLaunches.slice(0, 4).map((launch, index) => (
        <div 
          key={launch.address}
          className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-purple-500/20 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-400 text-sm font-mono">
                {launch.address.substring(0, 6)}...{launch.address.substring(38)}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Launched on {new Date(launch.date).toLocaleDateString()}
              </p>
            </div>
            <span 
              className={`px-3 py-1 rounded-full text-xs ${
                launch.status === 'active' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              {launch.status}
            </span>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-8">
        <p className="text-gray-400">No launches found</p>
      </div>
    )}

     {/* Show total count if there are more than 4 launches */}
    {recentLaunches.length > 4 && (
      <div className="text-center pt-4 border-t border-gray-700/30">
        <p className="text-gray-400 text-sm">
          Showing 4 of {recentLaunches.length} total launches
        </p>
      </div>
    )}
  </div>
</div>

{/* Token Address Section */}
<div className="bg-gray-800/30 backdrop-blur-md rounded-2xl p-8 border border-gray-700/50">
  <div className="text-center mb-8">
    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
      Store Token Address
    </h2>
  </div>
  
  {tokenAddress ? (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-400 font-mono break-all text-sm">
          {tokenAddress}
        </p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(tokenAddress);
            alert("Token address copied to clipboard!");
          }}
          className="ml-2 p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
        </button>
      </div>
    </div>
  ) : (
    <div className="text-center py-8 bg-gray-800/50 rounded-xl">
      <p className="text-gray-400">No token created</p>
      <p className="text-gray-500 text-sm mt-2">
        Mint tokens below to create your first token
      </p>
    </div>
  )}
</div>

          {/* Mint Tokens Section - Updated with token preview */}
          <div className="bg-gray-800/30 backdrop-blur-md rounded-2xl p-8 border border-gray-700/50">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                Mint Store Tokens
              </h2>
            </div>
            <form onSubmit={handleMintTokens} className="space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-4">
                <label className="block text-gray-400 text-sm mb-2">Amount to Mint (ETH)</label>
                <input
                  type="number"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg"
                  placeholder="Enter ETH amount"
                  disabled={isMinting || isCalculating}
                  step="0.00000000000002"
                  min="0"
                  //max="0.2"
                />
                <p className="text-gray-400 text-xs mt-1">
                  The amount entered will be used to purchase tokens, purchase 1 token with 0.00000000000002 ETH to intialize the curve
                </p>
                {isCalculating ? (
                  <p className="text-purple-400 text-sm mt-2 flex items-center">
                    <span className="animate-spin h-4 w-4 border-b-2 border-purple-500 rounded-full mr-2"></span>
                    Calculating tokens...
                  </p>
                ) : tokenPreview ? (
                  <p className="text-green-400 text-sm mt-2">
                    You will receive approximately {parseFloat(tokenPreview).toFixed(6)} tokens
                  </p>
                ) : null}
              </div>
              <button
                type="submit"
                disabled={isMinting || isCalculating || !tokenPreview}
                className={`w-full py-4 ${
                  isMinting || isCalculating || !tokenPreview
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                } text-white rounded-xl font-medium transition-all duration-200`}
              >
                {isMinting ? 'Minting...' : isCalculating ? 'Calculating...' : 'Mint Tokens'}
              </button>
            </form>
          </div>

        {/* Curves Section */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            onClick={() => setShowOpenCurveModal(true)}
            className="p-6 bg-gray-800/30 backdrop-blur-md rounded-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-200 group"
          >
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-xl mb-4 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-200">
            <span className="text-2xl">🔓</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Open Curves</h3>
          <p className="text-gray-400 text-sm mb-2">Create an open trading curve</p>
          <div className="bg-purple-500/10 rounded-lg p-3 mt-2">
          <p className="text-xs text-gray-400 leading-relaxed">
            Customers can redeem or order items during the price discovery period.
          </p>
          </div>
          </button>
          <button
            onClick={() => setShowClosedCurveModal(true)}
            className="p-6 bg-gray-800/30 backdrop-blur-md rounded-2xl border border-gray-700/50 hover:border-pink-500/50 transition-all duration-200 group"
          >
          <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-4 rounded-xl mb-4 group-hover:from-pink-500/30 group-hover:to-purple-500/30 transition-all duration-200">
            <span className="text-2xl">🔒</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Closed Curves</h3>
            <p className="text-gray-400 text-sm mb-2">Create a closed trading curve</p>
            <div className="bg-pink-500/10 rounded-lg p-3 mt-2">
            <p className="text-xs text-gray-400 leading-relaxed">
              Redemptions or orders can only be made after the price discovery period ends.
            </p>
          </div>
          </button>
        </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <Image 
                src="/icons/logo.png" 
                alt="Store Marketplace" 
                width={180} 
                height={180}
                className="transform transition-all duration-300 group-hover:scale-110"
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-4">
            Welcome to the Store Marketplace!
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Create your own store and launch token markets for your products!
          </p>
          <div className="max-w-2xl mx-auto">
  {/* Stylized protocol description card with collapsible content */}
  <div className="bg-gradient-to-br from-gray-800/50 via-purple-900/30 to-gray-800/50 rounded-xl border border-purple-500/20 shadow-lg mb-6 overflow-hidden transition-all duration-300 ease-in-out">
    {/* Header - Always visible and clickable */}
    <div 
      className="p-4 flex items-center justify-between cursor-pointer hover:bg-purple-900/20 transition-colors duration-200"
      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
    >
      <h2 className="text-xl font-semibold text-purple-300 flex items-center">
        <span className="bg-gradient-to-r from-purple-400 to-pink-400 w-8 h-8 rounded-full flex items-center justify-center mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        How It Works
      </h2>
      {/* Toggle arrow icon */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-6 w-6 text-purple-300 transition-transform duration-300 ${isDescriptionExpanded ? 'transform rotate-180' : ''}`} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
    
    {/* Collapsible content */}
    <div 
      className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isDescriptionExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="p-4 pt-0 space-y-4">
        <div className="flex items-start">
          <div className="bg-purple-500/20 rounded-full p-2 mr-3 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-gray-300">
            <span className="font-medium text-purple-300">Create a web3 store</span> and establish your brand on the blockchain.
          </p>
        </div>
        
        <div className="flex items-start">
          <div className="bg-purple-500/20 rounded-full p-2 mr-3 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-300">
            <span className="font-medium text-purple-300">Launch price discovery curves</span> for products or categories, helping you find optimal pricing.
          </p>
        </div>
        
        <div className="flex items-start">
          <div className="bg-purple-500/20 rounded-full p-2 mr-3 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-300">
            <span className="font-medium text-purple-300">Reward loyal customers</span> with your store's token. As they make more purchases, the token price increases.
          </p>
        </div>
        
        <div className="mt-6 pt-4 border-t border-purple-500/20">
          <p className="text-pink-300 text-sm italic text-center">
            Launch multiple curves, build customer loyalty, and grow your business on the blockchain!
          </p>
        </div>
      </div>
    </div>
  </div>
  
  {/* Connection status */}
  <div className="flex items-center justify-center bg-gray-800/50 rounded-lg py-2 px-4 border border-gray-700/50">
    {user?.twitter?.username ? (
      <div className="flex items-center text-green-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Connected as: <span className="font-mono ml-2">{user.twitter.username}</span>
      </div>
    ) : (
      <div className="flex items-center text-green-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Connected as: <span className="font-mono ml-2 text-xs">{user?.wallet?.address}</span>
      </div>
    )}
  </div>
</div>
  
        </div>

        <div className="flex justify-center space-x-4 mb-12">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'marketplace'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Create
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'stores'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            My Store
          </button>
        </div>

        {renderContent()}

        {showOpenCurveModal && (
          <CurveModal
            isOpen={true}
            onClose={() => setShowOpenCurveModal(false)}
            curveType="Open"
          />
        )}

        {showClosedCurveModal && (
          <CurveModal
            isOpen={true}
            onClose={() => setShowClosedCurveModal(false)}
            curveType="Closed"
          />
        )}
      </div>

      <div className="mt-16 py-8 border-t border-gray-800">
        <div className="text-center text-gray-500 text-sm">
          Powered by Liminal Tech
        </div>
      </div>
    </div>
  );
};

export default Chat;
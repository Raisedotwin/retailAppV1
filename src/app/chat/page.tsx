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
  redeemTime: string;
  timeLimit: string;
  expiryTime: string;
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
  const [isProfileAssociated, setIsProfileAssociated] = useState<boolean>(true);
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
  const [curveParams, setCurveParams] = useState<CurveParams>({
    initialSupply: '',
    name: '',
    symbol: '',
    redeemTime: '',
    timeLimit: '',
    expiryTime: ''
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
  const createAddr = '0x828ba1E00bA1f774CB25943Ef4aAF4874D10D374';
  const createABI = require("../abi/createAccount");
  const launchFactory = '0x4A1009bD578f6daF99096CF2a251c3711C701D15';
  const launchFactoryABI = require("../abi/launchFactory");
  const openFactory = '0x56Bf8A5DdA1BbbB5c1a1b622b2F3eF7fBf4d7d53';
  const openFactoryABI = require("../abi/openFactory");
  const profileAddr = '0xA07Dc7B3d8cD9CE3a75237ed9E1b007932AA45Fb';
  const profileABI = require("../abi/profile");
  const launchABI = require("../abi/launch");
  const openABI = require("../abi/open");

  const tokenMarketAddr = '0xA832df5A5Ff0D436eCE19a38E84eB92faC380566';
  const tokenMarketABI = require("../abi/tokenMarket");

  // Update store name when Twitter username changes
  useEffect(() => {
    if (user?.twitter?.username) {
      setStoreFormData(prev => ({
        ...prev,
        userName: user?.twitter?.username || '',
        name: user?.twitter?.username || '',
        avatarURL: `https://unavatar.io/twitter/${user?.twitter?.username}`
      }));
    }
  }, [user?.twitter?.username]);

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

  const launchOpenCurve = async () => {
    setIsLaunchingOpenCurve(true);
    try {
      const signer:any = await getSigner();
      if (!signer) {
        alert('Failed to get signer. Please connect your wallet.');
        return;
      }
  
      const openFactoryContract = new ethers.Contract(openFactory, openFactoryABI, signer);
      const tx = await openFactoryContract.createTokenMarket();
      const receipt = await tx.wait();
      
      let tokenMarketAddress = '';
      if (receipt.events && receipt.events.length > 0) {
        tokenMarketAddress = receipt.events[0].args ? receipt.events[0].args[0] : 'Address not found';
      }
      
      alert(`Open curve token market created successfully! Address: ${tokenMarketAddress}`);
    } catch (error) {
      console.error('Error creating open curve token market:', error);
      alert(`Error creating open curve: ${'Please try again.'}`);
    } finally {
      setIsLaunchingOpenCurve(false);
    }
  };
  
  const launchClosedCurve = async () => {
    setIsLaunchingClosedCurve(true);
    try {
      const signer:any = await getSigner();
      if (!signer) {
        alert('Failed to get signer. Please connect your wallet.');
        return;
      }
  
      const launchFactoryContract = new ethers.Contract(launchFactory, launchFactoryABI, signer);
      const tx = await launchFactoryContract.createTokenMarket();
      const receipt = await tx.wait();
      
      let tokenMarketAddress = '';
      if (receipt.events && receipt.events.length > 0) {
        tokenMarketAddress = receipt.events[0].args ? receipt.events[0].args[0] : 'Address not found';
      }
      
      alert(`Closed curve token market created successfully! Address: ${tokenMarketAddress}`);
    } catch (error) {
      console.error('Error creating closed curve token market:', error);
      alert(`Error creating closed curve: ${'Please try again.'}`);
    } finally {
      setIsLaunchingClosedCurve(false);
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
      const redeemTime = parseInt(curveParams.redeemTime);
      const expiryTime = parseInt(curveParams.expiryTime);
  
      if (isOpen) {
        // Handle Open Curve creation using open contract ABI
        const openContract = new ethers.Contract(launchAddress, openABI, signer);
        const tx = await openContract.create(
          initialSupply,
          curveParams.name,
          curveParams.symbol,
          redeemTime,
          timeLimit,
          expiryTime,
          true // _curveOpen is always true for open curves
        );
        await tx.wait();
        alert('Open curve created successfully!');
      } else {
        // Handle Launch (Closed) Curve creation using launch contract ABI
        const launchContract = new ethers.Contract(launchAddress, launchABI, signer);
        const tx = await launchContract.create(
          initialSupply,
          curveParams.name,
          curveParams.symbol,
          expiryTime,
          false // _curveOpen is always false for closed curves
        );
        await tx.wait();
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
        redeemTime: '',
        timeLimit: '',
        expiryTime: ''
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
    }
  }, [wallet, activeTab]);

  // Find the CurveModal component and replace it with this updated version

const CurveModal: React.FC<CurveModalProps> = ({ isOpen, onClose, curveType }) => {
  // Create a local state for the form to prevent re-renders of the entire modal
  const [localParams, setLocalParams] = useState<CurveParams>({
    initialSupply: curveParams.initialSupply,
    name: curveParams.name,
    symbol: curveParams.symbol,
    redeemTime: curveParams.redeemTime,
    timeLimit: curveParams.timeLimit,
    expiryTime: curveParams.expiryTime
  });

  // Initialize local state when modal opens
  useEffect(() => {
    setLocalParams({
      initialSupply: curveParams.initialSupply,
      name: curveParams.name,
      symbol: curveParams.symbol,
      redeemTime: curveParams.redeemTime,
      timeLimit: curveParams.timeLimit,
      expiryTime: curveParams.expiryTime
    });
  }, [isOpen]);

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
        
        {/* Configure curve parameters section */}
        <h4 className="text-lg font-semibold text-white mb-4">Configure Curve Parameters</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Token Details Row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Name</label>
              <input
                type="text"
                value={localParams.name}
                onChange={(e) => setLocalParams({...localParams, name: e.target.value})}
                className="w-full bg-gray-700 text-white p-3 rounded-lg"
                placeholder="Enter name"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Symbol</label>
              <input
                type="text"
                value={localParams.symbol}
                onChange={(e) => setLocalParams({...localParams, symbol: e.target.value})}
                className="w-full bg-gray-700 text-white p-3 rounded-lg"
                placeholder="Enter symbol"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Initial Supply</label>
              <input
                type="number"
                value={localParams.initialSupply}
                onChange={(e) => setLocalParams({...localParams, initialSupply: e.target.value})}
                className="w-full bg-gray-700 text-white p-3 rounded-lg"
                placeholder="Enter initial supply"
                required
              />
            </div>
          </div>
  
          {/* Time Parameters Row */}
          <div className="grid grid-cols-3 gap-4">
            {curveType === 'Open' && (
              <>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Redeem Time</label>
                  <input
                    type="number"
                    value={localParams.redeemTime}
                    onChange={(e) => setLocalParams({...localParams, redeemTime: e.target.value})}
                    className="w-full bg-gray-700 text-white p-3 rounded-lg"
                    placeholder="Enter redeem time"
                    required
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Period where trading and redemptions occur simultaneously
                  </p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Trading Time</label>
                  <input
                    type="number"
                    value={localParams.timeLimit}
                    onChange={(e) => setLocalParams({...localParams, timeLimit: e.target.value})}
                    className="w-full bg-gray-700 text-white p-3 rounded-lg"
                    placeholder="Enter time limit"
                    required
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Period where only trading can occur
                  </p>
                </div>
              </>
            )}
            <div className={curveType === 'Open' ? '' : 'col-span-3'}>
              <label className="block text-gray-400 text-sm mb-2">Curve Expiry</label>
              <input
                type="number"
                value={localParams.expiryTime}
                onChange={(e) => setLocalParams({...localParams, expiryTime: e.target.value})}
                className="w-full bg-gray-700 text-white p-3 rounded-lg"
                placeholder="Enter curve expiry"
                required
              />
              <p className="text-gray-500 text-xs mt-1">
                Total time before the curve expires
              </p>
            </div>
          </div>
  
          <div className="flex space-x-4 mt-6">
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
            >
              Create
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
                  Custom Wallet Address (Optional)
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
                recentLaunches.map((launch, index) => (
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
            </div>
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
                  The amount entered will be used to purchase tokens, purchase 1 token with 0.0000000000000116 ETH to intialize the curve
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
            Price discovery continues to occur even after items are redeemed. This allows for dynamic pricing throughout the entire trading period.
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
              Redemption for items can only happen after the price discovery period is over. This ensures a fixed final price before redemptions begin.
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
            Store Marketplace
          </h1>
          <div className="text-gray-400 max-w-2xl mx-auto">
            <p className="mb-4">
              Create and manage your digital stores. Connect with customers and sell your products seamlessly.
            </p>
            {!user?.twitter?.username && (
              <button
                onClick={() => login()}
                className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
              >
                Connect with X
              </button>
            )}
            {user?.twitter?.username && (
              <p>Connected as: {user.twitter.username}</p>
            )}
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
"use client";

import React, { useState, Suspense, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation'; // Use this to access query parameters
import { EIP155_CHAINS } from '@/data/EIP155Data';
import { ethers, Contract } from 'ethers';
import { getEmbeddedConnectedWallet, usePrivy, useWallets } from '@privy-io/react-auth'; 
import Image from 'next/image';
import { formatBlockTimestamp, calculateCurveDuration, formatDuration } from '../utils/timestamp';
import NFTMarketplace from '../componants/NFTMarketplace';
import AffiliateLink from '../componants/AffiliateLink';
import AffiliateDashboard from '../componants/AffiliateDashboard';
import MyInventory from '../componants/MyInventory';
import CountdownTimer from '../componants/CountdownTimer';

const TraderPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  
  // Initialize with default values to prevent "0.000" from showing before data loads
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [affiliateAddress, setAffiliateAddress] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [marketCap, setMarketCap] = useState('-'); // Use dash instead of '0'
  const [itemsOnCurve, setItemsOnCurve] = useState('-'); // Use dash instead of '0'
  const [contractBalance, setContractBalance] = useState('-'); // Use dash instead of '0'
  const [expiryTime, setExpiryTime] = useState('Loading...'); // Better loading state
  
  // Add ETH price state for USD conversion
  const [ethUsdPrice, setEthUsdPrice] = useState(0);
  const [isLoadingEthPrice, setIsLoadingEthPrice] = useState(false);
  
  // Extract parameters first - do this synchronously at component initialization
  const name = searchParams.get('name');
  const logo = searchParams.get('logo');
  const username = searchParams.get('username');
  const contractAddress = searchParams.get('contractAddress');

  // Set default params immediately
  const [params] = useState({
    name: name ?? 'Trader',
    logo: logo ?? 'https://via.placeholder.com/150',
    username: username ?? 'username',
    contractAddress: contractAddress ?? '0x899dDFe1CDc28dE88eff62Efa7894D68a53E5EEC',
  });

  // Create provider only once
  const rpcURL = EIP155_CHAINS["eip155:84532"].rpc;
  const provider = useMemo(() => new ethers.JsonRpcProvider(rpcURL), [rpcURL]);
  
  // Setup contracts with useMemo to avoid recreation on each render
  const nftContractABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function totalSupply() view returns (uint256)",
    "function getOwner(uint256 _tokenId) external view returns (address)",
    "function getBaseValue(uint256 tokenId) external view returns (uint256)"
  ];

  // Setup contract instances using useMemo
  const openContract = useMemo(() => {
    if (params.contractAddress) {
      const openABI = require("../abi/open"); // Move this import outside of useMemo if possible
      return new ethers.Contract(params.contractAddress, openABI, provider);
    }
    return null;
  }, [params.contractAddress, provider]);

  const launchContract = useMemo(() => {
    if (params.contractAddress) {
      const launchABI = require("../abi/launch"); // Move this import outside of useMemo if possible
      return new ethers.Contract(params.contractAddress, launchABI, provider);
    }
    return null;
  }, [params.contractAddress, provider]);

  const tokenContractAddr = '0x5Cd11eafc8722992Eb64e4cCBdE77f86283C7191';
  const marketDataAddr = '0xcB85f27798925698a2bDd15E99394B933E925fD1';
  const createAccountAddr = '0xc2B926A65E1e99a2db80C3C2Ff311F367Aa41775';
  const profileAddr = '0x33E04eC91A04F8791927C06EF5E862e6AA09b71a';
  const whitelistAddr = '0x006D6af7d1B2FdD222b43EaaBFE252579B539322';

  // Rest of your state variables...
  const [isActive, setIsActive] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [nftTokenAddress, setNftTokenAddress] = useState<string>('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [traderAddress, setTraderAddress] = useState('');
  const [curveType, setCurveType] = useState<number | null>(null);
  const [activeContract, setActiveContract] = useState<Contract | null>(null);
  const [activeAddress, setActiveAddress] = useState<any>('');
  
  // Add loading state indicators
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);
  
  // Get Privy-related data
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Other state variables you had...
  const [activeModalTab, setActiveModalTab] = useState<'affiliate' | 'affiliateDashboard'>('affiliate');
  const [contract, setContract] = useState<Contract | null>(null);
  const [profileContract, setProfileContract] = useState<Contract | null>(null);
  const [createContract, setCreateContract] = useState<Contract | null>(null);
  const [marketDataContract, setMarketDataContract] = useState<Contract | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Countdown timer related states
  const [expiryTimestamp, setExpiryTimestamp] = useState<number | null>(null);
  const [initTimestamp, setInitTimestamp] = useState<number | null>(null);
  const [curveDuration, setCurveDuration] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // Add useEffect to fetch ETH price
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        setIsLoadingEthPrice(true);
        // Fetch ETH price from CoinGecko API
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        setEthUsdPrice(data.ethereum.usd);
        console.log(`Fetched ETH price: $${data.ethereum.usd}`);
      } catch (err) {
        console.error("Failed to fetch ETH price:", err);
        // Fallback price if the API fails
        setEthUsdPrice(3000); // Use a reasonable default or last known price
      } finally {
        setIsLoadingEthPrice(false);
      }
    };

    fetchEthPrice();
    // Refresh price every 5 minutes
    const intervalId = setInterval(fetchEthPrice, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // 1. Check for affiliate link early (synchronous operation)
  useEffect(() => {
    const checkAffiliate = (params: URLSearchParams) => {
      const refAddress = params.get('ref');
      const isValidEthAddress = refAddress && /^0x[a-fA-F0-9]{40}$/.test(refAddress);
      return {
        isAffiliate: !!isValidEthAddress,
        affiliateAddress: isValidEthAddress ? refAddress : null
      };
    };

    const { isAffiliate, affiliateAddress } = checkAffiliate(searchParams);
    setIsAffiliate(isAffiliate);
    setAffiliateAddress(affiliateAddress);
  }, [searchParams]);

  // 2. Set up the page link (synchronous operation)
  const pageLink = useMemo(() => {
    return `http://localhost:3000/trader?name=${params.name}&logo=${params.logo}&username=${params.username}&contractAddress=${params.contractAddress}`;
  }, [params.name, params.logo, params.username, params.contractAddress]);

  // 3. Check auth status early
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (user && wallets && wallets.length > 0) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setShowLoginModal(true);
      }
    };
    
    checkWalletConnection();
  }, [user, wallets]);

  // 4. Check curve type as soon as contracts are available
  const checkCurveType = useCallback(async () => {
    if (!openContract && !launchContract) return;
    
    try {
      setIsLoadingData(true);
      
      // Try open contract first
      try {
        if (openContract) {
          const type = await openContract.getCurveType();
          if (type) {
            setCurveType(Number(type));
            setActiveContract(openContract);
            setActiveAddress(openContract.target);
            return;
          }
        }
      } catch (error) {
        console.log('Not an open contract, trying launch contract');
      }

      // Try launch contract if open contract fails
      try {
        if (launchContract) {
          const type = await launchContract.getCurveType();
          if (type) {
            setCurveType(Number(type));
            setActiveContract(launchContract);
            setActiveAddress(launchContract.target);
            return;
          }
        }
      } catch (error) {
        console.log('Not a launch contract either');
      }

      setCurveType(null);
    } catch (error) {
      console.error('Error checking curve type:', error);
      setCurveType(null);
      setDataLoadError('Failed to determine curve type');
    } finally {
      // We don't set isLoadingData to false here because we'll
      // fetch more data after determining the curve type
    }
  }, [openContract, launchContract]);

  // 5. Run checkCurveType when contracts are ready
  useEffect(() => {
    if (openContract || launchContract) {
      checkCurveType();
    }
  }, [openContract, launchContract, checkCurveType]);

  // 6. Load contract data after curve type is determined
  const fetchContractData = useCallback(async () => {
    if (!activeContract || curveType === null) return;
    
    try {
      // Fetch expiry and initialization times
      const [expiry, startTime, balance] = await Promise.allSettled([
        activeContract.getExpireyTime(),
        activeContract.getCurveInitializedTime(),
        provider.getBalance(activeContract.target)
      ]);
      
      // Handle expiry time
      if (expiry.status === 'fulfilled') {
        const expiryNum = Number(expiry.value.toString());
        setExpiryTimestamp(expiryNum);
        setExpiryTime(formatBlockTimestamp(expiry.value.toString()));
        
        // Check if already expired
        const now = Math.floor(Date.now() / 1000);
        setIsExpired(expiryNum <= now);
      }
      
      // Handle start time
      if (startTime.status === 'fulfilled') {
        const startNum = Number(startTime.value.toString());
        setInitTimestamp(startNum);
        
        // Calculate duration if both times are available
        if (expiry.status === 'fulfilled') {
          const expiryNum = Number(expiry.value.toString());
          const duration = calculateCurveDuration(startNum, expiryNum);
          setCurveDuration(duration);
        }
      }
      
      // Handle balance
      if (balance.status === 'fulfilled') {
        const formattedBalance = ethers.formatEther(balance.value);
        setContractBalance(formattedBalance);
      }
      
      // Fetch NFT token address
      await fetchNFTTokenAddress();
      
    } catch (error) {
      console.error('Error fetching contract data:', error);
      setDataLoadError('Failed to load contract information');
    }
  }, [activeContract, curveType, provider]);
  
  // 7. Execute fetchContractData when activeContract changes
  useEffect(() => {
    if (activeContract) {
      fetchContractData();
    }
  }, [activeContract, fetchContractData]);

  // 8. Fetch NFT token address and balance
  const fetchNFTTokenAddress = useCallback(async () => {
    if (!activeContract || curveType === null) return;
    
    try {
      // Get NFT address
      const tokenAddress = await activeContract.getNFTAddress();
      setNftTokenAddress(tokenAddress);
      
      // Create NFT contract
      if (tokenAddress && provider) {
        const contractNFT = new ethers.Contract(tokenAddress, nftContractABI, provider);
        
        // Get NFT balance
        const balance = await contractNFT.balanceOf(activeContract.target);
        setItemsOnCurve(balance.toString());
      }
    } catch (error) {
      console.error('Error fetching NFT data:', error);
    }
  }, [activeContract, curveType, nftContractABI, provider]);

  // 9. Initialize wallet and fetch trader data
  const initWalletAndContracts = useCallback(async () => {
    if (!user || !wallets || wallets.length === 0) {
      setIsLoadingData(false);
      return;
    }

    try {
      // Get wallet
      let wallet = wallets[0];
      if (user?.twitter?.username) {
        let embeddedWallet = getEmbeddedConnectedWallet(wallets);
        let privyProvider = await embeddedWallet?.address;
        wallet = wallets.find((w) => w.address === privyProvider) || wallet;
      }

      // Switch to the correct chain
      await wallet.switchChain(84532); // base-sepolia chain id
      const privyProvider = await wallet.getEthersProvider();
      const signer: any = privyProvider.getSigner();
      setSigner(signer);
      
      // Get wallet address
      const address = await signer.getAddress();
      setWalletAddress(address);

      // Initialize contracts
      const tokenMarketABI = require('../abi/tokenMarket.json');
      const profileABI = require('../abi/profile.json');
      const createAccountABI = require('../abi/createAccount.json');
      const marketDataABI = require('../abi/marketdata.json');
      
      const marketContractInstance = new ethers.Contract(tokenContractAddr, tokenMarketABI, signer);
      const profileContractInstance = new ethers.Contract(profileAddr, profileABI, signer);
      const createContractInstance = new ethers.Contract(createAccountAddr, createAccountABI, signer);
      const marketDataContractInstance = new ethers.Contract(marketDataAddr, marketDataABI, signer);
      
      setContract(marketContractInstance);
      setProfileContract(profileContractInstance);
      setCreateContract(createContractInstance);
      setMarketDataContract(marketDataContractInstance);

      // Fetch profile data
      if (profileContractInstance && params.username) {
        try {
          const profile = await profileContractInstance.getProfileByName(params.username);
          const nativeAddr = profile[0];
          const traderAcc = profile[1];
          
          setTraderAddress(nativeAddr);
          
          // Check active status
          const isClaimed = await profileContractInstance.isLaunchRegistered(nativeAddr);
          setIsActive(isClaimed);
          
          // Set profile
          setProfile(profile);
          
          // Get token address and market cap if trader account exists
          if (traderAcc && traderAcc !== "0") {
            const tokenAddress = await marketContractInstance.getTokenAddressByAccount(traderAcc.toString());
            setTokenAddress(tokenAddress);
            
            // Get market cap
            const MCAP = await marketContractInstance.getMarketCap(traderAcc.toString());
            setMarketCap(ethers.formatEther(MCAP));
          }
        } catch (error) {
          console.error('Error fetching profile data:', error);
        }
      }
    } catch (error) {
      console.error('Error initializing wallet and contracts:', error);
      setDataLoadError('Failed to initialize wallet connection');
    } finally {
      setIsLoadingData(false);
    }
  }, [user, wallets, params.username, tokenContractAddr, profileAddr, createAccountAddr, marketDataAddr]);

  // 10. Execute initWalletAndContracts when authentication is confirmed
  useEffect(() => {
    if (isLoggedIn) {
      initWalletAndContracts();
    }
  }, [isLoggedIn, initWalletAndContracts]);

  // Simplified page link generation function
  const getPrivyProvider = async (chainName: string) => {
    if (!wallets || wallets.length === 0) {
      console.error("Wallet not initialized");
      return null;
    }

    const wallet = wallets[0];
    let chainId: number;

    switch (chainName.toLowerCase()) {
      case "avax":
        chainId = 43114;
        break;
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

  return (
    <div className="min-h-screen p-6">
      {/* Background styling (unchanged) */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-purple-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob top-0 -left-4" />
          <div className="absolute w-96 h-96 bg-blue-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 top-0 -right-4" />
          <div className="absolute w-96 h-96 bg-pink-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000 -bottom-8 left-1/2 transform -translate-x-1/2" />
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjwvc3ZnPg==')] opacity-5" />
      </div>
  
      {/* Login Modal */}
      {!isLoggedIn ? (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6">
                <Image 
                  src="/icons/waitlogo.png" 
                  alt="Login Required" 
                  width={120} 
                  height={120} 
                  className="mx-auto"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Wallet Connection Required</h2>
              <p className="mb-6 text-gray-600">Please login with your wallet to view this page and access all features.</p>
              <button 
                className="w-full py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-lg font-medium rounded-2xl hover:shadow-lg transition-all duration-200"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl w-full mx-auto">
          {/* Profile Header Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-md p-8 mb-8">
            <div className="flex flex-wrap items-start md:items-center gap-8">
              {/* Avatar Section */}
              <div className="relative flex-shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-lg opacity-50 blur-sm"></div>
                <Image 
                  src={params.logo}
                  className="w-28 h-28 rounded-lg shadow-md border-4 border-white relative"
                  alt={params.name}
                  width={65}
                  height={65}
                />
                <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                  isActive ? 'bg-green-400' : 'bg-pink-400'
                }`} />
              </div>
  
              {/* Name and Addresses Sections */}
              <div className="flex-grow min-w-0 bg-gradient-to-r from-violet-50 to-fuchsia-50 p-4 rounded-xl border border-violet-100">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-violet-700 truncate">{params.name}</h2>
                  <a 
                    href={`https://twitter.com/${params.username}`} 
                    target="_blank" 
                    className="flex-shrink-0 hover:opacity-80 transition-opacity bg-black/10 p-1.5 rounded-full"
                  >
                    <Image 
                      src="/icons/x-logo-2.png" 
                      alt="Twitter" 
                      width={22} 
                      height={22} 
                    />
                  </a>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center gap-4">
                    <p className="text-gray-600 font-medium">@{params.username}</p>
                    <span className={`
                      text-sm font-medium px-3 py-1 rounded-full
                      ${isActive 
                        ? "text-green-700 bg-green-100/80" 
                        : "text-pink-700 bg-pink-100/80"
                      }
                    `}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {/* Address Components */}
                  <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-1 md:mt-0">
                    <AddressButton 
                      label="Loyalty Token"
                      address={tokenAddress || "0x0000000000000000000000000000000000000000"}
                    />
                    <AddressButton 
                      label="Phygital Address"
                      address={nftTokenAddress || "0x0000000000000000000000000000000000000000"}
                    />
                  </div>
                </div>
              </div>
              
              {/* Stats Section - Updated with USD Displays */}
              <div className="w-full md:w-auto mt-6 md:mt-0 grid grid-cols-7 gap-4 bg-gradient-to-r from-fuchsia-50 to-violet-50 p-4 rounded-xl border border-violet-100">
                {/* Time Left */}
                <div className="text-center px-4">
                  {isLoadingData ? (
                    <p className="text-lg font-bold text-violet-700 animate-pulse">Loading...</p>
                  ) : expiryTimestamp ? (
                    <CountdownTimer 
                      expiryTimestamp={expiryTimestamp}
                      onExpire={() => setIsExpired(true)}
                      totalDuration={curveDuration || undefined}
                      showProgressBar={true}
                    />
                  ) : (
                    <p className="text-lg font-bold text-violet-700">{expiryTime}</p>
                  )}
                  <p className="text-xs font-medium text-gray-600">Time Left</p>
                </div>
  
                {/* LIQ */}
                <div className="text-center px-4">
                  <p className="text-lg font-bold text-violet-700">
                    {isLoadingData ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <p className="text-lg font-bold text-violet-700">{expiryTime}</p>
                    )}
                  </p>
                  <p className="text-xs font-medium text-gray-600">Redemptions</p>
                </div>
  
                {/* Curve Liquidity - Updated with USD */}
                <div className="text-center px-4">
                  <p className="text-lg font-bold text-violet-700">
                    {isLoadingData ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-base font-bold">
                          ${(Number(contractBalance) * ethUsdPrice).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {Number(contractBalance).toFixed(4)} ETH
                        </span>
                      </div>
                    )}
                  </p>
                  <p className="text-xs font-medium text-gray-600">Curve Liquidity</p>
                </div>
  
                {/* Curve Type */}
                <div className="text-center px-4">
                  <p className="text-lg font-bold text-violet-700">
                    {isLoadingData ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      curveType === 1 ? "Closed" : curveType === 2 ? "Open" : ""
                    )}
                  </p>
                  <p className="text-xs font-medium text-gray-600">Curve Type</p>
                </div>
  
                {/* Curve MCAP - Updated with USD */}
                <div className="text-center px-4">
                  <p className="text-lg font-bold text-violet-700">
                    {isLoadingData ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-base font-bold">
                          ${(Number(marketCap) * ethUsdPrice).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {Number(marketCap).toFixed(4)} ETH
                        </span>
                      </div>
                    )}
                  </p>
                  <p className="text-xs font-medium text-gray-600">Curve MCAP</p>
                </div>
  
                {/* Store MCAP - Updated with USD */}
                <div className="text-center px-4">
                  <p className="text-lg font-bold text-violet-700">
                    {isLoadingData ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-base font-bold">
                          ${(Number(marketCap) * ethUsdPrice).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {Number(marketCap).toFixed(4)} ETH
                        </span>
                      </div>
                    )}
                  </p>
                  <p className="text-xs font-medium text-gray-600">Store MCAP</p>
                </div>
  
                {/* Items on Curve */}
                <div className="text-center px-4">
                  <p className="text-lg font-bold text-violet-700">
                    {isLoadingData ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      `${itemsOnCurve} Products`
                    )}
                  </p>
                  <p className="text-xs font-medium text-gray-600">Items On Curve</p>
                </div>
              </div>
            </div>
          </div>
  
          {/* Error message if data failed to load */}
          {dataLoadError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 shadow-sm">
              <p className="flex items-center">
                <span className="mr-2">⚠️</span>
                {dataLoadError} 
                <button 
                  onClick={() => window.location.reload()}
                  className="ml-auto text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded-lg transition-colors"
                >
                  Retry
                </button>
              </p>
            </div>
          )}
    
          {/* NFT Marketplace Section */}
          <NFTMarketplace 
            nftContract={nftTokenAddress}
            curveContract={contractAddress}
            userAddress={walletAddress}
            useContractData={false}
            activeContract={activeContract}
            launchContract={launchContract}
            openContract={openContract}
            curveType={curveType}
            signer={signer}
            pageLink={pageLink}
            expired={isExpired}
            isAffiliate={isAffiliate}
            affiliateAddress={affiliateAddress}
          />
  
          <MyInventory
            nftContract={nftTokenAddress}
            curveContract={contractAddress}
            userAddress={walletAddress}
            useContractData={false}
            activeContract={activeContract}
            signer={signer}
            marketData={marketDataContract}
          />
  
          {/* Activity Tabs Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-md mt-8 p-6">
            <div className="flex space-x-8 mb-6 border-b border-gray-200">
              {/* Affiliate tab buttons */}
              <TabButton 
                active={activeModalTab === 'affiliate'} 
                onClick={() => setActiveModalTab('affiliate')}
              >
                Affiliate Program
              </TabButton>
              <TabButton 
                active={activeModalTab === 'affiliateDashboard'} 
                onClick={() => setActiveModalTab('affiliateDashboard')}
              >
                Earnings Dashboard
              </TabButton>
            </div>
  
            <div className="mt-6">
              {activeModalTab === 'affiliate' && 
                <AffiliateLink
                  pageLink={pageLink}
                  walletAddress={walletAddress}
                  isAffiliate={isAffiliate}
                  affiliateAddress={affiliateAddress}
                />
              }
              {activeModalTab === 'affiliateDashboard' && 
                <AffiliateDashboard
                  walletAddress={walletAddress}
                  affiliateAddress={affiliateAddress}
                  contractAddress={params.contractAddress}
                  signer={signer}
                  activeContract={activeContract}
                />
              }
            </div>
          </div>
        </div>
      )}
  
      {/* Processing Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl">
            <div className="flex flex-col items-center">
              <div className="mb-4 relative">
                <Image src="/icons/waitlogo.png" alt="Processing" width={120} height={120} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              <p className="mt-4 text-lg font-medium text-gray-700">{modalMessage}</p>
              <p className="text-sm text-gray-500 mt-2">Please do not close this window</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ 
  children, 
  active, 
  onClick 
}: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`pb-4 text-lg font-medium transition-all relative ${
      active 
        ? 'text-blue-500 border-b-2 border-blue-500' 
        : 'text-gray-500 hover:text-blue-500'
    }`}
  >
    {children}
  </button>
);

const TraderPage: React.FC = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <TraderPageContent />
  </Suspense>
);

// Add this new component to your file
const AddressButton: React.FC<{ label: string; address: string }> = ({ label, address }) => {
  const truncateAddress = (address: string): string => {
    if (!address) return 'Not Available';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text);
    // Optional: Add a visual feedback that copying worked
    // This could be a toast notification or temporary state change
  };

  return (
    <div 
      className="flex items-center gap-1 bg-white/80 py-1 px-2 rounded-lg border border-violet-200 hover:shadow-sm transition-shadow cursor-pointer group"
      onClick={() => copyToClipboard(address)}
      title={`Copy ${label} Address: ${address}`}
    >
      <span className="text-xs font-medium text-gray-500">{label}:</span>
      <span className="text-xs font-mono text-violet-700">{truncateAddress(address)}</span>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-3.5 w-3.5 text-violet-500 opacity-70 group-hover:opacity-100" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
        />
      </svg>
    </div>
  );
};

export default TraderPage;
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
import EditLaunch from '../componants/EditLaunch';

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
  const [storeAddress, setStoreAddress] = useState('');
  const [curveMarketCap, setCurveMarketCap] = useState(''); // Use dash instead of '0'
  const [totalActiveRedeemValue, setTotalActiveRedeemValue] = useState('-'); // New state for redeem value
  const [unformattedBalance, setUnformattedBalnce] = useState('0'); // Unformatted balance for calculations
  // Add ETH price state for USD conversion
  const [ethUsdPrice, setEthUsdPrice] = useState(0);
  const [isLoadingEthPrice, setIsLoadingEthPrice] = useState(false);
  const [restricted, setRestricted] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [lastUpdatedSetting, setLastUpdatedSetting] = useState<string | null>(null);
  
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

  const tokenERC20ABI = [
    "function symbol() view returns (string)",
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];
  
  // LiquidityPoolTracker ABI
  const liquidityPoolTrackerABI = [
    "function getTotalActiveRedeemValue(address launchContract) external view returns (uint256)",
    "function getNFTLiquidityRequirement(address launchContract, uint256 tokenId) external view returns (uint256)"
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

  const tokenContractAddr = '0xa79C2327547d953a919f385eB720689A057E5fAF';
  const marketDataAddr = '0xF8bBbdF7AB89a7CD09F0918CdFA2904AE7A804b8';
  const createAccountAddr = '0xC2Cff33a3931d6c19BcE739Cce24d8b22fD73024';
  const profileAddr = '0x05d3D90AEF1fbD9b5CD16d15839C5f7B4159340f';
  const whitelistAddr = '0x006D6af7d1B2FdD222b43EaaBFE252579B539322';
  const liquidityPoolTrackerAddr = '0xE64419FCf31B94Bbc1786AFea4A5a7eaA77a0280';

  // Rest of your state variables...
  const [isActive, setIsActive] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [nftTokenAddress, setNftTokenAddress] = useState<string>('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [traderAddress, setTraderAddress] = useState('');
  const [curveType, setCurveType] = useState<number | null>(null);
  const [activeContract, setActiveContract] = useState<Contract | null>(null);
  const [activeAddress, setActiveAddress] = useState<any>('');
  const [ordersAbi, setOrdersAbi] = useState<any>(null);  
  
  // Add loading state indicators
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);

  const [tokenSymbol, setTokenSymbol] = useState('TOKEN'); // Default to BTC until loaded
  const [tokenBalance, setTokenBalance] = useState('-'); // Default 
  
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
  const [liquidityPoolTrackerContract, setLiquidityPoolTrackerContract] = useState<Contract | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Countdown timer related states
  const [expiryTimestamp, setExpiryTimestamp] = useState<number | null>(null);
  const [initTimestamp, setInitTimestamp] = useState<number | null>(null);
  const [curveDuration, setCurveDuration] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // Add these state variables near the other countdown related states
  const [redeemPeriodDuration, setRedeemPeriodDuration] = useState<number | null>(null);
  const [redeemExpiryTimestamp, setRedeemExpiryTimestamp] = useState<number | null>(null);
  const [isFinallyExpired, setIsFinallyExpired] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState<'trading' | 'redemption' | 'expired'>('trading');

  const handleSettingUpdated = (settingType: 'whitelist' | 'trading' | 'deliveryTime' | 'whitelistToggle') => {
    setLastUpdatedSetting(settingType);
    // If needed, you can refresh specific data based on what was updated
    if (settingType === 'whitelist') {
      // Refresh whitelist data
    } else if (settingType === 'trading') {
      // Refresh trading status
    } else if (settingType === 'deliveryTime') {
      // Refresh delivery time
    }
  };

  const fetchTokenDetails = useCallback(async () => {
    if (!activeContract || !tokenAddress || !provider) return;
    
    try {
      // Create token contract instance
      const tokenContract = new ethers.Contract(tokenAddress, tokenERC20ABI, provider);
      
      // Fetch the token symbol
      const symbol = await tokenContract.symbol();
      setTokenSymbol(symbol);
      console.log(`Token Symbol: ${symbol}`);
      
      // Fetch token balance for the curve contract
      const balance = await tokenContract.balanceOf(activeContract.target);
      const decimals = await tokenContract.decimals();
      
      // Format with proper decimals
      const formattedBalance = ethers.formatUnits(balance, decimals);
      setTokenBalance(formattedBalance);
      setUnformattedBalnce(balance.toString());
      console.log(`Token Balance: ${formattedBalance} ${symbol}`);
    } catch (error) {
      console.error('Error fetching token details:', error);
      // Keep defaults if there's an error
    }
  }, [activeContract, tokenAddress, provider]);

  // New function to fetch the total active redeem value
  const fetchTotalActiveRedeemValue = useCallback(async () => {
    if (!activeContract || !liquidityPoolTrackerContract) return;
    
    try {
      const redeemValue = await liquidityPoolTrackerContract.getTotalActiveRedeemValue(activeContract.target);
      const formattedRedeemValue = ethers.formatEther(redeemValue);
      setTotalActiveRedeemValue(formattedRedeemValue);
      console.log(`Total Active Redeem Value: ${formattedRedeemValue} ETH`);
    } catch (error) {
      console.error('Error fetching total active redeem value:', error);
      // Keep default if there's an error
      setTotalActiveRedeemValue('-');
    }
  }, [activeContract, liquidityPoolTrackerContract]);

  useEffect(() => {
    if (tokenAddress) {
      fetchTokenDetails();
    }
  }, [tokenAddress, fetchTokenDetails]);

  // Add useEffect to fetch redeem value when contracts are ready
  useEffect(() => {
    if (activeContract && liquidityPoolTrackerContract) {
      fetchTotalActiveRedeemValue();
    }
  }, [activeContract, liquidityPoolTrackerContract, fetchTotalActiveRedeemValue]);

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

  //https://popcurves.vercel.app/
  //http://localhost:3000
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

  const fetchContractData = useCallback(async () => {
    if (!activeContract || curveType === null) return;
    
    try {
      // Fetch expiry and initialization times
      const [expiry, startTime, balance] = await Promise.allSettled([
        activeContract.getExpireyTime(),
        activeContract.getCurveInitializedTime(),
        provider.getBalance(activeContract.target)
      ]);
  
      console.log('expiry:', expiry);
      console.log('startTime:', startTime); 
  
      let expiryNum: any;
      
      // Handle expiry time
      if (expiry.status === 'fulfilled') {
        expiryNum = Number(expiry.value.toString());
  
        setExpiryTime(formatBlockTimestamp(expiry.value.toString()));
  
        console.log('Curve expires at:', expiryNum.toString());
        console.log(`Formatted expiry time: ${formatBlockTimestamp(expiry.value.toString())}`);
      }
      
      // Handle start time
      if (startTime.status === 'fulfilled') {
        const startNum = Number(startTime.value.toString());
        setInitTimestamp(startNum);
        console.log(`Curve initialized at: ${formatBlockTimestamp(startNum.toString())}`);
  
        const tradingEndTime = expiryNum + startNum;
        const now = Math.floor(Date.now() / 1000);
        
        // Check if trading period is expired
        const isTradingExpired = tradingEndTime <= now;
        setIsExpired(isTradingExpired);
        
        // Set trading period countdown
        const timeUntilTradingEnds = tradingEndTime - now;
        const tradingEndTimestamp = timeUntilTradingEnds + now;
        console.log(`Time until trading ends: ${timeUntilTradingEnds}`);
        setExpiryTimestamp(tradingEndTimestamp);
  
        // Calculate duration if both times are available
        if (expiry.status === 'fulfilled') {
          const tradingDuration = tradingEndTime - now;
          console.log(`Trading duration: ${tradingDuration}`);
          console.log(`Formatted duration: ${formatDuration(tradingDuration)}`);
          setCurveDuration(tradingDuration);
          
          // Determine current period
          if (isTradingExpired) {
            // We need to fetch the redemption period duration
            try {
              // Fetch redemption period from token market contract
              if (contract) {
                const redeemTime = await contract.getRedeemTime();
                const redeemDuration = Number(redeemTime.toString());
                setRedeemPeriodDuration(redeemDuration);
                console.log(`Redemption period duration: ${redeemDuration}`);
                
                // Calculate when redemption period ends
                const redemptionEndTime = tradingEndTime + redeemDuration;
                const isFinalExpired = redemptionEndTime <= now;
                setIsFinallyExpired(isFinalExpired);
                
                // Set redemption countdown
                const timeUntilRedemptionEnds = redemptionEndTime - now;
                const redemptionEndTimestamp = timeUntilRedemptionEnds + now;
                setRedeemExpiryTimestamp(redemptionEndTimestamp);
                
                // Set current period status
                if (isFinalExpired) {
                  setCurrentPeriod('expired');
                } else {
                  setCurrentPeriod('redemption');
                }
              }
            } catch (error) {
              console.error('Error fetching redemption period:', error);
              // Default to a fixed redemption period if we can't fetch it
              const defaultRedeemDuration = 14 * 24 * 60 * 60; // 14 days
              setRedeemPeriodDuration(defaultRedeemDuration);
              
              // Calculate when redemption period ends with default duration
              const redemptionEndTime = tradingEndTime + defaultRedeemDuration;
              const isFinalExpired = redemptionEndTime <= now;
              setIsFinallyExpired(isFinalExpired);
              
              // Set redemption countdown
              const timeUntilRedemptionEnds = redemptionEndTime - now;
              const redemptionEndTimestamp = timeUntilRedemptionEnds + now;
              setRedeemExpiryTimestamp(redemptionEndTimestamp);
              
              // Set current period status
              if (isFinalExpired) {
                setCurrentPeriod('expired');
              } else {
                setCurrentPeriod('redemption');
              }
            }
          } else {
            setCurrentPeriod('trading');
          }
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
  }, [activeContract, curveType, provider, contract]);
  
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

      const ordersABI = require('../abi/orders.json');
      setOrdersAbi(ordersABI);
      
      const marketContractInstance = new ethers.Contract(tokenContractAddr, tokenMarketABI, signer);
      const profileContractInstance = new ethers.Contract(profileAddr, profileABI, signer);
      const createContractInstance = new ethers.Contract(createAccountAddr, createAccountABI, signer);
      const marketDataContractInstance = new ethers.Contract(marketDataAddr, marketDataABI, signer);
      const liquidityPoolTrackerInstance = new ethers.Contract(liquidityPoolTrackerAddr, liquidityPoolTrackerABI, signer);
      
      setContract(marketContractInstance);
      setProfileContract(profileContractInstance);
      setCreateContract(createContractInstance);
      setMarketDataContract(marketDataContractInstance);
      setLiquidityPoolTrackerContract(liquidityPoolTrackerInstance);

      // Fetch profile data
      if (profileContractInstance && params.username) {
        try {
          console.log(`Fetching profile for username: ${params.username}`);
          const profile = await profileContractInstance.getProfileByName(params.username);
          const nativeAddr = profile[0];
          const traderAcc = profile[1];
          const payouts = profile[5];

          console.log(`Profile data:`, payouts);
          
          setTraderAddress(nativeAddr);
          setStoreAddress(payouts);
          
          // Check active status
          const isClaimed = await profileContractInstance.isLaunchRegistered(nativeAddr);
          //setIsActive(isClaimed);
          
          // Set profile
          setProfile(profile);
          
          // Get token address and market cap if trader account exists
          if (traderAcc) {
            const tokenAddress = await marketContractInstance.getTokenAddressByAccount(traderAcc.toString());
            setTokenAddress(tokenAddress);
            console.log(`Loyalty Token Address: ${tokenAddress}`);
            
            // Get market cap
            const MCAP = await marketContractInstance.getMarketCap(traderAcc.toString());
            setMarketCap(ethers.formatEther(MCAP));

            const curveMarketCap = await activeContract?.getMarketCap();
            setCurveMarketCap(ethers.formatEther(curveMarketCap.toString()));
            console.log(`Curve Market Cap: ${curveMarketCap}`);
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
  }, [user, wallets, params.username, tokenContractAddr, profileAddr, createAccountAddr, marketDataAddr, liquidityPoolTrackerAddr]);

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
      
      {walletAddress && traderAddress && walletAddress.toLowerCase() === traderAddress.toLowerCase() ? (
  <button 
    className="text-sm font-medium px-3 py-1 rounded-full text-white bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:shadow-md transition-all duration-200"
    onClick={() => {
      // Replace this with:
      setIsEditModalOpen(true);
    }}
  >
    Edit Page
  </button>
) : (
  <span className={`
    text-sm font-medium px-3 py-1 rounded-full
    ${isActive 
      ? "text-green-700 bg-green-100/80" 
      : "text-pink-700 bg-pink-100/80"
    }
  `}>
    {isActive ? 'Active' : 'Inactive'}
  </span>
)}
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
              
              {/* Stats Section - Redesigned */}
<div className="w-full mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Time and Period Card */}
  <div className="bg-white/90 rounded-2xl shadow-sm border border-violet-100 p-4 flex flex-col items-center justify-center">
    <div className="flex items-center justify-between w-full mb-2">
      <h3 className="text-violet-800 font-bold text-sm uppercase tracking-wide">Status</h3>
      <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        currentPeriod === 'trading' ? 'bg-blue-100 text-blue-700' : 
        currentPeriod === 'redemption' ? 'bg-amber-100 text-amber-700' : 
        'bg-gray-100 text-gray-700'
      }`}>
        {isLoadingData ? "..." : 
         currentPeriod === 'trading' ? "Trading" : 
         currentPeriod === 'redemption' ? "Redemption" : 
         "Closed"}
      </div>
    </div>
    
    <div className="w-full">
      {isLoadingData ? (
        <div className="h-12 bg-gray-100 animate-pulse rounded-lg"></div>
      ) : currentPeriod === 'trading' && expiryTimestamp ? (
        <>
          <CountdownTimer 
            expiryTimestamp={expiryTimestamp}
            onExpire={() => {
              setIsExpired(true);
              setCurrentPeriod('redemption');
            }}
            totalDuration={curveDuration || undefined}
            showProgressBar={true}
          />
          <p className="text-xs text-center font-medium text-gray-600 mt-1">Trading Ends</p>
        </>
      ) : currentPeriod === 'redemption' && redeemExpiryTimestamp ? (
        <>
          <CountdownTimer 
            expiryTimestamp={redeemExpiryTimestamp}
            onExpire={() => {
              setIsFinallyExpired(true);
              setCurrentPeriod('expired');
            }}
            totalDuration={redeemPeriodDuration || undefined}
            showProgressBar={true}
          />
          <p className="text-xs text-center font-medium text-gray-600 mt-1">Redemption Ends</p>
        </>
      ) : (
        <div className="text-center py-3">
          <p className="text-lg font-bold text-red-700">Expired</p>
          <p className="text-xs font-medium text-gray-600">All Periods Ended</p>
        </div>
      )}
    </div>
    
    {/* Restriction indicator */}
    {restricted && !isLoadingData && (
      <div className="mt-2 bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
        No Selling
      </div>
    )}
  </div>

  {/* Curve Info Card */}
  <div className="bg-white/90 rounded-2xl shadow-sm border border-violet-100 p-4">
    <h3 className="text-violet-800 font-bold text-sm uppercase tracking-wide mb-2">Market Details</h3>
    
    <div className="grid grid-cols-2 gap-4">
      {/* Curve Type */}
      <div className="flex flex-col">
        <p className="text-xs font-medium text-gray-600 mb-1">Store Type</p>
        <p className="text-lg font-bold text-violet-700">
          {isLoadingData ? (
            <span className="h-6 w-16 bg-gray-100 animate-pulse rounded inline-block"></span>
          ) : (
            curveType === 1 ? "Closed" : curveType === 2 ? "Open" : ""
          )}
        </p>
      </div>
      
      {/* Items on Curve */}
      <div className="flex flex-col">
        <p className="text-xs font-medium text-gray-600 mb-1">Items on Curve</p>
        <p className="text-lg font-bold text-violet-700">
          {isLoadingData ? (
            <span className="h-6 w-16 bg-gray-100 animate-pulse rounded inline-block"></span>
          ) : (
            itemsOnCurve
          )}
        </p>
      </div>
      
      {/* Curve Liquidity */}
      <div className="flex flex-col">
        <p className="text-xs font-medium text-gray-600 mb-1">Store Liquidity</p>
        {isLoadingData ? (
          <span className="h-6 w-16 bg-gray-100 animate-pulse rounded inline-block"></span>
        ) : (
          <>
            <p className="text-lg font-bold text-violet-700">
              ${(Number(contractBalance) * ethUsdPrice).toLocaleString(undefined, {maximumFractionDigits: 2})}
            </p>
            <p className="text-xs text-gray-500">
              {Number(contractBalance).toFixed(4)} ETH
            </p>
          </>
        )}
      </div>
      
      {/* Curve MCAP */}
      <div className="flex flex-col">
        <p className="text-xs font-medium text-gray-600 mb-1">Collection MCAP</p>
        {isLoadingData ? (
          <span className="h-6 w-16 bg-gray-100 animate-pulse rounded inline-block"></span>
        ) : (
          <>
            <p className="text-lg font-bold text-violet-700">
              ${(Number(curveMarketCap) * ethUsdPrice).toLocaleString(undefined, {maximumFractionDigits: 2})}
            </p>
            <p className="text-xs text-gray-500">
              {Number(curveMarketCap).toFixed(4)} ETH
            </p>
          </>
        )}
      </div>
    </div>
  </div>

  {/* Token Details Card */}
  <div className="bg-white/90 rounded-2xl shadow-sm border border-violet-100 p-4">
    <h3 className="text-violet-800 font-bold text-sm uppercase tracking-wide mb-2">Token Details</h3>
    
    <div className="grid grid-cols-2 gap-4">
      {/* Token Balance */}
      <div className="flex flex-col">
        <p className="text-xs font-medium text-gray-600 mb-1">${tokenSymbol} Balance</p>
        {isLoadingData ? (
          <span className="h-6 w-16 bg-gray-100 animate-pulse rounded inline-block"></span>
        ) : (
          <div>
            <p className="text-lg font-bold text-violet-700">
              {Number(tokenBalance).toLocaleString(undefined, {maximumFractionDigits: 0})}
            </p>
            <p className="text-xs text-emerald-600 font-medium">2% on Redeem</p>
          </div>
        )}
      </div>
      
      {/* Store MCAP */}
      <div className="flex flex-col">
        <p className="text-xs font-medium text-gray-600 mb-1">${tokenSymbol} MCAP</p>
        {isLoadingData ? (
          <span className="h-6 w-16 bg-gray-100 animate-pulse rounded inline-block"></span>
        ) : (
          <>
            <p className="text-lg font-bold text-violet-700">
              ${(Number(marketCap) * ethUsdPrice).toLocaleString(undefined, {maximumFractionDigits: 2})}
            </p>
            <p className="text-xs text-gray-500">
              {Number(marketCap).toFixed(4)} ETH
            </p>
          </>
        )}
      </div>
      
      {/* Redeem Value */}
      <div className="flex flex-col col-span-2">
        <p className="text-xs font-medium text-gray-600 mb-1">Total Active Redeem Value</p>
        {isLoadingData ? (
          <span className="h-6 w-16 bg-gray-100 animate-pulse rounded inline-block"></span>
        ) : (
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-bold text-violet-700">
              ${(Number(totalActiveRedeemValue) * ethUsdPrice).toLocaleString(undefined, {maximumFractionDigits: 2})}
            </p>
            <p className="text-xs text-gray-500">
              {Number(totalActiveRedeemValue).toFixed(4)} ETH
            </p>
          </div>
        )}
      </div>
    </div>
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

          {/* Edit Launch Modal */}
          <EditLaunch
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            contractAddress={activeAddress}
            activeContract={activeContract}
            signer={signer}
            onUpdateSuccess={handleSettingUpdated}
          />
    
          {/* NFT Marketplace Section */}
          <NFTMarketplace 
            nftContract={nftTokenAddress}
            curveContract={contractAddress}
            userAddress={walletAddress}
            useContractData={false}
            storeAddress={storeAddress}
            provider={provider}
            activeContract={activeContract}
            launchContract={launchContract}
            openContract={openContract}
            curveType={curveType}
            signer={signer}
            pageLink={pageLink}
            expired={isExpired}
            isAffiliate={isAffiliate}
            affiliateAddress={affiliateAddress}
            finallyExpired={isFinallyExpired}
            currentPeriod={currentPeriod}
            redeemValue={totalActiveRedeemValue}
          />

          <MyInventory
            nftContract={nftTokenAddress}
            curveContract={contractAddress}
            userAddress={walletAddress}
            useContractData={false}
            activeContract={activeContract}
            signer={signer}
            marketData={marketDataContract}
            sellingRestricted={restricted}
            isExpired={isExpired}
            finallyExpired={isFinallyExpired}
            currentPeriod={currentPeriod}
            curveType={curveType}
            trackingContract={liquidityPoolTrackerContract}
            ordersAbi={ordersAbi}
            curveLiqudity={contractBalance}
            contractBalance={unformattedBalance}
            loyaltyName={tokenSymbol}
          />

        {lastUpdatedSetting && (
          <div className="fixed bottom-4 right-4 bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-xl shadow-lg z-50 animate-fade-in-up">
          <p className="flex items-center">
          <span className="mr-2">✅</span>
            {lastUpdatedSetting === 'whitelist' && 'Whitelist updated successfully'}
            {lastUpdatedSetting === 'trading' && 'Trading status update requested'}
            {lastUpdatedSetting === 'deliveryTime' && 'Expected delivery time updated'}
          <button 
            onClick={() => setLastUpdatedSetting(null)}
            className="ml-3 text-green-700 hover:text-green-900"
          >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          </button>
          </p>
        </div>
      )}
  
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
                  storePayouts={storeAddress}
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
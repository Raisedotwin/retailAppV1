"use client";

import React, { useState, Suspense, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation'; // Use this to access query parameters
import { EIP155_CHAINS } from '@/data/EIP155Data';
import { ethers, Contract } from 'ethers';
import { getEmbeddedConnectedWallet, usePrivy,   useWallets  } from '@privy-io/react-auth'; 
import Image from 'next/image';
import { formatBlockTimestamp } from '../utils/timestamp';
import NFTMarketplace from '../componants/NFTMarketplace';
import AffiliateLink from '../componants/AffiliateLink';
import AffiliateDashboard from '../componants/AffiliateDashboard';
import MyInventory from '../componants/MyInventory';

const TraderPageContent: React.FC = () => {
  const searchParams = useSearchParams(); // Access the query parameters
  // Extracting the query parameters from the searchParams object

  const nftContractABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function totalSupply() view returns (uint256)",
    "function getOwner(uint256 _tokenId) external view returns (address)",
    "function getBaseValue(uint256 tokenId) external view returns (uint256)"
  ];

  const [isAffiliate, setIsAffiliate] = useState(false);
  const [affiliateAddress, setAffiliateAddress] = useState<string | null>(null);

  // Extracting the query parameters from the searchParams object
  const name = searchParams.get('name');
  const logo = searchParams.get('logo');
  const username = searchParams.get('username');
  const contractAddress = searchParams.get('contractAddress'); // Add this line

  let rpcURL = EIP155_CHAINS["eip155:84532"].rpc;

  const provider  = useMemo(() => new ethers.JsonRpcProvider(rpcURL), [rpcURL]);

  //const provider = useMemo(() => new ethers.BrowserProvider(window.ethereum), []);

  const tokenContractAddr = '0xA832df5A5Ff0D436eCE19a38E84eB92faC380566';
  const tokenMarketABI = require('../abi/tokenMarket.json');

  const marketDataAddr = '0x9baed514ed5AB1B13B6A4d05249C8F9f30EdF15E';
  const marketDataABI = require("../abi/marketdata.json");

  const createAccountAddr = '0x828ba1E00bA1f774CB25943Ef4aAF4874D10D374';
  const createAccountABI = require("../abi/createAccount.json");

  const profileAddr = '0xA07Dc7B3d8cD9CE3a75237ed9E1b007932AA45Fb';
  const profileABI = require("../abi/profile.json");

  const [activeModalTab, setActiveModalTab] = useState<'activity' | 'topHolders' | 'tradingActivity' | 'shorts' | 'affiliate' | 'affiliateDashboard'>('affiliate');
  const [traderProfileExists, setTraderProfileExists] = useState(false);

  const whitelist = require("../abi/BETAWhitelist.json");
  const whitelistAddr = '0x006D6af7d1B2FdD222b43EaaBFE252579B539322';

  const launchABI = require("../abi/launch");
  const openABI = require("../abi/open");
  
  const whitelistContract = useMemo(() => new ethers.Contract(whitelistAddr, whitelist, provider), [whitelistAddr, whitelist, provider]);

  // Setting default values or using the query parameters
  // Setting default values or using the query parameters
const [params] = useState({
  name: name ? name : 'Trader',
  logo: logo ? logo : 'https://via.placeholder.com/150',
  username: username ? username : 'username',
  contractAddress: contractAddress ? contractAddress : '0x899dDFe1CDc28dE88eff62Efa7894D68a53E5EEC', // Add this line
});

const checkForAffiliateLink = (params: URLSearchParams): { isAffiliate: boolean; affiliateAddress: string | null } => {
  // Check if the URL contains a ref parameter
  const refAddress = params.get('ref');
  
  // Validate that it's a proper Ethereum address (basic check)
  const isValidEthAddress = refAddress && /^0x[a-fA-F0-9]{40}$/.test(refAddress);
  
  return {
    isAffiliate: !!isValidEthAddress,
    affiliateAddress: isValidEthAddress ? refAddress : null
  };
};

// Add the pageLink here
const pageLink = useMemo(() => {
  return `http://localhost:3000//trader?name=${params.name}&logo=${params.logo}&username=${params.username}&contractAddress=${params.contractAddress}`;
}, [params.name, params.logo, params.username, params.contractAddress]);

  const [contract, setContract] = useState<Contract | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [profileContract, setProfileContract] = useState<Contract | null>(null);
  const [createContract, setCreateContract] = useState<Contract | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState(''); 

  const [marketDataContract, setMarketDataContract] = useState<Contract | null>(null);
  const [balance, setBalance] = useState('0');
  const [marketCap, setMarketCap] = useState('0');
  const [tokenAddress, setTokenAddress] = useState('');
  const [traderAddress, setTraderAddress] = useState('');
  const { user } = usePrivy();
  const { wallets } = useWallets(); // Use useWallets to get connected wallets
  const [isActive, setIsActive] = useState(false); // You can control this state as needed
  const [profile, setProfile] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [createUserWhitelistEnabled, setCreateUserWhitelistEnabled] = useState(false);
  const [isUserWhitelisted, setIsUserWhitelisted] = useState(false);
  const [curveType, setCurveType] = useState<number | null>(null);
  const [activeContract, setActiveContract] = useState<Contract | null>(null);
  const [expiryTime, setExpiryTime] = useState<string>('');
  const [activeAddress, setActiveAddress] = useState<any>('');
  const [redeemTime, setRedeemTime] = useState<string>('');
  const [itemsOnCurve, setItemsOnCurve] = useState<string>('');
  const [contractBalance, setContractBalance] = useState<string>('');

  const [nftTokenAddress, setNftTokenAddress] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  let wallet: any = wallets[0] // Get the first connected wallet privy wallet specifiy privy wallet

// Add new whitelist checking function
const checkTraderWhitelist = async (username: string | undefined): Promise<boolean> => {
  if (!whitelistContract || !username) return false;
  try {
    const isWhitelisted = await whitelistContract.isUsernameWhitelisted(username);
    return isWhitelisted;
  } catch (error) {
    console.error('Error checking trader whitelist status:', error);
    return false;
  }
};

const fetchNFTTokenAddress = async () => {
  try {
    const contract = curveType === 1 ? launchContract : openContract;
    if (!contract) {
      console.error('Contract not initialized');
      return;
    }

    const tokenAddress = await contract.getNFTAddress();
    console.log('NFT Token Address:', tokenAddress);
    setNftTokenAddress(tokenAddress);

    const contractNFT = new ethers.Contract(tokenAddress, nftContractABI, signer);
            
    const balance = await contractNFT.balanceOf(activeContract?.target);
    setItemsOnCurve(balance.toString());
    console.log('NFT Balance:', balance.toString());
    

  } catch (error) {
    console.error('Error fetching NFT token address:', error);
  }
};

// use signer instead of provider
const openContract = useMemo(() => {
  if (params.contractAddress) {
    return new ethers.Contract(params.contractAddress, openABI, provider);
  }
  return null;
}, [params.contractAddress, openABI, provider]);

const launchContract = useMemo(() => {
  if (params.contractAddress) {
    return new ethers.Contract(params.contractAddress, launchABI, provider);
  }
  return null;
}, [params.contractAddress, launchABI, provider]);

const checkCurveType = async () => {
  try {
    // Try open contract first
    try {
      const type = await openContract?.getCurveType();
      if (type) {
        console.log('Open contract curve type:', type);
        setCurveType(Number(type));
        setActiveContract(openContract);
        setActiveAddress(openContract?.target);
        return;
      }
    } catch (error) {
      console.log('Not an open contract, trying launch contract');
    }

    // Try launch contract if open contract fails
    try {
      const type = await launchContract?.getCurveType();
      if (type) {
        console.log('Launch contract curve type:', type);
        setCurveType(Number(type));
        setActiveContract(launchContract);
        return;
      }
    } catch (error) {
      console.log('Not a launch contract either');
    }

    console.log('Could not determine curve type');
    setCurveType(null);
  } catch (error) {
    console.error('Error checking curve type:', error);
    setCurveType(null);
  }
};

useEffect(() => {
  const initContract = async () => {
    try {

      await checkCurveType();
      console.log('Curve type:', curveType);
      console.log('Active contract:', activeContract);
      console.log('Active contract address:', activeContract?.address);
      console.log('Active contract signer:', contractAddress);

      if (activeContract?.target) {
        try {
          console.log('active contract:', activeContract);  

          const expiry = await activeContract.getExpireyTime();
          const formattedExpiry = formatBlockTimestamp(expiry.toString());
          setExpiryTime(formattedExpiry);
          console.log('Expiry time:', expiry);

          const balance = await provider.getBalance(activeContract?.target);
          const formattedBalance = ethers.formatEther(balance);
          setContractBalance(formattedBalance);
          console.log('Contract balance:', formattedBalance, 'ETH');

        } catch (error) {
          console.error('Error fetching time data:', error);
          setExpiryTime('N/A');
          setRedeemTime('N/A');
        }
      }

      await fetchNFTTokenAddress();
      console.log('NFT Token Address:', nftTokenAddress);

      // Wallet setup
      if(user?.twitter?.username) {
        let embeddedWallet = getEmbeddedConnectedWallet(wallets);
        let privyProvider = await embeddedWallet?.address;
        wallet = wallets.find((wallet) => wallet.address === privyProvider);
      }

      // Provider and contract setup
      await getPrivyProvider("base-sepolia");
      const privyProvider = await wallet?.getEthersProvider();
      const signer: any = privyProvider?.getSigner();
      setSigner(signer);

      // Add whitelist check
      if (createUserWhitelistEnabled && username) {
          const whitelisted = await checkTraderWhitelist(username as string);
        setIsUserWhitelisted(whitelisted);
        }

      // Initialize contracts
      const marketContractInstance = new ethers.Contract(tokenContractAddr, tokenMarketABI, signer);
      setContract(marketContractInstance);
      const profileContractInstance = new ethers.Contract(profileAddr, profileABI, signer);
      setProfileContract(profileContractInstance);
      const createContractInstance = new ethers.Contract(createAccountAddr, createAccountABI, signer);
      setCreateContract(createContractInstance);
      const marketDataContractInstance = new ethers.Contract(marketDataAddr, marketDataABI, signer);
      setMarketDataContract(marketDataContractInstance);

      const address = await signer?.getAddress();
      setWalletAddress(address);

      if (profileContractInstance) {
        try {
          const profile = await profileContractInstance.getProfileByName(username as string);
          const nativeAddr = profile[0];
          const traderAcc = profile[1];
          setTraderAddress(nativeAddr); 
          
          console.log('Profile address:', nativeAddr);

          const isClaimed = await profileContractInstance.isLaunchRegistered(nativeAddr);
          setIsActive(isClaimed);
          
          // Check if trader profile exists
          const profileExists = traderAcc !== "0" && traderAcc !== undefined;
          console.log('Profile exists:', profileExists);
          setTraderProfileExists(profileExists);

          if (profileExists) {
            setProfile(profile);

            // Get token details
            const tokenAddress = await marketContractInstance.getTokenAddressByAccount(traderAcc.toString());
            setTokenAddress(tokenAddress);

            // Get market data
            const MCAP = await marketContractInstance.getMarketCap(traderAcc.toString());
            setMarketCap(ethers.formatEther(MCAP));
            //setMarketCap(ethers.formatUnits(MCAP, 6));
            //setMarketCap(MCAP.toString());
            console.log('Market Cap:', ethers.formatEther(MCAP));

          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    } catch (error) {
      console.error('Error initializing contracts:', error);
    }
  };

  initContract();
}, [user, username, wallets, whitelistContract, createUserWhitelistEnabled]);

  // Add this effect to check if user is logged in and show modal if needed
  useEffect(() => {
    // Check if wallet is connected
    const checkWalletConnection = async () => {
      if (user && wallets && wallets.length > 0) {
        setIsLoggedIn(true);
        console.log('User is logged in');
      } else {
        setIsLoggedIn(false);
        setShowLoginModal(true);
        console.log('User is not logged in');
      }
    };
    
    checkWalletConnection();
  }, [user, wallets]);

  useEffect(() => {
    const { isAffiliate, affiliateAddress } = checkForAffiliateLink(searchParams);
    setIsAffiliate(isAffiliate);
    setAffiliateAddress(affiliateAddress);
    
    if (isAffiliate) {
      console.log('Affiliate link detected!', { affiliateAddress });
      // You could track this event for analytics purposes
    }
  }, [searchParams]);
  
  const getPrivyProvider = async (chainName: string) => {
    if (!wallet) {
      console.error("Wallet not initialized");
      return null;
    }

    let chainId: number;

    switch (chainName.toLowerCase()) {
      case "avax":
        chainId = 43114;  // Example chain ID for Avalanche C-Chain
        break;
      case "base":
        chainId = 8453;  // Hypothetical chain ID for Base, adjust accordingly
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
      {/* Enhanced Background - Replacing the complex linear-gradient and SVG pattern */}
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
      {!user || !wallets || wallets.length === 0 ? (
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
        {/* Enhanced Profile Header Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-md p-8 mb-8">
          <div className="flex flex-wrap items-start md:items-center gap-8">
            {/* Avatar Section - Enhanced with Square Design */}
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-lg opacity-50 blur-sm"></div>
              <Image 
                //src={params.logo}
                src="https://pbs.twimg.com/profile_images/1853556885850361856/fDeK9VyY.jpg"
                className="w-28 h-28 rounded-lg shadow-md border-4 border-white relative"
                alt={params.name}
                width={65}
                height={65}
              />
              <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                isActive ? 'bg-green-400' : 'bg-pink-400'
              }`} />
            </div>
  {/* Enhanced NAME and ADDRESSES Sections */}
<div className="flex-grow min-w-0 bg-gradient-to-r from-violet-50 to-fuchsia-50 p-4 rounded-xl border border-violet-100">
  <div className="flex items-center gap-3 mb-2">
    <h2 className="text-xl font-bold text-violet-700 truncate">{params.name}</h2>
    {/* Enhanced X Logo */}
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
  
            {/* Enhanced Stats Section */}
            <div className="w-full md:w-auto mt-6 md:mt-0 grid grid-cols-7 gap-4 bg-gradient-to-r from-fuchsia-50 to-violet-50 p-4 rounded-xl border border-violet-100">
              <div className="text-center px-4">
                <p className="text-lg font-bold text-violet-700">{Number(expiryTime).toFixed(4)} ETH</p>
                <p className="text-xs font-medium text-gray-600">Expires</p>
              </div>
              <div className="text-center px-4">
                <p className="text-lg font-bold text-violet-700">{contractBalance}</p>
                <p className="text-xs font-medium text-gray-600">LIQ</p>
              </div>
              <div className="text-center px-4">
                <p className="text-lg font-bold text-violet-700">{curveType === 1 ? "Closed" : curveType === 2 ? "Open" : ""}</p>
                <p className="text-xs font-medium text-gray-600">Curve Type</p>
              </div>
              <div className="text-center px-4">
                <p className="text-lg font-bold text-violet-700">
                  {Number(marketCap).toFixed(3)} ETH
                </p>
                <p className="text-xs font-medium text-gray-600">Curve MCAP</p>

              </div>
              <div className="text-center px-4">
                <p className="text-lg font-bold text-violet-700">
                  {Number(balance).toFixed(3)} ETH
                </p>
                <p className="text-xs font-medium text-gray-600">Loyalty MCAP</p>
              </div>
              <div className="text-center px-4">
                <p className="text-lg font-bold text-violet-700">{itemsOnCurve}</p>
                <p className="text-xs font-medium text-gray-600">Items</p>
              </div>
              <div className="text-center px-4">
                <p className="text-lg font-bold text-violet-700">{itemsOnCurve} ETH</p>
                <p className="text-xs font-medium text-red-600">LIQ Must Reach</p>

              </div>
            </div>
          </div>
        </div>
  
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
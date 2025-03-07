"use client";

import React, { useState, Suspense, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation'; // Use this to access query parameters
import { EIP155_CHAINS } from '@/data/EIP155Data';
import { ethers, Contract } from 'ethers';
import { Avatar } from '@nextui-org/react';
import { getEmbeddedConnectedWallet, usePrivy,   useWallets  } from '@privy-io/react-auth'; 
import Image from 'next/image';
import AddressDisplay from '../componants/AddressDisplay';
import { formatBlockTimestamp } from '../utils/timestamp';
import NFTMarketplace from '../componants/NFTMarketplace';
import ShippingModal from '../componants/ShippingDetailsModal';
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

  const tokenPoolABI = require("../abi/traderPool");

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

  const optionsContractAddr = '0x0711333aa94E4f32B62C6dfD04c6E3CD79815883'; // Update with your contract address
  const optionsABI = require("../abi/shorts");

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

  // State for active tab
  const [activeTab, setActiveTab] = useState('buy');
  const [amount, setAmount] = useState('1');
  const [buyPrice, setBuyPrice] = useState('0');
  const [sellPrice, setSellPrice] = useState('0');
  const [contract, setContract] = useState<Contract | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [profileContract, setProfileContract] = useState<Contract | null>(null);
  const [createContract, setCreateContract] = useState<Contract | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState(''); 
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);

  const [marketDataContract, setMarketDataContract] = useState<Contract | null>(null);
  const [price, setPrice] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [marketCap, setMarketCap] = useState('0');
  const [raiseWalletAddress, setRaiseWalletAddress] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [traderAddress, setTraderAddress] = useState('');
  const { user } = usePrivy();
  const { wallets } = useWallets(); // Use useWallets to get connected wallets
  const [isActive, setIsActive] = useState(false); // You can control this state as needed
  const [profile, setProfile] = useState<any>(null);
  const [needsInitialization, setNeedsInitialization] = useState(false);
  const [optionsContract, setOptionsContract] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [inactiveTraderDisabled, setInactiveTraderDisabled] = useState(false);
  const [createUserWhitelistEnabled, setCreateUserWhitelistEnabled] = useState(false);
  const [isUserWhitelisted, setIsUserWhitelisted] = useState(false);
  const [curveType, setCurveType] = useState<number | null>(null);
  const [activeContract, setActiveContract] = useState<Contract | null>(null);
  const [expiryTime, setExpiryTime] = useState<string>('');
  const [redeemTime, setRedeemTime] = useState<string>('');
  const [itemsOnCurve, setItemsOnCurve] = useState<string>('');
  const [nftFormData, setNftFormData] = useState({
    amount: '',
    name: '',
    description: '',
    itemPhoto: '',
    weightClass: '',
    category: '',
    size: '',
    link: '',
    baseValue: '',
    baseRedeem: '' // Only used for open curve
  });
  const [nftTokenAddress, setNftTokenAddress] = useState<string>('');
  const [disableOptionMarket] = useState(true); // Set to true to show placeholder, false to show options panel
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  //const nftContractAddr = '0x...'; // Add your NFT contract address
  //const nftABI = require("../abi/shorts.json");
  //const curveContractAddr = '0x...'; // Add your curve contract address
  //const curveABI = require("../abi/shorts.json");

  //const nftContractInstance = new ethers.Contract(nftContractAddr, nftABI, signer);
  //setNftContract(whitelistContract);
  //const curveContractInstance = new ethers.Contract(curveContractAddr, curveABI, signer);
  //setCurveContract(whitelistContract);

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
            
    const balance = await contractNFT.balanceOf(activeContract?.address);
    setItemsOnCurve(balance.toString());
    console.log('NFT Balance:', balance.toString());
    

  } catch (error) {
    console.error('Error fetching NFT token address:', error);
  }
};

const updatePrices = async () => {
    if (contract && profileContract && amount && !isNaN(Number(amount))) {
      try {
        const profile = await profileContract.getProfileByName(username as string);
        if (profile && profile[1] !== "0") {
          const userAcc = profile[1];
  
          // First get the token address
          try {
            const tokenAddress = await contract.getTokenAddressByAccount(userAcc.toString());
            
            // Verify we have a valid token address
            if (tokenAddress === "0x0000000000000000000000000000000000000000") {
              console.error('Invalid token address');
              return;
            }
  
            // Only proceed with price calculation if we have a valid amount
            if (parseFloat(amount) > 0) {
              // Convert amount to Wei before sending to contract
              const amountInWei = ethers.parseEther(amount); //the issue is we dont convert this to wei on selling
   
              try {
                // Get buy price with retry mechanism
                //const buyPriceWei = await contract.getBuyPriceAfterFee(tokenAddress, amountInWei);
                //if (buyPriceWei.toString() !== "0") {
                  //setBuyPrice(ethers.formatEther(buyPriceWei));
                //}

                if(activeTab === 'buy') {



                  let buyPriceWei = await contract.getNumberOfTokensForAmount(userAcc, amountInWei)
                  if (buyPriceWei.toString() !== "0") {
                    setBuyPrice(ethers.formatEther(buyPriceWei));
                    console.log(buyPriceWei.toString())
                  }

                 } 
                 
                 if (activeTab === 'sell') {

                  // Get sell price with retry mechanism
                  let sellPriceWei = await contract.getSellPriceAfterFee(tokenAddress, amountInWei)
                  if (sellPriceWei.toString() !== "0") {
                    setSellPrice(ethers.formatEther(sellPriceWei));
                    console.log(sellPriceWei.toString())
                  }

                 }

           
                // const sellPriceWei = await contract.getNumberOfTokensForAmount(userAcc, amountInWei);
                //if (sellPriceWei.toString() !== "0") {
                //setSellPrice(ethers.formatEther(sellPriceWei));

                //}
              } catch (priceError) {
                console.error('Error calculating prices:', priceError);
                // Don't reset prices here to maintain persistence
              }

            }
          } catch (tokenError) {
            console.error('Error getting token address:', tokenError);
            // Don't reset prices here to maintain persistence
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Don't reset prices here to maintain persistence
      }
    }
  };

// Add near the other contract declarations
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
  if (amount && !isNaN(Number(amount))) {
    updatePrices();
  }
}, [amount]);

const [isPriceLoading, setIsPriceLoading] = useState(false);

useEffect(() => {
  const initContract = async () => {
    try {

      await checkCurveType();
      console.log('Curve type:', curveType);
      console.log('Active contract:', activeContract);
      console.log('Active contract address:', activeContract?.address);
      console.log('Active contract signer:', contractAddress);

      if (activeContract?.address) {
        try {
          console.log('active contract:', activeContract);  

          const expiry = await activeContract.getExpireyTime();
          const formattedExpiry = formatBlockTimestamp(expiry.toString());
          setExpiryTime(formattedExpiry);
          console.log('Expiry time:', expiry);

          // For open curves, get separate redeem time
          if (curveType === 2) { // Open curve
            const redeem = await activeContract.getRedeemTime();
            const formattedRedeem = formatBlockTimestamp(redeem.toString());
            setRedeemTime(formattedRedeem);
            console.log('Redeem time:', formattedRedeem);
          } else { // For closed curves, use expiry time for both
            setRedeemTime(formattedExpiry);
            console.log('Redeem time:', formattedExpiry);
          }
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
      const optionsContractInstance = new ethers.Contract(optionsContractAddr, optionsABI, signer);
      setOptionsContract(optionsContractInstance);

      const address = await signer?.getAddress();
      setWalletAddress(address);

      if (username && profileContractInstance) {
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

            //check curve initialization
            if (tokenAddress && tokenAddress == "0x0000000000000000000000000000000000000000") {
              setNeedsInitialization(true);
            }

            // Get market data
            const MCAP = await marketContractInstance.getMarketCap(traderAcc.toString());
            setMarketCap(ethers.formatEther(MCAP));
            //setMarketCap(ethers.formatUnits(MCAP, 6));
            //setMarketCap(MCAP.toString());

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

  const handleSellShares = async () => {
    if (contract && profileContract) {
      let accNum;
      let tokenAddress;
      try {
        const profile = await profileContract.getProfileByName(username as string);
        if (profile.accountNumber != 0 && profile.userAddress !== "0x0000000000000000000000000000000000000000") {
          accNum = profile[1];
          try {
            tokenAddress = await contract.getTokenAddressByAccount(accNum.toString());
          } catch (error) {
            console.error('Error fetching token address:', error);
            return;
          }
        } else {
          alert('Account does not exist');
          return;
        }
  
        // Create token contract instance for approval
        const tokenABI = ["function approve(address spender, uint256 amount) public returns (bool)"];
        const tokenContract = new ethers.Contract(tokenAddress, tokenABI, contract.runner);
   
        try {
          setModalMessage('Approving token transfer');
          setIsModalVisible(true);
  
          // Convert amount to Wei for approval
          const amountInWei = ethers.parseEther(amount);
          
          // Approve the token market contract to spend tokens
          const approveTx = await tokenContract.approve(tokenContractAddr, amountInWei);
          
          // Wait for the transaction to be mined and get the receipt
          setModalMessage('Waiting for approval confirmation...');
          const approvalReceipt = await provider.waitForTransaction(approveTx.hash, 1); // Wait for 1 confirmation
          
          if (approvalReceipt?.status === 1) {  // 1 indicates success
            setModalMessage('Approval confirmed. Initiating sale...');
            
            // Get sell price after approval
            const price = await contract.getSellPriceAfterFee(tokenAddress, amountInWei);
            setPrice(ethers.formatEther(price));
            
            // Execute sell transaction immediately after approval confirmation
            const sellTx = await contract.sellShares(accNum, amountInWei);
            
            setModalMessage('Waiting for sale confirmation...');
            const sellReceipt = await provider.waitForTransaction(sellTx.hash, 1); // Wait for 1 confirmation
            
            if (sellReceipt?.status === 1) {
              setModalMessage('Sale completed successfully');
            } else {
              setModalMessage('Sale transaction failed');
            }
          } else {
            setModalMessage('Approval transaction failed');
          }
          
          setTimeout(() => setIsModalVisible(false), 2000);
  
        } catch (error) {
          console.error('Error during sell process:', error);
          setModalMessage(`Transaction failed: ${error}`);
          setTimeout(() => setIsModalVisible(false), 2000);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setModalMessage('Transaction failed');
        setTimeout(() => setIsModalVisible(false), 2000);
      }
    } else {
      alert('Contract not initialized');
    }
  };

  const handleShippingSubmit = async (shippingDetails: any, isExpedited: boolean) => {
    setIsShippingModalOpen(false);
    // Store shipping details or process them as needed
    console.log('Shipping Details:', shippingDetails);
    console.log('Expedited:', isExpedited);
    // Proceed with the blockchain transaction
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
              <Avatar 
                src={params.logo}
                className="w-16 h-16 rounded-lg shadow-md border-4 border-white relative"
              />
              <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                isActive ? 'bg-green-400' : 'bg-pink-400'
              }`} />
            </div>
  
            {/* Enhanced Name and Details Section */}
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
            </div>
  
            {/* Enhanced Stats Section */}
            <div className="w-full md:w-auto mt-6 md:mt-0 grid grid-cols-7 gap-4 bg-gradient-to-r from-fuchsia-50 to-violet-50 p-4 rounded-xl border border-violet-100">
              <div className="text-center px-4">
                <p className="text-lg font-bold text-violet-700">{expiryTime}</p>
                <p className="text-xs font-medium text-gray-600">Time Until Expiry</p>
              </div>
              <div className="text-center px-4">
                <p className="text-lg font-bold text-violet-700">{redeemTime}</p>
                <p className="text-xs font-medium text-gray-600">Time Until Redeem</p>
              </div>
              <div className="text-center px-4">
                <p className="text-lg font-bold text-violet-700">{curveType === 1 ? "Closed" : curveType === 2 ? "Open" : ""}</p>
                <p className="text-xs font-medium text-gray-600">Curve Type</p>
              </div>
              <div className="text-center px-4">
                <p className="text-lg font-bold text-violet-700">
                  {Number(marketCap).toFixed(3)} ETH
                </p>
                <p className="text-xs font-medium text-gray-600">Curve Marketcap</p>
              </div>
              <div className="text-center px-4">
                <p className="text-lg font-bold text-violet-700">
                  {Number(balance).toFixed(3)} ETH
                </p>
                <p className="text-xs font-medium text-gray-600">Loyalty Marketcap</p>
              </div>
              <div className="text-center px-4">
                <p className="text-lg font-bold text-violet-700">{itemsOnCurve}</p>
                <p className="text-xs font-medium text-gray-600">Items On Curve</p>
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

        <br />



        <MyInventory
            nftContract={nftTokenAddress}
            curveContract={contractAddress}
            userAddress={walletAddress}
            useContractData={false}
            activeContract={activeContract}
            signer={signer}
            marketData={marketDataContract}
        />
  
        <br />
  
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Trading Panel - Fun Modern Styling */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-4">
              <h2 className="text-xl font-bold text-white text-center">Shop Items</h2>
            </div>
            <div className="p-6">
              {/* Trading Tabs - Enhanced */}
              <div className="flex justify-between mb-6 bg-gray-100/70 rounded-2xl p-1">
                <button
                  className={`flex-1 py-3 text-lg font-medium rounded-xl transition-all duration-200 ${
                  activeTab === 'buy'
                    ? 'bg-white text-violet-600 shadow-sm'
                    : 'text-gray-600 hover:text-violet-600'
                  }`}
                  onClick={() => setActiveTab('buy')}
                >
                  Redeem
                </button>
                <button
                  className={`flex-1 py-3 text-lg font-medium rounded-xl transition-all duration-200 ${
                  activeTab === 'sell'
                    ? 'bg-white text-violet-600 shadow-sm'
                    : 'text-gray-600 hover:text-violet-600'
                  }`}
                  onClick={() => setActiveTab('sell')}
                >
                  Sell
                </button>
              </div>
              {activeTab === 'buy' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {traderProfileExists ? `Redeem ${params.username}` : 'Create New Item'}
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {traderProfileExists ? 'Quantity' : 'Initial Creation Amount'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.000000000000000001"
                        min="0"
                        className="w-full p-4 text-lg bg-gray-50 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all pl-12"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={!traderProfileExists || needsInitialization || (inactiveTraderDisabled && !isActive)}
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-violet-100 text-violet-600 rounded-lg p-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="1" x2="12" y2="23"></line>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-4 px-6 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl border border-violet-100">
                    <span className="text-gray-700 font-medium">
                      {traderProfileExists ? 'Total Price' : 'Initial Supply'}
                    </span>
                    <span className="text-lg font-bold text-violet-700">
                      {traderProfileExists ? `${Number(buyPrice).toFixed(4)} $${username}` : '1.0 tokens'}
                    </span>
                  </div>
                  {/* Fun badges */}
                  <div className="flex justify-center space-x-4 py-2">
                    <div className="flex items-center text-xs text-gray-600 bg-violet-50 px-3 py-1.5 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-violet-500">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Secure Purchase
                    </div>
                    <div className="flex items-center text-xs text-gray-600 bg-pink-50 px-3 py-1.5 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-pink-500">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                      Protected Item
                    </div>
                  </div>
                  <>
                    <button 
                      className={`w-full py-4 text-white text-lg font-medium rounded-xl transition-all duration-200 shadow-md flex items-center justify-center ${
                        traderProfileExists 
                          ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 transform hover:-translate-y-1' 
                          : (!createUserWhitelistEnabled || isUserWhitelisted)
                            ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 transform hover:-translate-y-1'
                            : 'bg-gray-400 cursor-not-allowed'
                      }`}
                      onClick={() => setIsShippingModalOpen(true)}
                      disabled={traderProfileExists 
                        ? (inactiveTraderDisabled && !isActive)
                        : (createUserWhitelistEnabled && !isUserWhitelisted)}
                    >
                      {traderProfileExists ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <path d="M9 11V6a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v5"></path>
                            <path d="M9 12h6"></path>
                            <rect x="5" y="12" width="14" height="8" rx="2"></rect>
                          </svg>
                          Submit Order
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="16"></line>
                            <line x1="8" y1="12" x2="16" y2="12"></line>
                          </svg>
                          Create Item
                        </>
                      )}
                    </button>
                    {createUserWhitelistEnabled && !isUserWhitelisted && !traderProfileExists && (
                      <div className="mt-2 px-4 py-2 bg-pink-50 border border-pink-200 rounded-xl">
                        <p className="text-sm text-pink-600 text-center">
                          This item requires whitelist access to create
                        </p>
                      </div>
                    )}
                  </>
                </div>
              )}
              
              {activeTab === 'sell' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {traderProfileExists ? `Sell Your ${params.username}` : 'Item Not Available'}
                  </h3>
                  
                  {traderProfileExists ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount to Sell
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.000000000000000001"
                            min="0"
                            className="w-full p-4 text-lg bg-gray-50 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all pl-12"
                            value={amount}
                            onChange={(e) => {
                              setAmount(e.target.value);
                              setIsPriceLoading(true);
                            }}
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-violet-100 text-violet-600 rounded-lg p-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="1" x2="12" y2="23"></line>
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-4 px-6 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl border border-violet-100">
                        <span className="text-gray-700 font-medium">You'll Receive</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-violet-700">
                            {Number(sellPrice).toFixed(6)} ETH
                          </span>
                        </div>
                      </div>
                      {/* Fun badges */}
                      <div className="flex justify-center space-x-4 py-2">
                        <div className="flex items-center text-xs text-gray-600 bg-violet-50 px-3 py-1.5 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-violet-500">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Secure Sale
                        </div>
                        <div className="flex items-center text-xs text-gray-600 bg-pink-50 px-3 py-1.5 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-pink-500">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          Instant Payout
                        </div>
                      </div>
                      <button 
                        className="w-full py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white text-lg font-medium rounded-xl transition-all duration-200 shadow-md transform hover:-translate-y-1 flex items-center justify-center"
                        onClick={handleSellShares}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                          <line x1="6" y1="12" x2="18" y2="12"></line>
                        </svg>
                        Sell Now
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-8 space-y-4">
                      <div className="bg-pink-50 rounded-xl p-6 border border-pink-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-pink-500">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <p className="text-gray-700 mb-2 font-medium">This item is not in your inventory</p>
                        <p className="text-sm text-gray-600">
                          You'll need to purchase this item first before you can sell it
                        </p>
                      </div>
                      <button 
                        className="w-full py-4 bg-gray-300 text-gray-500 text-lg font-medium rounded-xl cursor-not-allowed"
                        disabled
                      >
                        Sell Now
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
  
          {/* Chart Panel */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-md p-6">
            <AddressDisplay raiseWalletAddress={raiseWalletAddress} traderAddress={traderAddress} tokenAddress={tokenAddress} />
          </div>
        </div>
        
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
  
      <ShippingModal 
        isOpen={isShippingModalOpen}
        onClose={() => setIsShippingModalOpen(false)}
        onSubmit={handleShippingSubmit}
      />
  
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

export default TraderPage;
"use client";

import React, { useState, Suspense, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation'; // Use this to access query parameters
import { EIP155_CHAINS } from '@/data/EIP155Data';
import { ethers, Contract } from 'ethers';
import { Avatar } from '@nextui-org/react';
import { getEmbeddedConnectedWallet, usePrivy,   useWallets  } from '@privy-io/react-auth'; 
import Image from 'next/image';
import TradingActivity from '../componants/TradingActivity';
import TopHolders from '../componants/TopHolders';
import Options from '../componants/Options';
import AddressDisplay from '../componants/AddressDisplay';
import { formatBlockTimestamp } from '../utils/timestamp';
import NFTMarketplace from '../componants/NFTMarketplace';
import ActiveContracts from '../componants/ActiveContracts';
import ShippingModal from '../componants/ShippingDetailsModal';

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

  const [activeModalTab, setActiveModalTab] = useState<'activity' | 'topHolders' | 'tradingActivity' | 'shorts'>('tradingActivity');
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
  const [lastBuybackValue, setLastBuybackValue] = useState('0');
  const [winRatio, setWinRatio] = useState('0');
  const [price, setPrice] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [frequency, setFrequency] = useState('0');
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
  const [buybackAmount, setBuybackAmount] = useState('0');
  const [curveContract, setCurveContract] = useState<Contract | null>(null);
  const [createUserWhitelistEnabled, setCreateUserWhitelistEnabled] = useState(false);
  const [isUserWhitelisted, setIsUserWhitelisted] = useState(false);
  const [curveType, setCurveType] = useState<number | null>(null);
  const [activeContract, setActiveContract] = useState<Contract | null>(null);
  const [expiryTime, setExpiryTime] = useState<string>('');
  const [redeemTime, setRedeemTime] = useState<string>('');
  const [isListNFTModalOpen, setIsListNFTModalOpen] = useState(false);
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

    const tokenAddress = await contract.getTokenAddress();
    console.log('NFT Token Address:', tokenAddress);
    setNftTokenAddress(tokenAddress);

    const contractNFT = new ethers.Contract(tokenAddress, nftContractABI, signer);
            
    //this needs to be the total amouunt of nfts rather then the balance of the user
    const balance = await contractNFT.balanceOf('0x899dDFe1CDc28dE88eff62Efa7894D68a53E5EEC');
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

      if (activeContract) {
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

          const isClaimed = await profileContractInstance.isProfileClaimed(nativeAddr);
          setIsActive(isClaimed);
          
          // Check if trader profile exists
          const profileExists = traderAcc !== "0" && traderAcc !== undefined;
          console.log('Profile exists:', profileExists);
          setTraderProfileExists(profileExists);

          if (profileExists) {
            setProfile(profile);
            const traderPoolAddr = profile[5];
            setRaiseWalletAddress(traderPoolAddr);

            // Get pool balance if exists
            if (traderPoolAddr) {
              const traderPoolInstance = new ethers.Contract(traderPoolAddr, tokenPoolABI, signer);
              const balance = await traderPoolInstance.getTotal();
              setBalance(ethers.formatEther(balance));

              const buybackAmount = await traderPoolInstance.getBuybackRate();
              const convertedBuyback = 10000 - Number(buybackAmount);
              const finalMath = convertedBuyback / 100;
              setBuybackAmount(finalMath.toString());
              console.log('Buyback amount:', finalMath.toString());
            }

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

            const lastBuyback = await marketDataContractInstance.getCumulativeBuybackValue(username as string);
            let convertedValue = ethers.formatEther(lastBuyback);
            setLastBuybackValue(convertedValue.toString());

            const winRatio = await marketDataContractInstance.calculateWinRatio(username as string);
            let convertedWinRatio = ethers.formatEther(winRatio);
            setWinRatio(convertedWinRatio.toString());

            const freq = await marketDataContractInstance.getLastBuybackTimestamp(username as string);
            setFrequency(formatBlockTimestamp(freq.toString()));

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

  const fetchAccountCounter = async () => {
    if (createContract) {
      try {
        const accCounter = await createContract.accountCounter();
        return accCounter;
      } catch (error) {
        console.error('Error fetching account counter:', error);
        return null;
      }
    }
    return null;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl w-full mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
  <div className="flex flex-wrap items-start md:items-center gap-8">
    {/* Avatar Section */}
    <div className="relative flex-shrink-0">
      <Avatar 
        src={params.logo}
        className="w-16 h-16 rounded-full shadow-lg"
      />
      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
        isActive ? 'bg-green-500' : 'bg-red-500'
      }`} />
    </div>

    {/* Name and Details Section */}
    <div className="flex-grow min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-xl font-bold text-gray-800 truncate">{params.name}</h2>
        <a 
          href={`https://twitter.com/${params.username}`} 
          target="_blank" 
          className="flex-shrink-0 hover:opacity-80 transition-opacity"
        >
          <Image 
            src="/icons/x-logo-2.png" 
            alt="Twitter" 
            width={20} 
            height={20} 
          />
        </a>
      </div>
      <div className="flex items-center gap-4">
        <p className="text-gray-500">@{params.username}</p>
        <span className={`
          text-sm font-medium px-2 py-0.5 rounded-full
          ${isActive 
            ? "text-green-700 bg-green-100" 
            : "text-red-700 bg-red-100"
          }
        `}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>

 {/* Stats Section */}
<div className="w-full md:w-auto mt-6 md:mt-0 grid grid-cols-7 gap-4">
  <div className="text-center px-4">
    <p className="text-lg font-bold text-green-500">{expiryTime}</p>
    <p className="text-xs text-gray-500">Time Until Expiry</p>
  </div>
  <div className="text-center px-4">
    <p className="text-lg font-bold text-green-500">{redeemTime}</p>
    <p className="text-xs text-gray-500">Time Until Redeem</p>
  </div>
  <div className="text-center px-4">
    <p className="text-lg font-bold text-green-500">{curveType === 1 ? "Closed" : curveType === 2 ? "Open" : ""}</p>
    <p className="text-xs text-gray-500">Curve Type</p>
  </div>
  <div className="text-center px-4">
    <p className="text-lg font-bold text-green-500">
      {Number(marketCap).toFixed(3)} ETH
    </p>
    <p className="text-xs text-gray-500">Curve Marketcap</p>
  </div>
  <div className="text-center px-4">
    <p className="text-lg font-bold text-green-500">
      {Number(balance).toFixed(3)} ETH
    </p>
    <p className="text-xs text-gray-500">Loyalty Marketcap</p>
  </div>
  <div className="text-center px-4">
    <p className="text-lg font-bold text-green-500">{itemsOnCurve}</p>
    <p className="text-xs text-gray-500">Items On Curve</p>
  </div>
</div>
</div>
</div>

{/* NFT Marketplace Section */}
<NFTMarketplace 
  nftContract={nftTokenAddress} //possibly just put the entire nft contract in here instead 
  curveContract={contractAddress}
  userAddress={walletAddress}
  useContractData={false}
  activeContract={activeContract}
  launchContract={launchContract}
  openContract={openContract}
  curveType={curveType}
  signer={signer}
  pageLink={pageLink}
/>

<br />

{/* Main Content Grid */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    
      {/* Trading Panel */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6">
              {/* Trading Tabs */}
              <div className="flex justify-between mb-6 px-4">
                <button
                  className={`flex-1 py-3 text-lg font-medium transition-all duration-200 mx-2 ${
                  activeTab === 'buy'
                    ? 'bg-green-500 text-white rounded-lg shadow-lg transform -translate-y-1'
                    : 'text-gray-500 hover:text-green-500'
                  }`}
                onClick={() => setActiveTab('buy')}
              >
            Redeem
            </button>
            <button
              className={`flex-1 py-3 text-lg font-medium transition-all duration-200 mx-2 ${
              activeTab === 'sell'
                ? 'bg-red-500 text-white rounded-lg shadow-lg transform -translate-y-1'
                : 'text-gray-500 hover:text-red-500'
              }`}
              onClick={() => setActiveTab('sell')}
            >
          Sell
          </button>
        </div>
  {activeTab === 'buy' && (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-gray-800">
      {traderProfileExists ? `Buy $${params.username}` : 'Create Token'}
    </h3>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {traderProfileExists ? 'Amount ETH' : 'Initial Token Creation'}
      </label>
      <input
        type="number"
        step="0.000000000000000001"
        min="0"
        className="w-full p-3 text-lg border-2 border-green-500 rounded-lg focus:ring-2 focus:ring-green-300 outline-none transition-all"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={!traderProfileExists || needsInitialization || (inactiveTraderDisabled && !isActive)}
      />
    </div>
    <div className="flex justify-between items-center py-4 px-6 bg-gray-50 rounded-lg">
      <span className="text-gray-600">
        {traderProfileExists ? 'Total Cost' : 'Initial Supply'}
      </span>
      <span className="text-lg font-semibold">
        {traderProfileExists ? `${Number(buyPrice).toFixed(4)} $${username}` : '1.0 tokens'}
      </span>
    </div>
      <>
        <button 
          className={`w-full py-4 text-white text-lg font-medium rounded-lg transition-colors duration-200 shadow-lg ${
            traderProfileExists 
              ? 'bg-green-500 hover:bg-green-600' 
              : (!createUserWhitelistEnabled || isUserWhitelisted)
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-400 cursor-not-allowed'
          }`}
          onClick={() => setIsShippingModalOpen(true)}
          disabled={traderProfileExists 
            ? (inactiveTraderDisabled && !isActive)
            : (createUserWhitelistEnabled && !isUserWhitelisted)}
        >
          {traderProfileExists ? 'Redeem Now' : 'Create Token'}
        </button>
        {createUserWhitelistEnabled && !isUserWhitelisted && !traderProfileExists && (
          <div className="mt-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 text-center">
              This trader is not whitelisted for token creation
            </p>
          </div>
        )}
      </>
  </div>
)}
        
{activeTab === 'sell' && (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-gray-800">
      {traderProfileExists ? `Sell $${params.username}` : 'Token Not Available'}
    </h3>
    
    {traderProfileExists ? (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount {params.username}
          </label>
          <input
            type="number"
            step="0.000000000000000001"
            min="0"
            className="w-full p-3 text-lg border-2 border-red-500 rounded-lg focus:ring-2 focus:ring-red-300 outline-none transition-all"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setIsPriceLoading(true);
            }}
          />
        </div>
        <div className="flex justify-between items-center py-4 px-6 bg-gray-50 rounded-lg">
          <span className="text-gray-600">You'll Receive</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">
              {Number(sellPrice).toFixed(16)} ETH
            </span>
          </div>
        </div>
        <button 
          className="w-full py-4 bg-red-500 text-white text-lg font-medium rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-lg"
          onClick={handleSellShares}
        >
          Sell Now
        </button>
      </>
    ) : (
      <div className="text-center py-8 space-y-4">
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="text-gray-400 mb-4">⚠️</div>
          <p className="text-gray-600 mb-2">This token hasn't been created yet</p>
          <p className="text-sm text-gray-500">
            Switch to the buy tab to create this token
          </p>
        </div>
        <button 
          className="w-full py-4 bg-gray-300 text-gray-500 text-lg font-medium rounded-lg cursor-not-allowed"
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
      <div className="bg-white rounded-2xl shadow-lg p-6">
          <AddressDisplay raiseWalletAddress={raiseWalletAddress} traderAddress={traderAddress} tokenAddress={tokenAddress} />
        </div>
      </div>
    {/* Activity Tabs Section */}
    <div className="bg-white rounded-2xl shadow-lg mt-8 p-6">
        <div className="flex space-x-8 mb-6 border-b">
          <TabButton 
            active={activeModalTab === 'tradingActivity'} 
            onClick={() => setActiveModalTab('tradingActivity')}
          >
            Admin Panel
          </TabButton>
          <TabButton 
            active={activeModalTab === 'shorts'} 
            onClick={() => setActiveModalTab('shorts')}
          >
            Options
          </TabButton>
          <TabButton 
            active={activeModalTab === 'activity'} 
            onClick={() => setActiveModalTab('activity')}
          >
            My Contracts
          </TabButton>
        </div>

        <div className="mt-6">
          {activeModalTab === 'topHolders' && <TopHolders />}
          {activeModalTab === 'tradingActivity' && <TradingActivity />}
          {activeModalTab === 'shorts' && (
            disableOptionMarket ? (
              <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
                <p className="text-xl font-medium text-gray-600">Options Coming Soon</p>
                <p className="mt-2 text-gray-500">We're working hard to bring options trading to the platform.</p>
              </div>
            ) : (
              <Options 
                isEnabled={true}
                tokenAddress={tokenAddress}
                optionsContract={optionsContract}
                signer={signer}
                traderAddress={traderAddress}
                marketContract={contract}
              />
            )
          )}
          {activeModalTab === 'activity' && 
            <ActiveContracts
              tokenAddress={tokenAddress}
              optionsContract={optionsContract}
              userAddress={walletAddress}
            />
          }
        </div>
      </div>
      </div>

      <ShippingModal 
        isOpen={isShippingModalOpen}
        onClose={() => setIsShippingModalOpen(false)}
        onSubmit={handleShippingSubmit}
      />

      {/* Processing Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex flex-col items-center">
              <Image src="/icons/waitlogo.png" alt="Processing" width={120} height={120} />
              <p className="mt-4 text-lg font-medium text-gray-700">{modalMessage}...</p>
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
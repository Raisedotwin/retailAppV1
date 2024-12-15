"use client";

import React, { useState, Suspense, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation'; // Use this to access query parameters
import { EIP155_CHAINS } from '@/data/EIP155Data';
import { ethers, Contract } from 'ethers';
import { Avatar, Spinner} from '@nextui-org/react';
import { getEmbeddedConnectedWallet, usePrivy,   useWallets  } from '@privy-io/react-auth'; 
import Image from 'next/image';
import TokenActivity from '../componants/TokenActivity';
import TradingActivity from '../componants/TradingActivity';
import TopHolders from '../componants/TopHolders';
import BarChart from '../componants/BarChart';
import Short from '../componants/Short';

const TraderPageContent: React.FC = () => {
  const searchParams = useSearchParams(); // Access the query parameters
  // Extracting the query parameters from the searchParams object
  
  // Extracting the query parameters from the searchParams object
  const name = searchParams.get('name');
  const logo = searchParams.get('logo');
  const username = searchParams.get('username');

  let rpcURL = EIP155_CHAINS["eip155:8453"].rpc;

  const provider  = useMemo(() => new ethers.JsonRpcProvider(rpcURL), [rpcURL]);

  //const provider = useMemo(() => new ethers.BrowserProvider(window.ethereum), []);

  const tokenPoolABI = require("../abi/traderPool");

  const tokenContractAddr = '0xc3369746eeC430A3D79EfA908698E1323333BB1d';
  const tokenMarketABI = require('../abi/tokenMarket.json');

  const marketDataAddr = '0x668B3e8EeD0564fAc8Af39D48e02aaC17E89cf0E';
  const marketDataABI = require("../abi/marketdata.json");

  const createAccountAddr = '0x65fe166D99CD92B0e19B4bAF47300A7866B9D249';
  const createAccountABI = require("../abi/createAccount.json");

  const profileAddr = '0x4731d542b3137EA9469c7ba76cD16E4a563f0a16';
  const profileABI = require("../abi/profile.json");

  const [activeModalTab, setActiveModalTab] = useState<'activity' | 'topHolders' | 'tradingActivity' | 'shorts'>('activity');
  
  // Setting default values or using the query parameters
  const [params] = useState({
    name: name ? name : 'Trader',
    logo: logo ? logo : 'https://via.placeholder.com/150',
    username: username ? username : 'username',
  });

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
  const [showCreateWalletModal, setShowCreateWalletModal] = useState(false);
  const [marketDataContract, setMarketDataContract] = useState<Contract | null>(null);
  const [lastBuybackValue, setLastBuybackValue] = useState('0');
  const [loading, setLoading] = useState(false);
  const [winRatio, setWinRatio] = useState('0');
  const [price, setPrice] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [frequency, setFrequency] = useState('0');
  const [marketCap, setMarketCap] = useState('0');
  const [globalBuyPrice, setGlobalBuyPrice] = useState('0');
  const [globalSellPrice, setGlobalSellPrice] = useState('0');
  const [holdingsNow, setHoldings] = useState('0');
  const { user } = usePrivy();
  const { wallets } = useWallets(); // Use useWallets to get connected wallets
  const [isActive, setIsActive] = useState(true); // You can control this state as needed

  let wallet: any = wallets[0] // Get the first connected wallet privy wallet specifiy privy wallet

  // Mock data for stats, you can replace this with actual dynamic data
  const stats = {
    holders: 120,
    buybacks: 50,
    marketCap: "$10,000",
    price: "368",
    winRate: "75%"
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
              const amountInWei = ethers.parseEther(amount);
              
              try {
                // Get buy price with retry mechanism
                //const buyPriceWei = await contract.getBuyPriceAfterFee(tokenAddress, amountInWei);
                //if (buyPriceWei.toString() !== "0") {
                  //setBuyPrice(ethers.formatEther(buyPriceWei));
                //}

                const buyPriceWei = await contract.getNumberOfTokensForAmount(userAcc, amountInWei)
                if (buyPriceWei.toString() !== "0") {
                  setBuyPrice(ethers.formatEther(buyPriceWei));
                }
                
                // Get sell price with retry mechanism
                const sellPriceWei = await contract.getSellPriceAfterFee(tokenAddress, amountInWei);;
                if (sellPriceWei.toString() !== "0") {
                  setSellPrice(ethers.formatEther(sellPriceWei));

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
  
  // Add debounce to prevent too frequent updates
  //const debouncedUpdatePrices = useMemo(
    //() => {
      //let timeout: NodeJS.Timeout;
      //return (amount: string) => {
        //clearTimeout(timeout);
       // timeout = setTimeout(() => {
          //updatePrices();
        //}, 500); // Wait 500ms after last input before updating
      //};
   // },
    //[contract, profileContract, username]
  //);

  // Use effect for price updates with debounce
  useEffect(() => {
    if (amount && !isNaN(Number(amount))) {
      //debouncedUpdatePrices(amount);
      updatePrices();
    }
  }, [amount]); ///, debouncedUpdatePrices

// Add loading states
const [isPriceLoading, setIsPriceLoading] = useState(false);

useEffect(() => {
  const initContract = async () => {
      try {
          //if logged into twitter set to embedded wallet
          if(user?.twitter?.username) {
              let embeddedWallet = getEmbeddedConnectedWallet(wallets);
              let privyProvider = await embeddedWallet?.address;
              wallet = wallets.find((wallet) => wallet.address === privyProvider);
          }

          getPrivyProvider("base");
          const privyProvider = await wallet?.getEthersProvider();
          const signer: any = privyProvider?.getSigner();

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

          if (name && marketDataContractInstance) {
              try {
                  const profile = await profileContractInstance.getProfileByName(username as string);
                  const nativeAddr = profile[0];
                  const traderAcc = profile[1];
                  const traderPoolAddr = profile[5]; // Get the pool address

                  // Create instance of pool contract
                  if (traderPoolAddr) {
                      const traderPoolInstance = new ethers.Contract(traderPoolAddr, tokenPoolABI, signer);
                      const balance = await traderPoolInstance.getTotal();
                      setBalance(ethers.formatEther(balance));
                  }

                  const tokenAddress = await marketContractInstance.getTokenAddressByAccount(traderAcc.toString());

                  const MCAP = await marketContractInstance.getMarketCap(traderAcc.toString());
                  setMarketCap(MCAP.toString());

                  const lastBuyback = await marketDataContractInstance.getLastBuybackValue(username as string);
                  setLastBuybackValue(lastBuyback.toString());

                  const winRatio = await marketDataContractInstance.calculateWinRatio(username as string);
                  setWinRatio(winRatio.toString());

                  const freq = await marketDataContractInstance.getBuybackFrequency(username as string);
                  setFrequency(freq.toString());

              } catch (error) {
                  console.error('Error fetching market data:', error);
              }
          }
      } catch (error) {
          console.error('Error initializing contracts:', error);
      }
  };
  initContract();
}, [user, name, username, provider]);

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

  const handleCreateWallet = async () => {
    if (createContract) {
      setShowCreateWalletModal(false);
      try {
        setModalMessage('Creating a wallet');
        setIsModalVisible(true);

        const bio = name;
        const avatarURL = logo;
        const userAddress = "0x0000000000000000000000000000000000000000";
        const tx = await createContract.createAccount(
          username as string,
          bio as string,
          avatarURL as string,
          0,
          userAddress
        );
        await tx.wait();
        setModalMessage('Minting first trader share');
        await handleBuySharesDirectly();
        setModalMessage('Wallet created successfully');
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsModalVisible(false);

      } catch (error) {
        console.error('Error creating account:', error);
        setModalMessage('Wallet creation failed');
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsModalVisible(false);
      }
    } else {
      alert('Profile contract not initialized');
    }
  };

  const handleBuySharesDirectly = async () => {
    if (contract) {
      try {
        const accountCounter = await fetchAccountCounter();
        if (accountCounter !== null) {
          const tx = await contract.buyShares(accountCounter, "1000000000000000000", {
            value: ethers.parseEther("0")
          });
          await tx.wait();
        } else {
          alert('Failed to retrieve account counter');
        }
      } catch (error) {
        console.error('Error buying shares:', error);
      }
    } else {
      alert('Contract not initialized');
    }
  };

  const handleBuyShares = async () => {
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
            console.error('Error fetching profile:', error);
          }
        } else {
          setShowCreateWalletModal(true);
          alert('Account does not exist');
          return;
        }
      } catch (error: any) {
        setShowCreateWalletModal(true);

        if (error?.errorArgs === "Profile with this name does not exist.") {
        } else {
          console.error('Error fetching profile:', error);
        }
        return;
      }

      try {
        setModalMessage('Buying tokens');
        setIsModalVisible(true);

        const amountInWei = ethers.parseEther(amount);
        const price = await contract.getBuyPriceAfterFee(tokenAddress, amountInWei);
        setPrice(ethers.formatEther(price));
        const tx = await contract.buyShares(accNum, amountInWei, { value: price });
        //await tx.wait();
        setModalMessage('Purchased successfully');
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsModalVisible(false);
      } catch (error) {
        console.error('Error buying shares:', error);
        setModalMessage('Purchase failed');
        await new Promise((resolve) => setTimeout(resolve, 500));

        setIsModalVisible(false);
      }
    } else {
      alert('Contract not initialized');
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
          //await approveTx.wait();
          //setIsModalVisible(false);


          setModalMessage('Selling tokens');
          
          // Get sell price after approval
          const price = await contract.getSellPriceAfterFee(tokenAddress, amountInWei);
          setPrice(ethers.formatEther(price));
          
          // Execute sell transaction
          const sellTx = await contract.sellShares(accNum, amountInWei);
          await sellTx.wait();
          
          setModalMessage('Sell order successful');
          await new Promise((resolve) => setTimeout(resolve, 500));
          setIsModalVisible(false);
        } catch (error) {
          console.error('Error during sell process:', error);
          setModalMessage('Transaction failed');
          await new Promise((resolve) => setTimeout(resolve, 500));
          setIsModalVisible(false);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setModalMessage('Transaction failed');
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsModalVisible(false);
      }
    } else {
      alert('Contract not initialized');
    }
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
    <div className="w-full md:w-auto mt-6 md:mt-0 grid grid-cols-5 gap-4">
      <div className="text-center px-4">
        <p className="text-lg font-bold text-gray-800">{frequency}</p>
        <p className="text-xs text-gray-500">Buyback%</p>
      </div>
      <div className="text-center px-4">
        <p className="text-lg font-bold text-gray-800">{lastBuybackValue}</p>
        <p className="text-xs text-gray-500">Last Buyback</p>
      </div>
      <div className="text-center px-4">
        <p className="text-lg font-bold text-gray-800">{marketCap}</p>
        <p className="text-xs text-gray-500">Marketcap</p>
      </div>
      <div className="text-center px-4">
      <p className="text-lg font-bold text-gray-800">{balance} ETH</p>
      <p className="text-xs text-gray-500">AUM</p>
    </div>
      <div className="text-center px-4">
        <p className="text-lg font-bold text-gray-800">{winRatio}</p>
        <p className="text-xs text-gray-500">Win Rate</p>
      </div>
    </div>
  </div>
</div>

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
              Buy
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

        {/* Trading Form */}
        {activeTab === 'buy' && (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-gray-800">Buy ${params.username}</h3>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
      <input
        type="number"
        step="0.000000000000000001"
        min="0"
        className="w-full p-3 text-lg border-2 border-green-500 rounded-lg focus:ring-2 focus:ring-green-300 outline-none transition-all"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
          setIsPriceLoading(true);
        }}
      />
    </div>
    <div className="flex justify-between items-center py-4 px-6 bg-gray-50 rounded-lg">
      <span className="text-gray-600">Total Cost</span>
      <span className="text-lg font-semibold">
          {buyPrice || '0'} ${username}
      </span>
    </div>
    <button 
      className="w-full py-4 bg-green-500 text-white text-lg font-medium rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-lg"
      onClick={handleBuyShares}
    >
      {'Buy Now'}
    </button>
  </div>
    )}

{activeTab === 'sell' && (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-gray-800">Sell ${params.username}</h3>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
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
          {sellPrice || '0'} ETH
        </span>
      </div>
    </div>
    <button 
      className="w-full py-4 bg-red-500 text-white text-lg font-medium rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-lg"
      onClick={handleSellShares}
    >
      {'Sell Now'}
    </button>
    </div>
    )}

              {/* Warning Box */}
              <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Warning:</strong> These tokens are taxable at 50%+ when sent to{' '}
                      <a href="#" className="font-medium underline hover:text-yellow-600">
                        these addresses
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Panel */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <BarChart />
          </div>
        </div>

        {/* Activity Tabs Section */}
        <div className="bg-white rounded-2xl shadow-lg mt-8 p-6">
          <div className="flex space-x-8 mb-6 border-b">
            <TabButton 
              active={activeModalTab === 'activity'} 
              onClick={() => setActiveModalTab('activity')}
            >
              Token Activity
            </TabButton>
            <TabButton 
              active={activeModalTab === 'tradingActivity'} 
              onClick={() => setActiveModalTab('tradingActivity')}
            >
              Trading Activity
            </TabButton>
            <TabButton 
              active={activeModalTab === 'shorts'} 
              onClick={() => setActiveModalTab('shorts')}
            >
              Short
            </TabButton>
          </div>

          <div className="mt-6">
            {activeModalTab === 'activity' && <TokenActivity />}
            {activeModalTab === 'topHolders' && <TopHolders />}
            {activeModalTab === 'tradingActivity' && <TradingActivity />}
            {activeModalTab === 'shorts' && <Short />}
          </div>
        </div>
      </div>

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

      {/* Create Wallet Modal */}
      {showCreateWalletModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Create Wallet</h3>
            <p className="text-gray-600 mb-6">Would you like to create a wallet for this trader?</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setShowCreateWalletModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                onClick={handleCreateWallet}
              >
                Create Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-gray-50 p-4 rounded-xl">
    <p className="text-xl font-bold text-gray-800">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

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
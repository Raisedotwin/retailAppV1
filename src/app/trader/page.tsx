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

  const tokenContractAddr = '0xa9A9D98f70E79E90ad515472B56480A48891DB5c';
  const tokenMarketABI = require('../abi/tokenMarket.json');
  const marketDataAddr = '0x4d64472f5d297cbcB43f89d62B1735cD97A737EA';
  const marketDataABI = require("../abi/marketdata.json");
  const createAccountAddr = '0xf1AEFC101507e508e77CDA8080a4Fb10899eb620';
  const createAccountABI = require("../abi/createAccount.json");
  const profileAddr = '0x1dF214861B5A87F3751D1442ec7802d01c07072E';
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
  const [amount, setAmount] = useState('');
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
  const [supply, setSupply] = useState('0');
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

  useEffect(() => {
    const initContract = async () => {

        //if logged into twitter set to embedded wallet
        if(user?.twitter?.username) {
          let embeddedWallet = getEmbeddedConnectedWallet(wallets);
          let privyProvider = await embeddedWallet?.address;
          wallet = wallets.find((wallet) => wallet.address === privyProvider);
        }

        //const signer = await provider.getSigner(user.wallet.address);
        getPrivyProvider("base"); // Switch The Chain Of The UseContext Setting base or Avax
        //const privyProvider = await wallets[0].getEthersProvider(); // Working Implementation
        const privyProvider = await wallet?.getEthersProvider(); // Get Privy provider
        const signer: any  = privyProvider?.getSigner(); // Get signer

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
            const MCAP = await marketContractInstance.getMarketCap(traderAcc);
            setMarketCap(ethers.formatEther(MCAP).toString());

            const holders = await marketContractInstance.holders(nativeAddr);
            setSupply(holders.toString());

            const lastBuyback = await marketDataContractInstance.getLastBuybackValue(username as string);
            setLastBuybackValue(lastBuyback.toString());

            const winRatio = await marketDataContractInstance.calculateWinRatio(username as string);
            setWinRatio(winRatio.toString());

            const sellprice = await marketContractInstance.getSellPriceAfterFee(nativeAddr, 1);
            setGlobalSellPrice(ethers.formatEther(sellprice));

            const buyprice = await marketContractInstance.getBuyPriceAfterFee(nativeAddr, 1);
            setGlobalBuyPrice(ethers.formatEther(buyprice));

            const userHolding = await marketContractInstance.sharesBalance(user?.wallet?.address, traderAcc);
            setHoldings(userHolding.toString());

            setBalance("0");
          } catch (error) {
            console.error('Error fetching market data:', error);
          }
        }
    };
    initContract();
  }, [user, name, username, provider]);

  const testing = async () => {

    //if we detect a user/twitter address we will use the privy embedded wallet else use the most wallet connected
    console.log(wallets)
    let embeddedWallet = getEmbeddedConnectedWallet(wallets);
    console.log(embeddedWallet)

    
    let wallet: any = wallets[0] // Get the first connected wallet privy wallet specifiy privy wallet

    //if logged into twitter set to embedded wallet
    if(user?.twitter?.username) {
      let embeddedWallet = getEmbeddedConnectedWallet(wallets);
      let privyProvider = await embeddedWallet?.address;
      wallet = wallets.find((wallet) => wallet.address === privyProvider);
    }

    console.log(wallet);
    console.log(wallets[0]);
  };

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
          const tx = await contract.buyShares(accountCounter, "1", {
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
      let userAddress;
      try {
        const profile = await profileContract.getProfileByName(username as string);
        if (profile.accountNumber != 0 && profile.userAddress !== "0x0000000000000000000000000000000000000000") {
          accNum = profile[1];
          userAddress = profile[0];
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
        const price = await contract.getBuyPriceAfterFee(userAddress, amount);
        setPrice(ethers.formatEther(price));
        const tx = await contract.buyShares(accNum, amount, { value: price });
        await tx.wait();
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
      let userAddress;
      try {
        const profile = await profileContract.getProfileByName(username as string);
        if (profile.accountNumber != 0 && profile.userAddress !== "0x0000000000000000000000000000000000000000") {
          accNum = profile[1];
          userAddress = profile[0];
        } else {
          alert('Account does not exist');
          return;
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      try {
        setModalMessage('Selling tokens');
        setIsModalVisible(true);
        const price = await contract.getSellPriceAfterFee(userAddress, amount);
        setPrice(ethers.formatEther(price));
        const tx = await contract.sellShares(accNum, amount);
        await tx.wait();
        setModalMessage('Sell order successful');
        await new Promise((resolve) => setTimeout(resolve, 500));

        setIsModalVisible(false);
      } catch (error) {
        console.error('Error selling shares:', error);
        setModalMessage('Sell order failed');
        await new Promise((resolve) => setTimeout(resolve, 500));

        setIsModalVisible(false);
      }
    } else {
      alert('Contract not initialized');
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#edf2f7' }}>
      <div className="max-w-5xl w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-start mb-8">
          {/* Avatar */}
          <Avatar 
            src={params.logo}
            className="w-24 h-24" // Using Tailwind classes for width and height
          />

          <div className="ml-4 flex items-center">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{params.name}</h2>
                <a href={`https://twitter.com/${params.username}`} target="_blank" className="flex items-center">
                  <Image src="/icons/x-logo-2.png" alt="Twitter Icon" width={30} height={30} />
                </a>
              </div>
              <p className="text-gray-500">@{params.username}</p>
              <p className={`
                animate-pulse font-medium px-2 py-0.5 rounded-full inline-block
                ${isActive 
                  ? "text-green-500 bg-green-100 shadow-[0_0_8px_rgba(34,197,94,0.6)]" 
                  : "text-red-500 bg-red-100 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                }
              `}>
                {isActive ? 'active' : 'inactive'}
              </p>
            </div>
          </div>
        </div>

        <br />

        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="text-center">
            <p className="text-xl font-semibold">{supply}</p>
            <p className="text-gray-500">Marketcap %</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold">{lastBuybackValue}</p>
            <p className="text-gray-500">Buybacks</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold">{marketCap}</p>
            <p className="text-gray-500">Marketcap</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold">{stats.price}</p>
            <p className="text-gray-500">Volume</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold">{winRatio}</p>
            <p className="text-gray-500">Win Rate</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="p-6 bg-gray-100 rounded-lg shadow">
            <div className="flex justify-center mb-4">
              <button
                className={`px-20 py-2 ${activeTab === 'buy' ? 'bg-white text-blue-500 border border-blue-500 rounded-t-md shadow-md' : 'bg-gray-100 text-gray-500 border-b border-gray-200 rounded-t-md'}`}
                onClick={() => setActiveTab('buy')}
              >
                Buy
              </button>
              <button
                className={`ml-4 px-20 py-2 ${activeTab === 'sell' ? 'bg-white text-blue-500 border border-blue-500 rounded-t-md shadow-md' : 'bg-gray-100 text-gray-500 border-b border-gray-200 rounded-t-md'}`}
                onClick={() => setActiveTab('sell')}
              >
                Sell
              </button>
            </div>

            {activeTab === 'buy' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Buy ${params.username}</h3>
                <div className="flex flex-col mb-4">
                  <label className="mb-2 text-gray-700 font-semibold">Amount</label>
                  <input
                    type="number"
                    defaultValue={1}
                    className="w-full p-2 text-lg text-gray-700 border border-green-500 rounded-md"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="flex justify-between mb-4">
                  <p>Total Cost</p>
                  <p>{globalBuyPrice} ETH</p>
                </div>
                <button className="w-full py-2 bg-green-500 text-white rounded-lg" onClick={handleBuyShares}>Buy</button>
              </div>
            )}

            {activeTab === 'sell' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Sell ${params.username}</h3>
                <div className="flex flex-col mb-4">
                  <label className="mb-2 text-gray-700 font-semibold">Amount</label>
                  <input
                    type="number"
                    defaultValue={1}
                    className="w-full p-2 text-lg text-gray-700 border border-red-500 rounded-md"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="flex justify-between mb-4">
                  <p>Price</p>
                  <p> {globalSellPrice} ETH</p>
                </div>
                <button className="w-full py-2 bg-red-500 text-white rounded-lg" onClick={handleSellShares}>Sell</button>
              </div>
            )}
            {/* Display User Balance */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mt-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {/* Warning icon */}
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Warning:</strong> These tokens are taxable at 50%+ when sent to{' '}
                    <a 
                      href="https://example.com/restricted-addresses" 
                      target="_blank" 
                      className="font-medium underline text-yellow-700 hover:text-yellow-600"
                    >
                      these addresses
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <BarChart />
        </div>
        <div className="bg-gray-100 p-6 rounded-lg shadow-lg mt-8">

         {/* Tabs for switching between Activity, Top Holders, and Trading Activity */}
         <div className="flex space-x-6 mb-4">
          <button 
            className={`text-lg font-semibold ${activeModalTab === 'activity' ? 'text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveModalTab('activity')}
          >
            Token Activity
          </button>
          <button 
            className={`text-lg font-semibold ${activeModalTab === 'tradingActivity' ? 'text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveModalTab('tradingActivity')}
          >
            Trading Activity
          </button>
          <button 
            className={`text-lg font-semibold ${activeModalTab === 'shorts' ? 'text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveModalTab('shorts')}
          >
            Short
          </button>
        </div>

        {/* Conditionally render the content based on the active tab */}
        {activeModalTab === 'activity' && <TokenActivity />}
        {activeModalTab === 'topHolders' && <TopHolders />}
        {activeModalTab === 'tradingActivity' && <TradingActivity />}
        {activeModalTab === 'shorts' && <Short />}
        </div>
      </div>

      {/* Modal for Processing */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-md flex flex-col items-center w-1/5 h-1/3.5 max-w-1xl max-h- 1xl">
            <Image src="/icons/waitlogo.png" alt="Twitter Icon" width={120} height={120} />
            <p className="mb-2 text-gray-700 font-semibold" >{modalMessage} ... </p>
              <div className="mt-4">
              </div>
           
          </div>
        </div>
      )}


      {/* Modal for Creating Wallet */}
      {showCreateWalletModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-md">
            <p className="text-lg">Create wallet for trader?</p>
            <div className="flex justify-end mt-4">
              <button className="mr-2 px-4 py-2 bg-green-500 text-white rounded-lg" onClick={handleCreateWallet}>
                Create Wallet
              </button>
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg" onClick={() => setShowCreateWalletModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TraderPage: React.FC = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <TraderPageContent />
  </Suspense>
);

export default TraderPage;

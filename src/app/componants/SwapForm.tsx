import React, { useState, useMemo, useCallback } from 'react';
import { useAccount } from '../context/AccountContext';
import { usePrivy, useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import Image from 'next/image';
import { EIP155_CHAINS } from '@/data/EIP155Data';

interface SwapFormProps {
  balance: string;
  profile: any;
}

const SwapForm: React.FC<SwapFormProps> = ({ balance, profile }) => {
  // State management
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [tradeAmount, setTradeAmount] = useState('');
  const [inputToken, setInputToken] = useState('');
  const [outputToken, setOutputToken] = useState('');
  const [amount, setAmount] = useState('');
  const [balanceTwo, setBalanceTwo] = useState('0');
  const [profit, setProfit] = useState('');
  const [buyback, setBuyback] = useState('');
  const [activeTab, setActiveTab] = useState('buy');
  const [tokenAddress, setTokenAddress] = useState('');
  const [isInputModalVisible, setIsInputModalVisible] = useState(true);
  const [selectedToken, setSelectedToken] = useState<any | null>(null);

  // Hooks and Context
  const { account } = useAccount();
  const { user } = usePrivy();
  const { wallets } = useWallets();
  let wallet = wallets[0];

  // Contract constants
  const tokenPoolABI = require("../abi/traderPool");
  const profileAddr = '0x4731d542b3137EA9469c7ba76cD16E4a563f0a16';
  const profileABI = require("../abi/profile");
  const wethAddress = "0x4200000000000000000000000000000000000006";

  // Provider setup
  const baseRpcURL = EIP155_CHAINS["eip155:8453"].rpc;
  const provider = useMemo(() => new ethers.JsonRpcProvider(baseRpcURL), [baseRpcURL]);

  // Contract instance
  const profileContract = useMemo(() => {
    return new ethers.Contract(profileAddr, profileABI, provider);
  }, [profileAddr, profileABI, provider]);

  // Wallet handling functions
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
  
    const privyProvider = await getPrivyProvider("base");
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

  // Helper functions
  const handleSelectToken = (token: any) => {
    setInputToken(`${token.name} (${token.address})`);
    setIsInputModalVisible(true);
  };

  const onSelectToken = (token: any) => {
    setInputToken(`${token.name} (${token.address})`);
  };

  // Balance fetching
  const fetchContractBalance = useCallback(async () => {
    try {
      const walletAddress = wallet?.address || user?.wallet?.address;
      const profile = await profileContract.getProfile(walletAddress);
      
      if (profile[5] !== "0x0000000000000000000000000000000000000000") {
        const addr = profile[5];
        const traderPoolInstance = new ethers.Contract(addr, tokenPoolABI, provider);
        
        if (inputToken && inputToken !== wethAddress) {
          const tokenBalance = await traderPoolInstance.getTokenBalance(inputToken);
          const balanceOfTokenEther = ethers.formatEther(tokenBalance);
          setBalanceTwo(balanceOfTokenEther);
        } else {
          let contractBalance = await traderPoolInstance.getTotal();
          let contractBalanceEther = ethers.formatEther(contractBalance);
          setBalanceTwo(contractBalanceEther);
        }
      }
    } catch (error) {
      console.error("Error fetching contract balance:", error);
      setBalanceTwo('Error fetching balance');
    }
  }, [inputToken, profileContract, provider, tokenPoolABI, wallet, user]);

  // Main swap function
  const handleSwap = async () => {
    if (!profileContract) return;

    setModalMessage('Swapping tokens');
    setIsModalVisible(true);

    try {
      const signer: any = await getSigner();
      if (!signer) throw new Error("Failed to get signer");

      const walletAddress = wallet?.address || user?.wallet?.address;
      const profileContractWithSigner = new ethers.Contract(profileAddr, profileABI, signer);
      const profile = await profileContractWithSigner.getProfile(walletAddress);

      if (profile[5] === "0x0000000000000000000000000000000000000000") {
        throw new Error("No trader pool found");
      }

      const addr = profile[5];
      const traderPoolInstance = new ethers.Contract(addr, tokenPoolABI, signer);

      const amountEther = ethers.parseEther(tradeAmount || '0');

      if (inputToken === wethAddress) {
        // Buy logic
        const balance = await traderPoolInstance.getTotal();
        if (balance >= amountEther && tradeAmount !== "0") {
          const tx = await traderPoolInstance.poolTrade(inputToken, outputToken, amountEther);
          await tx.wait();
          alert('Traded specified amount');
        } else {
          const tx = await traderPoolInstance.poolTrade(inputToken, outputToken, balance);
          await tx.wait();
          alert('Traded all available balance');
        }
      } else {
        // Sell logic
        const tokenBalance = await traderPoolInstance.getTokenBalance(inputToken);
        if (tokenBalance.isZero()) {
          alert('Insufficient token balance in contract');
          setModalMessage('Insufficient token balance in contract');
          return;
        }

        if (tokenBalance >= amountEther && tradeAmount !== "0") {
          const tx = await traderPoolInstance.poolTrade(inputToken, outputToken, amountEther);
          await tx.wait();
          
          const profit = await traderPoolInstance.recentProfit();
          const profitInEther = ethers.formatEther(profit);
          
          if (parseFloat(profitInEther) > 0) {
            setProfit(profitInEther);
          }

          const lastBuyback = await traderPoolInstance.lastSharePurchase();
          if (lastBuyback > 0) {
            setBuyback(lastBuyback.toString());
          }
        } else {
          const tx = await traderPoolInstance.poolTrade(inputToken, outputToken, tokenBalance);
          await tx.wait();

          const profit = await traderPoolInstance.recentProfit();
          const profitInEther = ethers.formatEther(profit);
          
          if (parseFloat(profitInEther) > 0) {
            setProfit(profitInEther);
          }

          const lastBuyback = await traderPoolInstance.lastSharePurchase();
          if (lastBuyback > 0) {
            setBuyback(lastBuyback.toString());
          }
        }
      }

      setModalMessage('Swap Successful');
      await fetchContractBalance();
    } catch (error) {
      console.error('Error during swap:', error);
      setModalMessage('Swap Failed');
    } finally {
      setTimeout(() => setIsModalVisible(false), 500);
    }
  };

  return (
    <div className="bg-[#1c1f2a] rounded-2xl border border-gray-800 p-6">
      <div className="max-w-lg mx-auto">
        <div className="bg-black rounded-2xl shadow-xl p-6">
          {/* Header with Balance */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 text-center mb-2">
              Swap Tokens
            </h2>
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Available Balance</p>
              <p className="text-2xl font-bold text-white">{balance} WETH</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-2 gap-2 bg-gray-800/30 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('buy')}
              className={`py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'buy' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'sell' 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sell
            </button>
          </div>

          {/* Buy Form */}
          {activeTab === 'buy' && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white">From</span>
                  <div className="flex items-center space-x-2">
                    <Image src="/icons/ethereum.png" alt="WETH" width={20} height={20} />
                    <span className="text-white font-medium">WETH</span>
                  </div>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter WETH amount"
                  className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white">To</span>
                  <span className="text-gray-400 text-sm">Any token</span>
                </div>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="Enter token address"
                  className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <button
                onClick={handleSwap}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200"
              >
                Buy Tokens
              </button>

              <p className="text-gray-400 text-sm text-center">
                You can only buy tokens using WETH
              </p>
            </div>
          )}

          {/* Sell Form */}
          {activeTab === 'sell' && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white">From</span>
                  <span className="text-gray-400 text-sm">Any token</span>
                </div>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="Enter token address"
                  className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white">To</span>
                  <div className="flex items-center space-x-2">
                    <Image src="/icons/ethereum.png" alt="WETH" width={20} height={20} />
                    <span className="text-white font-medium">WETH</span>
                  </div>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount to sell"
                  className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>

              <button
                onClick={handleSwap}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium transition-all duration-200"
              >
                Sell for WETH
              </button>

              <p className="text-gray-400 text-sm text-center">
                All tokens will be sold for WETH
              </p>
            </div>
          )}
        </div>
      </div>

      {isModalVisible && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1c1f2a] rounded-xl p-6 border border-gray-800 flex flex-col items-center">
            <Image src="/icons/waitlogo.png" alt="Processing" width={120} height={120} />
            <p className="mt-4 text-white font-medium">{modalMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapForm;

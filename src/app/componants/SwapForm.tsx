import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAccount } from '../context/AccountContext';
import { usePrivy, useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import Image from 'next/image';
import { EIP155_CHAINS } from '@/data/EIP155Data';

interface SwapFormProps {
  balance: string;
  profile: any;
  enableBuying?: boolean;
}

const SwapForm: React.FC<SwapFormProps>= ({ enableBuying = false }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [balanceWETH, setBalanceWETH] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [activeTab, setActiveTab] = useState('sell');
  const [estimatedReceiveAmount, setEstimatedReceiveAmount] = useState('0');

  const { account } = useAccount();
  const { user } = usePrivy();
  const { wallets } = useWallets();
  let wallet = wallets[0];

  const tokenPoolABI = require("../abi/traderPool");
  const profileAddr = '0x33E04eC91A04F8791927C06EF5E862e6AA09b71a';
  const profileABI = require("../abi/profile");
  const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";

  const tokenMarketAbi = require("../abi/tokenMarket");
  const tokenMarketAddr = '0x5Cd11eafc8722992Eb64e4cCBdE77f86283C7191';
  const erc20Abi = require("../abi/storetoken");

  const provider = useMemo(() => 
    new ethers.JsonRpcProvider(EIP155_CHAINS["eip155:84532"].rpc),
    []
  );

  const profileContract = useMemo(() => 
    new ethers.Contract(profileAddr, profileABI, provider),
    [provider]
  );

  const tokenMarket = useMemo(() => 
    new ethers.Contract(tokenMarketAddr, tokenMarketAbi, provider),
    [provider]
  );

  const getWallet = useCallback(async () => {
    if (user?.twitter?.username) {
      const embeddedWallet = getEmbeddedConnectedWallet(wallets);
      const privyProvider = await embeddedWallet?.address;
      return wallets.find(w => w.address === privyProvider) || wallet;
    }
    return wallet;
  }, [user, wallets, wallet]);

  const getSigner = async () => {
    const currentWallet = await getWallet();
    if (!currentWallet) throw new Error("No wallet available");
    
    try {
      await currentWallet.switchChain(8453);
      const provider = await currentWallet.getEthersProvider();
      return provider.getSigner();
    } catch (error) {
      console.error("Failed to get signer:", error);
      throw error;
    }
  };

  const fetchBalances = useCallback(async () => {
    try {
      const currentWallet = await getWallet();
      const walletAddress = currentWallet?.address || user?.wallet?.address;
      
      if (!walletAddress) {
        console.error("No wallet address available");
        return;
      }
      
      // Fetch WETH balance
      const wethContract = new ethers.Contract(WETH_ADDRESS, erc20Abi, provider);
      const wethBalance = await wethContract.balanceOf(walletAddress);
      setBalanceWETH(ethers.formatEther(wethBalance));

      // Fetch token balance if token address is set
      if (tokenAddress && ethers.isAddress(tokenAddress)) {
        const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
        
        try {
          // Try to use checkBalance first (as specified)
          const balance = await tokenContract.checkBalance(walletAddress);
          setTokenBalance(ethers.formatEther(balance));
        } catch (error) {
          // Fallback to balanceOf if checkBalance fails
          console.log("checkBalance failed, falling back to balanceOf");
          const balance = await tokenContract.balanceOf(walletAddress);
          setTokenBalance(ethers.formatEther(balance));
        }
        
        // Get estimated receive amount for selling tokens
        updateEstimatedAmount();
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
      setBalanceWETH('Error');
      setTokenBalance('Error');
    }
  }, [getWallet, user, provider, tokenAddress]);

  const updateEstimatedAmount = async () => {
    if (!amount || parseFloat(amount) <= 0 || !tokenAddress || !ethers.isAddress(tokenAddress)) {
      setEstimatedReceiveAmount('0');
      return;
    }
    
    try {
      const amountWei = ethers.parseEther(amount);
      const estimatedAmount = await tokenMarket.getSellPriceAfterFee(tokenAddress, amountWei);
      setEstimatedReceiveAmount(ethers.formatEther(estimatedAmount));
    } catch (error) {
      console.error("Error estimating sell price:", error);
      setEstimatedReceiveAmount('Error');
    }
  };

  const handleSwap = async () => {
    if (!amount || !tokenAddress) {
      alert('Please enter both amount and token address');
      return;
    }

    if (!ethers.isAddress(tokenAddress)) {
      alert('Please enter a valid token address');
      return;
    }

    setModalMessage('Processing redemption...');
    setIsModalVisible(true);

    try {
      const signer:any = await getSigner();
      const tokenMarketWithSigner = new ethers.Contract(tokenMarketAddr, tokenMarketAbi, signer);
      const amountWei = ethers.parseEther(amount);
      
      // Get account number for the token
      const accountNumber = await tokenMarket.getAccountNumberWAddr(tokenAddress);
      
      // Check if token approval is needed
      const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, signer);
      const walletAddress = (await getWallet())?.address || user?.wallet?.address;
      const allowance = await tokenContract.allowance(walletAddress, tokenMarketAddr);
      
      if (allowance.lt(amountWei)) {
        setModalMessage('Approving token...');
        const approveTx = await tokenContract.approve(tokenMarketAddr, ethers.MaxUint256);
        await approveTx.wait();
      }
      
      setModalMessage('Selling shares...');
      const tx = await tokenMarketWithSigner.sellShares(
        accountNumber,
        amountWei,
        walletAddress
      );

      setModalMessage('Confirming transaction...');
      await tx.wait();
      
      setModalMessage('Redemption successful!');
      await fetchBalances();
      setAmount('');
      
    } catch (error) {
      console.error('Redemption failed:', error);
      setModalMessage('Redemption failed. Please try again.');
    } finally {
      setTimeout(() => {
        setIsModalVisible(false);
        setModalMessage('');
      }, 2000);
    }
  };

  // Initial fetch on component mount and when token address changes
  useEffect(() => {
    fetchBalances();
  }, [fetchBalances, tokenAddress]);

  // Update estimated amount when amount or token changes
  useEffect(() => {
    updateEstimatedAmount();
  }, [amount, tokenAddress]);

  return (
    <div className="bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 rounded-2xl border border-indigo-500/30 p-6 shadow-xl">
      <div className="max-w-lg mx-auto">
        <div className="bg-black/60 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-indigo-400/20">
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 animate-pulse"></div>
                <h2 className="relative text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-300 text-center z-10 px-6 py-2">
                  Loyalty Point Swap
                </h2>
              </div>
            </div>
            
            {/* Tab navigation - only shown if buying is enabled */}
            {enableBuying && (
              <div className="grid grid-cols-2 gap-2 bg-indigo-900/30 p-1 rounded-lg mb-6">
                <button
                  onClick={() => setActiveTab('buy')}
                  className={`py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'buy' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                      : 'text-indigo-300 hover:text-white'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setActiveTab('sell')}
                  className={`py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'sell' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg' 
                      : 'text-indigo-300 hover:text-white'
                  }`}
                >
                  Sell
                </button>
              </div>
            )}
            
            <div className="bg-indigo-900/40 backdrop-blur-sm rounded-xl p-4 text-center border border-indigo-500/30">
              <p className="text-indigo-200 text-sm mb-1">Available Balance</p>
              <div className="flex items-center justify-center">
                <p className="text-3xl font-bold text-white">
                  {activeTab === 'buy' 
                    ? `${balanceWETH} WETH` 
                    : `${parseFloat(tokenBalance).toLocaleString(undefined, {maximumFractionDigits: 4})} Token`}
                </p>
                <div className="ml-2 animate-bounce">
                  <span className="text-2xl">{activeTab === 'buy' ? '💎' : '🪙'}</span>
                </div>
              </div>
              <p className="text-indigo-200 text-sm mt-1">
                {activeTab === 'buy' 
                  ? 'Available for purchasing loyalty points'
                  : `You will receive approximately ${parseFloat(estimatedReceiveAmount).toLocaleString(undefined, {maximumFractionDigits: 8})} WETH`}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-5 border border-indigo-500/20 transform transition-all hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-medium">Token Address</span>
                <div className="px-3 py-1 bg-indigo-800/60 rounded-full">
                  <span className="text-xs text-indigo-200">Required</span>
                </div>
              </div>
              <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="Enter loyalty token address"
                className="w-full bg-black/50 text-white p-3 rounded-lg border border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-pink-500/50 placeholder-indigo-300/50"
              />
            </div>

            <div className="bg-indigo-900/30 backdrop-blur-sm rounded-xl p-5 border border-indigo-500/20 transform transition-all hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-medium">Amount to Redeem</span>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-r from-pink-500 to-purple-500 p-0.5">
                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                      <span className="text-xs">🪙</span>
                    </div>
                  </div>
                  <span className="text-indigo-200 font-medium">
                    Loyalty Points
                  </span>
                </div>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to redeem"
                className="w-full bg-black/50 text-white p-3 rounded-lg border border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-pink-500/50 placeholder-indigo-300/50"
              />
              
              {/* Quick Set buttons - new feature */}
              {parseFloat(tokenBalance) > 0 && (
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={() => setAmount((parseFloat(tokenBalance) * 0.25).toString())}
                    className="bg-indigo-800/40 text-xs text-indigo-200 px-3 py-1 rounded-md hover:bg-indigo-700/60 transition-colors">
                    25%
                  </button>
                  <button 
                    onClick={() => setAmount((parseFloat(tokenBalance) * 0.5).toString())}
                    className="bg-indigo-800/40 text-xs text-indigo-200 px-3 py-1 rounded-md hover:bg-indigo-700/60 transition-colors">
                    50%
                  </button>
                  <button 
                    onClick={() => setAmount((parseFloat(tokenBalance) * 0.75).toString())}
                    className="bg-indigo-800/40 text-xs text-indigo-200 px-3 py-1 rounded-md hover:bg-indigo-700/60 transition-colors">
                    75%
                  </button>
                  <button 
                    onClick={() => setAmount(tokenBalance)}
                    className="bg-indigo-800/40 text-xs text-indigo-200 px-3 py-1 rounded-md hover:bg-indigo-700/60 transition-colors">
                    Max
                  </button>
                </div>
              )}
            </div>

            {estimatedReceiveAmount !== '0' && estimatedReceiveAmount !== 'Error' && (
              <div className="bg-indigo-900/20 backdrop-blur-sm rounded-xl p-4 border border-indigo-500/10">
                <div className="flex justify-between items-center">
                  <span className="text-indigo-200">You will receive:</span>
                  <span className="text-white font-bold">{parseFloat(estimatedReceiveAmount).toLocaleString(undefined, {maximumFractionDigits: 8})} WETH</span>
                </div>
              </div>
            )}

            <button
              onClick={handleSwap}
              disabled={!amount || parseFloat(amount) <= 0 || !tokenAddress}
              className="w-full py-4 relative group disabled:opacity-50"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl blur opacity-70 group-hover:opacity-100 transition duration-200"></div>
              <div className={`relative rounded-xl px-6 py-4 transition-all duration-200 flex items-center justify-center
                ${activeTab === 'buy' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                  : 'bg-gradient-to-r from-pink-600 to-purple-600'}`}>
                <span className="text-white font-semibold text-lg">
                  {activeTab === 'buy' ? 'Purchase Loyalty Points' : 'Redeem Loyalty Points'}
                </span>
                <span className="ml-2 text-xl">{activeTab === 'buy' ? '🚀' : '✨'}</span>
              </div>
            </button>

            <p className="text-indigo-200 text-sm text-center mt-4 px-6">
              {activeTab === 'buy'
                ? 'Purchase loyalty points using WETH. Point prices are determined by the pool contract.'
                : 'Your loyalty points will be redeemed for WETH. Redemption rates are determined by the market contract.'}
            </p>
          </div>
        </div>
      </div>

      {isModalVisible && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-gradient-to-b from-indigo-900 to-black rounded-xl p-8 border border-indigo-500/30 flex flex-col items-center transform transition-all animate-fadeIn">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur-md animate-pulse"></div>
              <Image src="/icons/waitlogo.png" alt="Processing" width={140} height={140} className="relative z-10" />
            </div>
            <p className="mt-6 text-xl text-white font-medium">{modalMessage}</p>
            <div className="mt-4 flex space-x-2">
              {modalMessage.includes('Processing') && (
                <>
                  <span className="animate-bounce delay-0">⚡</span>
                  <span className="animate-bounce delay-100">⚡</span>
                  <span className="animate-bounce delay-200">⚡</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
};

export default SwapForm;
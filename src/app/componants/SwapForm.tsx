import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAccount } from '../context/AccountContext';
import { usePrivy, useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import Image from 'next/image';
import { EIP155_CHAINS } from '@/data/EIP155Data';

interface SwapFormProps {
  balance: string;
  profile: any;
}

const SwapForm: React.FC<SwapFormProps>= () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [balanceWETH, setBalanceWETH] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [activeTab, setActiveTab] = useState('buy');

  const { account } = useAccount();
  const { user } = usePrivy();
  const { wallets } = useWallets();
  let wallet = wallets[0];

  const tokenPoolABI = require("../abi/traderPool");
  const profileAddr = '0xF449ee02878297d5bc73E69a1A5B379E503806cE';
  const profileABI = require("../abi/profile");
  const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";

  const provider = useMemo(() => 
    new ethers.JsonRpcProvider(EIP155_CHAINS["eip155:8453"].rpc),
    []
  );

  const profileContract = useMemo(() => 
    new ethers.Contract(profileAddr, profileABI, provider),
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
      const profile = await profileContract.getProfile(walletAddress);
      
      if (profile[5] === "0x0000000000000000000000000000000000000000") {
        throw new Error("No trader pool found");
      }

      const poolContract = new ethers.Contract(profile[5], tokenPoolABI, provider);
      
      // Fetch WETH balance
      const wethBalance = await poolContract.getTotal();
      setBalanceWETH(ethers.formatEther(wethBalance));

      // Fetch token balance if in sell mode and address is set
      if (activeTab === 'sell' && tokenAddress) {
        const balance = await poolContract.getTokenBalance(tokenAddress);
        setTokenBalance(ethers.formatEther(balance));
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
      setBalanceWETH('Error');
      setTokenBalance('Error');
    }
  }, [getWallet, user, profileContract, provider, tokenPoolABI, activeTab, tokenAddress]);

  const handleSwap = async () => {
    if (!amount || !tokenAddress) {
      alert('Please enter both amount and token address');
      return;
    }

    setModalMessage('Processing swap...');
    setIsModalVisible(true);

    try {
      const signer: any = await getSigner();
      const walletAddress = (await getWallet())?.address || user?.wallet?.address;
      const profile = await profileContract.getProfile(walletAddress);
      
      if (profile[5] === "0x0000000000000000000000000000000000000000") {
        throw new Error("No trader pool found");
      }

      const poolContract = new ethers.Contract(profile[5], tokenPoolABI, signer);
      const amountWei = ethers.parseEther(amount);

      const tx = await poolContract.poolTrade(
        activeTab === 'buy' ? WETH_ADDRESS : tokenAddress,
        activeTab === 'buy' ? tokenAddress : WETH_ADDRESS,
        amountWei
      );

      setModalMessage('Confirming transaction...');
      //await tx.wait();
      
      setModalMessage('Swap successful!');
      setIsModalVisible(false);
      await fetchBalances();
      setAmount('');
      
    } catch (error) {
      console.error('Swap failed:', error);
      setModalMessage('Swap failed. Please try again.');
    } finally {
      setTimeout(() => {
        setIsModalVisible(false);
        setModalMessage('');
      }, 2000);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return (
    <div className="bg-[#1c1f2a] rounded-2xl border border-gray-800 p-6">
      <div className="max-w-lg mx-auto">
        <div className="bg-black rounded-2xl shadow-xl p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 text-center mb-2">
              Swap Tokens
            </h2>
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Available Balance</p>
              <p className="text-2xl font-bold text-white">
                {activeTab === 'buy' ? `${balanceWETH} WETH` : `${tokenBalance} Token`}
              </p>
            </div>
          </div>

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

          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white">Token Address</span>
              </div>
              <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="Enter token address"
                className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white">Amount</span>
                <div className="flex items-center space-x-2">
                  <Image src="/icons/ethereum.png" alt="WETH" width={20} height={20} />
                  <span className="text-white font-medium">
                    {activeTab === 'buy' ? 'WETH' : 'Token'}
                  </span>
                </div>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Enter ${activeTab === 'buy' ? 'WETH' : 'token'} amount`}
                className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <button
              onClick={handleSwap}
              className={`w-full py-4 ${
                activeTab === 'buy'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
              } text-white rounded-xl font-medium transition-all duration-200`}
            >
              {activeTab === 'buy' ? 'Buy Tokens' : 'Sell Tokens'}
            </button>

            <p className="text-gray-400 text-sm text-center">
              {activeTab === 'buy' 
                ? 'You can only buy tokens using WETH'
                : 'All tokens will be sold for WETH'}
            </p>
          </div>
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
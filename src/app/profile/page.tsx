"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from '../context/AccountContext';
import { getEmbeddedConnectedWallet, useFundWallet, usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';

// Simple SVG Icons as components
const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <path d="M20 12v4H6a2 2 0 0 0-2 2c0 1.1.9 2 2 2h12v-4" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
  </svg>
);

const CardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
);

const ProfilePage: React.FC = () => {
  const { account } = useAccount();
  const { user } = usePrivy();
  const [balance, setBalance] = useState<string | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [transferTx, setTransferTx] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { fundWallet } = useFundWallet();
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  let wallet: any;

  useEffect(() => {
    getBalance();
  }, [user?.wallet?.address]);

  const getPrivyProvider = async (chainName: string) => {
    if (!wallet) {
      console.error("Wallet not initialized");
      return null;
    }

    let chainId: number;

    switch (chainName.toLowerCase()) {
      case "avax":
        chainId = 43114;
        break;
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

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    await getBalance();
    setIsRefreshing(false);
  };

  async function getBalance() {
    if (user?.twitter?.username) {
      let embeddedWallet = getEmbeddedConnectedWallet(wallets);
      let privyProvider = await embeddedWallet?.address;
      wallet = wallets.find((wallet) => wallet.address === privyProvider);
    }

    getPrivyProvider("base");
    const privyProvider = await wallet?.getEthersProvider();
    const signer: any = privyProvider?.getSigner();

    const address = await signer?.getAddress();
    console.log(address);

    const balance = ethers.formatEther(
      (await privyProvider?.getBalance(address))?.toString()
    );
    console.log(balance);
    setBalance(balance);
  }

  const handleSendMoney = async () => {
    try {
      setIsSending(true);
      if (user?.twitter?.username) {
        let embeddedWallet = getEmbeddedConnectedWallet(wallets);
        let privyProvider = await embeddedWallet?.address;
        wallet = wallets.find((wallet) => wallet.address === privyProvider);
      }

      getPrivyProvider("base");
      const privyProvider = await wallet?.getEthersProvider();
      const signer: any = privyProvider?.getSigner();

      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount || "0.1"),
        maxPriorityFeePerGas: "5000000000",
        maxFeePerGas: "6000000000000",
      });
      const receipt = await tx.wait();
      console.log(receipt);
      setTransferTx(receipt.transactionHash);
    } catch (error) {
      console.error("Transaction failed:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-8 backdrop-blur-sm border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Wallet Dashboard
              </h2>
              <p className="text-gray-400 mt-2">Manage your crypto assets</p>
            </div>
            <WalletIcon />
          </div>
        </div>

        {user?.wallet?.address ? (
          <>
            {/* Balance Card */}
            <div className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 rounded-xl p-6 backdrop-blur-sm border border-gray-800">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-gray-400 font-medium mb-1">Total Balance</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-white">
                      {balance ? `${Number(balance).toFixed(4)}` : '---'}
                    </span>
                    <span className="text-xl text-gray-400">ETH</span>
                  </div>
                </div>
                <button 
                  onClick={handleRefreshBalance}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className={`${isRefreshing ? 'animate-spin' : ''}`}>
                    <RefreshIcon />
                  </div>
                </button>
              </div>
            </div>

            {/* Send Money Card */}
            <div className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 rounded-xl p-6 backdrop-blur-sm border border-gray-800">
              <div className="flex items-center mb-4">
                <SendIcon />
                <h3 className="text-xl font-semibold text-white ml-2">Send Funds</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Recipient Address</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="0x..."
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Amount (ETH)</label>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="0.0"
                  />
                </div>
                <button
                  onClick={handleSendMoney}
                  disabled={isSending}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? 'Processing Transaction...' : 'Send Money'}
                </button>
              </div>
            </div>

            {/* Transaction Status Card */}
            {transferTx && (
              <div className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 rounded-xl p-6 backdrop-blur-sm border border-gray-800 animate-fadeIn">
                <h3 className="text-lg font-semibold text-white mb-2">Transaction Status</h3>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-green-400 break-all">
                    Transaction Hash: {transferTx}
                  </p>
                </div>
              </div>
            )}

            {/* Wallet Info Card */}
            <div className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 rounded-xl p-6 backdrop-blur-sm border border-gray-800">
              <div className="flex items-center mb-4">
                <CardIcon />
                <h3 className="text-xl font-semibold text-white ml-2">Wallet Details</h3>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-400 break-all">{user?.wallet?.address}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 rounded-xl p-6 backdrop-blur-sm border border-gray-800">
            <div className="text-center py-8">
              <div className="mx-auto mb-4 w-16">
                <WalletIcon />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Wallet Connected</h3>
              <p className="text-gray-400">Connect your wallet to view your balance and make transactions</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
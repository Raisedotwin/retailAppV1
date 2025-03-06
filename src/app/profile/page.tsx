"use client";

import React, { useState, useEffect } from 'react';
import { useAccount } from '../context/AccountContext';
import { getEmbeddedConnectedWallet, useFundWallet, usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';

// SVG Icons
const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <path d="M20 12v4H6a2 2 0 0 0-2 2c0 1.1.9 2 2 2h12v-4" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
  </svg>
);

const CardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
);

const AffiliateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const OrdersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H2v10h10V2z" />
    <path d="M12 12h10v10H12V12z" />
    <path d="M22 2h-6v6h6V2z" />
    <path d="M8 16H2v6h6v-6z" />
  </svg>
);

const TrackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="12 15 16 19 20 15" />
    <path d="M16 3v16" />
  </svg>
);

const RefundIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Sample order data
const sampleOrders = [
  {
    id: "ORD-12345",
    date: "2025-03-01",
    product: "CryptoWallet Pro",
    amount: "0.05 ETH",
    status: "Delivered",
    trackingNumber: "TRK-789012"
  },
  {
    id: "ORD-12346",
    date: "2025-02-27",
    product: "NFT Collection Pass",
    amount: "0.3 ETH",
    status: "Processing",
    trackingNumber: "TRK-789013"
  },
  {
    id: "ORD-12347",
    date: "2025-02-20",
    product: "Yearly Subscription",
    amount: "0.8 ETH",
    status: "Shipped",
    trackingNumber: "TRK-789014"
  }
];

// Sample affiliate data
const affiliateStats = {
  referralCode: "USER123",
  totalReferrals: 24,
  activeReferrals: 18,
  totalEarnings: "1.56 ETH",
  pendingPayouts: "0.38 ETH",
  recentReferrals: [
    { user: "0x1a2...3b4c", date: "2025-03-01", status: "Active", commission: "0.08 ETH" },
    { user: "0x4d5...6e7f", date: "2025-02-28", status: "Active", commission: "0.05 ETH" },
    { user: "0x8g9...0h1i", date: "2025-02-25", status: "Pending", commission: "0.12 ETH" }
  ]
};

const ProfilePage: React.FC = () => {
  const { account } = useAccount();
  const { user } = usePrivy();
  const [balance, setBalance] = useState<string | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [transferTx, setTransferTx] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('wallet');
  const [trackingOrder, setTrackingOrder] = useState<string | null>(null);
  const [refundOrder, setRefundOrder] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [isRefundSubmitting, setIsRefundSubmitting] = useState(false);

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
    try {
      if (!user?.twitter?.username) {
        console.log('No user or twitter username found');
        return;
      }
  
      let embeddedWallet = getEmbeddedConnectedWallet(wallets);
      if (!embeddedWallet?.address) {
        console.log('No embedded wallet found');
        return;
      }
  
      let privyProvider = embeddedWallet.address;
      wallet = wallets.find((wallet) => wallet.address === privyProvider);
      
      if (!wallet) {
        console.log('No matching wallet found');
        return;
      }
  
      await getPrivyProvider("base");
      const provider = await wallet.getEthersProvider();
      
      if (!provider) {
        console.log('No provider available');
        return;
      }
  
      const signer = provider.getSigner();
      if (!signer) {
        console.log('No signer available');
        return;
      }
  
      const address = await signer.getAddress();
      console.log('Address:', address);
  
      const rawBalance = await provider.getBalance(address);
      if (!rawBalance) {
        console.log('Unable to fetch balance');
        return;
      }
  
      const balance = ethers.formatEther(rawBalance.toString());
      console.log('Balance:', balance);
      setBalance(balance);
    } catch (error) {
      console.error('Error in getBalance:', error);
      setBalance(null);
    }
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

  const handleTrackOrder = (orderId: string) => {
    setTrackingOrder(orderId);
    // In a real application, this would fetch tracking information from an API
  };

  const handleRefundRequest = (orderId: string) => {
    setRefundOrder(orderId);
  };

  const submitRefundRequest = () => {
    // In a real application, this would submit the refund request to an API
    setIsRefundSubmitting(true);
    setTimeout(() => {
      setIsRefundSubmitting(false);
      setRefundOrder(null);
      setRefundReason('');
      alert(`Refund request for order ${refundOrder} has been submitted successfully.`);
    }, 1500);
  };

  const renderWalletTab = () => (
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
            <div className={`${isRefreshing ? 'animate-spin' : ''} text-blue-400`}>
              <RefreshIcon />
            </div>
          </button>
        </div>
      </div>

      {/* Send Money Card */}
      <div className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 rounded-xl p-6 backdrop-blur-sm border border-gray-800">
        <div className="flex items-center mb-4">
          <div className="text-blue-400">
            <SendIcon />
          </div>
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
          <div className="text-blue-400">
            <CardIcon />
          </div>
          <h3 className="text-xl font-semibold text-white ml-2">Wallet Details</h3>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-gray-400 break-all">{user?.wallet?.address}</p>
        </div>
      </div>
    </>
  );

  const renderAffiliateTab = () => (
    <div className="space-y-6">
      {/* Affiliate Stats Card */}
      <div className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 rounded-xl p-6 backdrop-blur-sm border border-gray-800">
        <div className="flex items-center mb-4">
          <div className="text-blue-400">
            <AffiliateIcon />
          </div>
          <h3 className="text-xl font-semibold text-white ml-2">Affiliate Dashboard</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Referral Code</p>
            <div className="flex items-center mt-1">
              <p className="text-white font-medium">{affiliateStats.referralCode}</p>
              <button 
                onClick={() => navigator.clipboard.writeText(affiliateStats.referralCode)}
                className="ml-2 text-xs text-blue-400 hover:text-blue-300"
              >
                Copy
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Earnings</p>
            <p className="text-white font-medium mt-1">{affiliateStats.totalEarnings}</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Referrals</p>
            <p className="text-white font-medium mt-1">{affiliateStats.totalReferrals}</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Pending Payouts</p>
            <p className="text-white font-medium mt-1">{affiliateStats.pendingPayouts}</p>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-medium mb-3">Recent Referrals</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {affiliateStats.recentReferrals.map((referral, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{referral.user}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{referral.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        referral.status === 'Active' ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'
                      }`}>
                        {referral.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{referral.commission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Referral Link Card */}
      <div className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 rounded-xl p-6 backdrop-blur-sm border border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-4">Your Referral Link</h3>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            readOnly
            value={`https://yoursite.com/ref/${affiliateStats.referralCode}`}
            className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <button 
            onClick={() => navigator.clipboard.writeText(`https://yoursite.com/ref/${affiliateStats.referralCode}`)}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Copy
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button className="flex items-center justify-center space-x-2 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
            </svg>
            <span className="text-white">Twitter</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
            </svg>
            <span className="text-white">Facebook</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.384,22.779c0.322,0.228 0.737,0.285 1.107,0.145c0.37,-0.141 0.642,-0.457 0.724,-0.84c0.869,-4.084 2.977,-14.421 3.768,-18.136c0.06,-0.28 -0.04,-0.571 -0.26,-0.758c-0.22,-0.187 -0.525,-0.241 -0.797,-0.14c-4.193,1.552 -17.106,6.397 -22.384,8.35c-0.335,0.124 -0.553,0.446 -0.542,0.799c0.012,0.354 0.25,0.661 0.593,0.764c2.367,0.708 5.474,1.693 5.474,1.693c0,0 1.452,4.385 2.209,6.615c0.095,0.28 0.314,0.5 0.603,0.576c0.288,0.075 0.596,-0.004 0.811,-0.207c1.216,-1.148 3.096,-2.923 3.096,-2.923c0,0 3.572,2.619 5.598,4.062Zm-11.01,-8.677l1.679,5.538l0.373,-3.507c0,0 6.487,-5.851 10.185,-9.186c0.108,-0.098 0.123,-0.262 0.033,-0.377c-0.089,-0.115 -0.253,-0.142 -0.376,-0.064c-4.286,2.737 -11.894,7.596 -11.894,7.596Z" />
            </svg>
            <span className="text-white">Telegram</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderOrdersTab = () => (
    <div className="space-y-6">
      {/* Orders List Card */}
      <div className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 rounded-xl p-6 backdrop-blur-sm border border-gray-800">
        <div className="flex items-center mb-4">
          <div className="text-blue-400">
            <OrdersIcon />
          </div>
          <h3 className="text-xl font-semibold text-white ml-2">My Orders</h3>
        </div>
        
        {sampleOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">You haven't placed any orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sampleOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{order.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{order.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{order.product}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{order.amount}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-900/50 text-green-400' : 
                        order.status === 'Shipped' ? 'bg-blue-900/50 text-blue-400' : 
                        'bg-yellow-900/50 text-yellow-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleTrackOrder(order.id)}
                          className="p-1.5 bg-blue-600/30 text-blue-400 rounded hover:bg-blue-600/50 transition-colors duration-200"
                          title="Track Order"
                        >
                          <TrackIcon />
                        </button>
                        <button
                          onClick={() => handleRefundRequest(order.id)}
                          className="p-1.5 bg-purple-600/30 text-purple-400 rounded hover:bg-purple-600/50 transition-colors duration-200"
                          title="Request Refund"
                        >
                          <RefundIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Tracking Modal */}
      {trackingOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 shadow-2xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Order Tracking</h3>
              <button 
                onClick={() => setTrackingOrder(null)}
                className="p-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <CloseIcon />
              </button>
            </div>
            
            {/* Find the order based on the trackingOrder ID */}
            {(() => {
              const order = sampleOrders.find(o => o.id === trackingOrder);
              if (!order) return <p className="text-gray-400">Order not found</p>;
              
              return (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Order ID</p>
                    <p className="text-white">{order.id}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Tracking Number</p>
                    <p className="text-white">{order.trackingNumber}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Current Status</p>
                    <p className="text-white">{order.status}</p>
                  </div>
                  
                  <div className="pt-2">
                    <h4 className="text-white font-medium mb-3">Tracking Timeline</h4>
                    <div className="space-y-4">
                      <div className="relative pl-8 pb-8 border-l border-gray-700">
                        <div className="absolute left-0 top-0 -ml-2.5 h-5 w-5 rounded-full bg-blue-500"></div>
                        <p className="text-blue-400 font-medium">Order Placed</p>
                        <p className="text-gray-400 text-sm">March 1, 2025 - 10:24 AM</p>
                      </div>
                      
                      <div className="relative pl-8 pb-8 border-l border-gray-700">
                        <div className="absolute left-0 top-0 -ml-2.5 h-5 w-5 rounded-full bg-blue-500"></div>
                        <p className="text-blue-400 font-medium">Payment Confirmed</p>
                        <p className="text-gray-400 text-sm">March 1, 2025 - 10:26 AM</p>
                      </div>
                      
                      <div className="relative pl-8 pb-8 border-l border-gray-700">
                        <div className="absolute left-0 top-0 -ml-2.5 h-5 w-5 rounded-full bg-blue-500"></div>
                        <p className="text-blue-400 font-medium">Processing</p>
                        <p className="text-gray-400 text-sm">March 1, 2025 - 11:30 AM</p>
                      </div>
                      
                      <div className={`relative pl-8 ${order.status === 'Delivered' || order.status === 'Shipped' ? 'pb-8 border-l border-gray-700' : ''}`}>
                        <div className={`absolute left-0 top-0 -ml-2.5 h-5 w-5 rounded-full ${order.status === 'Shipped' || order.status === 'Delivered' ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
                        <p className={order.status === 'Shipped' || order.status === 'Delivered' ? 'text-blue-400 font-medium' : 'text-gray-600 font-medium'}>Shipped</p>
                        {(order.status === 'Shipped' || order.status === 'Delivered') && <p className="text-gray-400 text-sm">March 2, 2025 - 9:15 AM</p>}
                      </div>
                      
                      {order.status === 'Delivered' && (
                        <div className="relative pl-8">
                          <div className="absolute left-0 top-0 -ml-2.5 h-5 w-5 rounded-full bg-green-500"></div>
                          <p className="text-green-400 font-medium">Delivered</p>
                          <p className="text-gray-400 text-sm">March 3, 2025 - 2:45 PM</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
            
            <button
              onClick={() => setTrackingOrder(null)}
              className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Refund Request Modal */}
      {refundOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 shadow-2xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Request Refund</h3>
              <button 
                onClick={() => setRefundOrder(null)}
                className="p-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <CloseIcon />
              </button>
            </div>
            
            {(() => {
              const order = sampleOrders.find(o => o.id === refundOrder);
              if (!order) return <p className="text-gray-400">Order not found</p>;
              
              return (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Order ID</p>
                    <p className="text-white">{order.id}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Product</p>
                    <p className="text-white">{order.product}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Amount</p>
                    <p className="text-white">{order.amount}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Reason for Refund</label>
                    <select
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select a reason</option>
                      <option value="defective">Defective product</option>
                      <option value="not_as_described">Not as described</option>
                      <option value="wrong_item">Wrong item received</option>
                      <option value="damaged">Damaged during shipping</option>
                      <option value="other">Other reason</option>
                    </select>
                  </div>
                  
                  {refundReason === 'other' && (
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Additional Details</label>
                      <textarea
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 h-24 resize-none"
                        placeholder="Please provide more details about your refund request..."
                      ></textarea>
                    </div>
                  )}
                </div>
              );
            })()}
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setRefundOrder(null)}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={submitRefundRequest}
                disabled={!refundReason || isRefundSubmitting}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRefundSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-8 backdrop-blur-sm border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Profile Dashboard
              </h2>
              <p className="text-gray-400 mt-2">Manage your crypto assets and orders</p>
            </div>
            <div className="hidden md:block">
              <WalletIcon />
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex mt-8 border-b border-gray-800">
            <button
              onClick={() => setActiveTab('wallet')}
              className={`pb-3 px-4 text-sm font-medium ${
                activeTab === 'wallet'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <WalletIcon />
                <span>Wallet</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('affiliate')}
              className={`pb-3 px-4 text-sm font-medium ${
                activeTab === 'affiliate'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <AffiliateIcon />
                <span>Affiliate</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-3 px-4 text-sm font-medium ${
                activeTab === 'orders'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <OrdersIcon />
                <span>My Orders</span>
              </div>
            </button>
          </div>
        </div>

        {user?.wallet?.address ? (
          <div className="space-y-6">
            {activeTab === 'wallet' && renderWalletTab()}
            {activeTab === 'affiliate' && renderAffiliateTab()}
            {activeTab === 'orders' && renderOrdersTab()}
          </div>
        ) : (
          <div className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 rounded-xl p-6 backdrop-blur-sm border border-gray-800">
            <div className="text-center py-8">
              <div className="mx-auto mb-4 w-16 text-blue-400">
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
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Image from 'next/image';

interface AffiliateDashboardProps {
    walletAddress: string;
    affiliateAddress: any;
    contractAddress: string;
    signer: ethers.Signer | null;
    activeContract: ethers.Contract | null;
}

const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({ 
  walletAddress, 
  affiliateAddress, 
  contractAddress,
  signer,
  activeContract
}) => {
  const [balance, setBalance] = useState('0');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState(null);

  // Check if the logged-in wallet matches the affiliate address
  const isAffiliateOwner = walletAddress && affiliateAddress && 
    walletAddress.toLowerCase() === affiliateAddress.toLowerCase();

  // Fetch the affiliate balance
  useEffect(() => {
    const fetchAffiliateBalance = async () => {
      if (!isAffiliateOwner || !activeContract) return;
      
      try {
        // Assuming there's a method to get affiliate balance in your contract
        // This would be adjusted to match your actual contract method
        const affiliateBalance = await activeContract.getAffiliateBalance(affiliateAddress);
        setBalance(ethers.formatEther(affiliateBalance));
      } catch (error) {
        console.error('Error fetching affiliate balance:', error);
        setBalance('0');
      }
    };

    fetchAffiliateBalance();
  }, [isAffiliateOwner, activeContract, affiliateAddress, withdrawSuccess]);

  const handleWithdraw = async () => {
    if (!isAffiliateOwner || !activeContract || !signer) return;
    
    setIsWithdrawing(true);
    setWithdrawError(null);
    setWithdrawSuccess(false);
    
    try {
      // Connect the contract with signer to make transactions

      setBalance('0'); // Reset balance after successful withdrawal
    } catch (error) {
      console.error('Error withdrawing affiliate balance:', error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  // If not the affiliate owner, don't render anything
  if (!isAffiliateOwner) {
    return (
      <div className="p-6 text-center bg-gray-50 rounded-xl">
        <Image 
          src="/icons/waitlogo.png" 
          alt="Access Denied" 
          width={80} 
          height={80}
          className="mx-auto mb-4 opacity-50"
        />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Affiliate Access Only</h3>
        <p className="text-gray-500">This dashboard is only accessible to the affiliate for this trader page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Affiliate Dashboard</h3>
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-gray-500 mb-1">Your Affiliate Earnings</p>
            <p className="text-3xl font-bold text-indigo-600">{Number(balance).toFixed(6)} ETH</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <Image 
              src="/icons/waitlogo.png" 
              alt="Affiliate" 
              width={64} 
              height={64} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Affiliate Address</p>
            <p className="text-sm font-medium text-gray-700 truncate">{affiliateAddress}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Contract Address</p>
            <p className="text-sm font-medium text-gray-700 truncate">{contractAddress}</p>
          </div>
        </div>

        <button 
          className={`w-full py-4 rounded-lg text-white font-medium text-lg transition-all ${
            Number(balance) > 0 
              ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          onClick={handleWithdraw}
          disabled={Number(balance) <= 0 || isWithdrawing}
        >
          {isWithdrawing ? 'Processing...' : 'Withdraw Earnings'}
        </button>
        
        {withdrawSuccess && (
          <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg">
            Successfully withdrawn your affiliate earnings!
          </div>
        )}
        
        {withdrawError && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {withdrawError}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-8 border border-gray-200">
        <h4 className="text-xl font-semibold text-gray-800 mb-4">How to Earn More</h4>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <span className="text-blue-600">1</span>
            </div>
            <p className="text-gray-600">Share your unique affiliate link with potential customers</p>
          </li>
          <li className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <span className="text-blue-600">2</span>
            </div>
            <p className="text-gray-600">Earn a percentage of sales made through your link</p>
          </li>
          <li className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <span className="text-blue-600">3</span>
            </div>
            <p className="text-gray-600">Withdraw your earnings anytime</p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AffiliateDashboard;
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Image from 'next/image';

interface AffiliateDashboardProps {
    walletAddress: string;
    affiliateAddress: any;
    contractAddress: string;
    storePayouts: string; // The storePayouts contract address, not instance
    signer: ethers.Signer | null;
    activeContract: ethers.Contract | null;
}

const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({ 
  walletAddress, 
  affiliateAddress, 
  contractAddress,
  storePayouts,
  signer,
  activeContract
}) => {
  const [balance, setBalance] = useState('0');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Define the ABI for the storePayouts contract functions we need
  const storePayoutsABI = [
    "function getAffiliateBalance(address _affiliate) external view returns (uint256)",
    "function withdrawAffiliateBalance() external"
  ];

  // Create the contract instance
  const getStorePayoutsContract = (withSigner = false) => {
    if (!storePayouts) return null;
    
    // Use the provided signer for transactions, or a provider for read-only operations
    const signerOrProvider = withSigner && signer ? signer : (signer?.provider || null);
    
    if (!signerOrProvider) return null;
    
    return new ethers.Contract(storePayouts, storePayoutsABI, signerOrProvider);
  };

  // Check if the logged-in wallet matches the affiliate address
  const isAffiliateOwner = walletAddress && affiliateAddress && 
    walletAddress.toLowerCase() === affiliateAddress.toLowerCase();

  // Fetch the affiliate balance
  useEffect(() => {
    const fetchAffiliateBalance = async () => {
      if (!isAffiliateOwner || !storePayouts || !affiliateAddress) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Get read-only contract instance
        const storePayoutsContract = getStorePayoutsContract();
        
        if (!storePayoutsContract) {
          throw new Error("Could not initialize contract");
        }
        
        // Use the contract to get affiliate balance
        const affiliateBalance = await storePayoutsContract.getAffiliateBalance(affiliateAddress);
        setBalance(ethers.formatEther(affiliateBalance));
        console.log(`Affiliate balance fetched: ${ethers.formatEther(affiliateBalance)} ETH`);
      } catch (error) {
        console.error('Error fetching affiliate balance:', error);
        setBalance('0');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAffiliateBalance();
    
    // Set up a refresh interval (every 30 seconds)
    const intervalId = setInterval(fetchAffiliateBalance, 30000);
    
    // Clean up the interval when component unmounts
    return () => clearInterval(intervalId);
  }, [isAffiliateOwner, storePayouts, affiliateAddress, withdrawSuccess, signer]);

  const handleWithdraw = async () => {
    if (!isAffiliateOwner || !storePayouts || !signer) {
      setWithdrawError('Cannot withdraw: missing required connections');
      return;
    }
    
    setIsWithdrawing(true);
    setWithdrawError(null);
    setWithdrawSuccess(false);
    
    try {
      // Get contract instance with signer for transactions
      const storePayoutsWithSigner = getStorePayoutsContract(true);
      
      if (!storePayoutsWithSigner) {
        throw new Error("Could not initialize contract with signer");
      }
      
      // Call the withdrawAffiliateBalance function
      const tx = await storePayoutsWithSigner.withdrawAffiliateBalance();
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      
      console.log('Withdrawal transaction successful:', receipt);
      
      // Set success state
      setWithdrawSuccess(true);
      
      // Refresh balance (should be 0 after successful withdrawal)
      const storePayoutsContract = getStorePayoutsContract();
      if (storePayoutsContract) {
        const newBalance = await storePayoutsContract.getAffiliateBalance(affiliateAddress);
        setBalance(ethers.formatEther(newBalance));
      }
      
    } catch (error: any) {
      console.error('Error withdrawing affiliate balance:', error);
      setWithdrawError(
        error.message || 'Failed to withdraw affiliate balance. Please try again.'
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  // If not the affiliate owner, don't render dashboard details
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
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
                <p className="text-gray-600">Loading balance...</p>
              </div>
            ) : (
              <p className="text-3xl font-bold text-indigo-600">{Number(balance).toFixed(6)} ETH</p>
            )}
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
            <p className="text-sm text-gray-500 mb-1">Store Contract Address</p>
            <p className="text-sm font-medium text-gray-700 truncate">{storePayouts}</p>
          </div>
        </div>

        <button 
          className={`w-full py-4 rounded-lg text-white font-medium text-lg transition-all ${
            Number(balance) > 0 && !isLoading
              ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          onClick={handleWithdraw}
          disabled={Number(balance) <= 0 || isWithdrawing || isLoading}
        >
          {isWithdrawing ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              <span>Processing...</span>
            </div>
          ) : (
            'Withdraw Earnings'
          )}
        </button>
        
        {withdrawSuccess && (
          <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Successfully withdrawn your affiliate earnings!</span>
          </div>
        )}
        
        {withdrawError && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{withdrawError}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-8 border border-gray-200">
        <h4 className="text-xl font-semibold text-gray-800 mb-4">How Affiliate Rewards Work</h4>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full flex items-center justify-center min-w-8 h-8">
              <span className="text-blue-600 font-medium">1</span>
            </div>
            <div>
              <p className="text-gray-700 font-medium">Share your affiliate link</p>
              <p className="text-gray-500 text-sm">Your unique link is automatically recorded when users click through</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full flex items-center justify-center min-w-8 h-8">
              <span className="text-blue-600 font-medium">2</span>
            </div>
            <div>
              <p className="text-gray-700 font-medium">Earn from purchases</p>
              <p className="text-gray-500 text-sm">You earn a percentage of each NFT sale made through your link</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full flex items-center justify-center min-w-8 h-8">
              <span className="text-blue-600 font-medium">3</span>
            </div>
            <div>
              <p className="text-gray-700 font-medium">Withdraw anytime</p>
              <p className="text-gray-500 text-sm">Withdraw your earnings directly to your wallet when ready</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AffiliateDashboard;
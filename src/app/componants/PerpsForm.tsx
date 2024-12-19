import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { usePrivy, useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { EIP155_CHAINS } from '@/data/EIP155Data';

// SVG icon components remain the same
const PowerIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const WalletIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 7v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7m16 0a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2m16 0h-2v3a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V7H8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowDownIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v8m-4-4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowUpIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16V8m-4 4l4-4 4 4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Modal component remains the same
interface ModalProps {
  show: boolean;
  title: string;
  message: string;
  color?: "blue" | "red" | "purple";
  amount?: string;
}

const Modal: React.FC<ModalProps> = ({ show, title, message, color = "blue", amount }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-80">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-white">
            {title}
          </h3>
          <div className="flex justify-center">
            <svg className={`animate-spin h-8 w-8 text-${color}-500`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-400">
            {message}
          </p>
          {amount && (
            <p className="text-lg font-semibold text-white">
              Amount: {amount} WETH
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const PerpsForm: React.FC = () => {
  // Existing state management...
  const [wethBalance, setWethBalance] = useState<string>("0.00");
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [showInitModal, setShowInitModal] = useState<boolean>(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState<boolean>(false);
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [traderPoolAddress, setTraderPoolAddress] = useState<string>("");

  // Contract setup
  const rpcURL = EIP155_CHAINS["eip155:8453"].rpc;
  const provider = useMemo(() => new ethers.JsonRpcProvider(rpcURL), [rpcURL]);
  
  const { user } = usePrivy();
  const { wallets } = useWallets();
  let wallet = wallets[0]; // Default to first wallet

  const profileAddr = '0x4731d542b3137EA9469c7ba76cD16E4a563f0a16';
  const profileABI = require("../abi/profile");
  const tokenPoolABI = require("../abi/traderPool");

  const profileContract = useMemo(() => new ethers.Contract(profileAddr, profileABI, provider), [profileAddr, profileABI, provider]);

  // New function to get the appropriate signer based on wallet type
  const getSigner = async () => {
    if (user?.twitter?.username) {
      let embeddedWallet = getEmbeddedConnectedWallet(wallets);
      let privyProvider = await embeddedWallet?.address;
      
      // Fix the type declaration and assignment
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

  const fetchProfile = useCallback(async () => {
    try {
      let username = user?.wallet?.address;
      if (username) {
        const profile = await profileContract.getProfile(username);
        if (profile && profile.length > 5) {
          const traderPoolAddr = profile[5];
          setTraderPoolAddress(traderPoolAddr);
          
          if (traderPoolAddr !== "0x0000000000000000000000000000000000000000") {
            const traderPoolInstance = new ethers.Contract(traderPoolAddr, tokenPoolABI, provider);
            const balance = await traderPoolInstance.getTotal();
            setWethBalance(ethers.formatEther(balance));
            console.log(traderPoolAddr);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [profileContract, user?.wallet?.address, provider, tokenPoolABI]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleInitialize = async () => {
    if (!traderPoolAddress) return;
    
    setShowInitModal(true);
    try {
      const signer: any = await getSigner();
      if (!signer) throw new Error("Failed to get signer");

      const traderPoolInstance = new ethers.Contract(
        traderPoolAddress, 
        tokenPoolABI, 
        signer
      );
      
      const tx = await traderPoolInstance.interactWithJOJO();
      // Wait for transaction confirmation
      await provider.waitForTransaction(tx.hash, 1);
      
      await fetchProfile();
      // Show success state briefly before closing modal
      setShowInitModal(false);
    } catch (error) {
      console.error('Error initializing JOJO:', error);
      setShowInitModal(false);
    }
  };
  
  const handleDisconnect = async () => {
    if (!traderPoolAddress) return;

    console.log("Disconnecting from JOJO", traderPoolAddress);
  
    setShowDisconnectModal(true);
    try {
      const signer: any = await getSigner();
      if (!signer) throw new Error("Failed to get signer");
      
      const traderPoolInstance = new ethers.Contract(
        traderPoolAddress, 
        tokenPoolABI, 
        signer
      );
      
      const tx = await traderPoolInstance.disconnectJOJO();
      // Wait for transaction confirmation
      await provider.waitForTransaction(tx.hash, 1);
      
      await fetchProfile();
      setShowDisconnectModal(false);
    } catch (error) {
      console.error('Error disconnecting from JOJO:', error);
      setShowDisconnectModal(false);
    }
  };

  const handleDeposit = async () => {
    if (!traderPoolAddress) return;
    
    // Add input validation
    if (!depositAmount || depositAmount === "" || parseFloat(depositAmount) <= 0) {
      console.error('Invalid deposit amount');
      return;
    }
  
    try {
      setShowDepositModal(true);
      const signer: any = await getSigner();
      if (!signer) throw new Error("Failed to get signer");
      
      const traderPoolInstance = new ethers.Contract(
        traderPoolAddress, 
        tokenPoolABI, 
        signer
      );
      
      // Ensure the amount is properly formatted
      const formattedAmount = parseFloat(depositAmount).toFixed(18); // Set precision to 18 decimals
      const amountToWei = ethers.parseEther(formattedAmount);
      
      // Add gas estimation with a buffer
      const gasEstimate = await traderPoolInstance.depositCollateralEth.estimateGas(
        amountToWei,
        { value: amountToWei }
      );
      const gasLimit = gasEstimate * BigInt(120) / BigInt(100); // Add 20% buffer

      
      const tx = await traderPoolInstance.depositCollateralEth(amountToWei, {
        value: amountToWei,
        gasLimit: gasLimit
      });
      
      // Wait for transaction confirmation
      await provider.waitForTransaction(tx.hash, 1);
      
      await fetchProfile();
      setDepositAmount("");
      setShowDepositModal(false);
    } catch (error) {
      console.error('Error depositing funds:', error);
      setShowDepositModal(false);
      // Add user-friendly error handling
      if (error === 'INVALID_ARGUMENT') {
        alert('Please enter a valid deposit amount');
      } else if (error === 'UNPREDICTABLE_GAS_LIMIT') {
        alert('Transaction failed. Please check your balance and try again.');
      } else {
        alert('An error occurred while processing your deposit');
      }
    }
  };

  const handleWithdraw = async () => {
    if (!traderPoolAddress) return;
  
    try {
      setShowWithdrawModal(true);
      const signer: any = await getSigner();
      if (!signer) throw new Error("Failed to get signer");
      
      const traderPoolInstance = new ethers.Contract(
        traderPoolAddress, 
        tokenPoolABI, 
        signer
      );
      
      const amountToWei = ethers.parseEther(withdrawAmount);
      const tx = await traderPoolInstance.JOJOGetProfitFast(amountToWei);
      // Wait for transaction confirmation
      await provider.waitForTransaction(tx.hash, 1);
      
      await fetchProfile();
      setWithdrawAmount("");
      setShowWithdrawModal(false);
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      setShowWithdrawModal(false);
    }
  };


  // Rest of the JSX remains largely the same, just update the balance display
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Perps Trading Panel
          </h2>
          <p className="text-gray-400 text-sm">Manage your perpetual positions</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleInitialize}
            className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/20 group"
          >
            <PowerIcon />
            Initialize
          </button>
          <button 
            onClick={handleDisconnect}
            className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg shadow-red-500/20 group"
          >
            <PowerIcon />
            Disconnect
          </button>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Balance</span>
            <div className="flex items-center space-x-2">
              <WalletIcon />
              <span className="text-lg font-semibold text-white">{wethBalance} WETH</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-gray-800/30 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`flex items-center justify-center space-x-2 py-2 rounded-lg transition-all duration-200 ${
              activeTab === 'deposit' 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowDownIcon />
            <span>Deposit</span>
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex items-center justify-center space-x-2 py-2 rounded-lg transition-all duration-200 ${
              activeTab === 'withdraw' 
                ? 'bg-purple-500 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowUpIcon />
            <span>Take Profit</span>
          </button>
        </div>

        <div className="space-y-4">
          {activeTab === 'deposit' ? (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter WETH amount"
                  className="w-full bg-gray-800/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                />
                <span className="absolute right-4 top-3 text-gray-400">WETH</span>
              </div>
              <button
                onClick={handleDeposit}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg text-white font-medium transition-all duration-200 shadow-lg shadow-blue-500/20"
              >
                Deposit Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount to withdraw"
                  className="w-full bg-gray-800/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200"
                />
                <span className="absolute right-4 top-3 text-gray-400">WETH</span>
              </div>
              <button
                onClick={handleWithdraw}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-lg text-white font-medium transition-all duration-200 shadow-lg shadow-purple-500/20"
              >
                Take Profit
              </button>
            </div>
          )}
        </div>

        {/* All Modals */}
        <Modal 
          show={showInitModal}
          title="Initializing JOJO Exchange"
          message="Please wait while we connect to the exchange..."
          color="blue"
        />
        
        <Modal 
          show={showDisconnectModal}
          title="Disconnecting from JOJO Exchange"
          message="Please wait while we disconnect from the exchange..."
          color="red"
        />
        
        <Modal 
          show={showDepositModal}
          title="Processing Deposit"
          message="Please wait while we process your deposit..."
          color="blue"
          amount={depositAmount}
        />
        
        <Modal 
          show={showWithdrawModal}
          title="Processing Withdrawal"
          message="Please wait while we process your withdrawal..."
          color="purple"
          amount={withdrawAmount}
        />
      </div>
    </div>
  );
};

export default PerpsForm;
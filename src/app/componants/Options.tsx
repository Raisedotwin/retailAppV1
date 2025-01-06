import React, { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import { usePrivy, useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth';
import { EIP155_CHAINS } from '@/data/EIP155Data';
import lodash, { set } from 'lodash';

interface CallOption {
  id: number;
  account: number;
  amount: number;
  strikePrice: number;
  premium: number;
  expiryTime: number;
  active: boolean;
  tokenAddress: string;
  writer: string;
  buyer: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

interface OptionsProps {
  isEnabled?: boolean;
  tokenAddress?: string;
  optionsContract?: any;
  signer?: any;
  traderAddress?: string;
  marketContract?: any;

}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
        {children}
      </div>
    </div>
  );
};

const TableHeader = () => (
  <div className="mb-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-yellow-400 text-3xl animate-bounce">📈</span>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
          Options Arena
        </h2>
        <span className="text-yellow-400 text-3xl animate-bounce delay-100">💎</span>
      </div>
      <div className="flex items-center gap-2 bg-gray-700/50 px-4 py-2 rounded-lg">
        <span className="text-green-400 text-sm">Live Trading</span>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);

const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
const BASE_RATE = 0.001; // 0.1% base premium
const VOLATILITY_SCALING = 0.5; // Scale down volatility impact
const TIME_DECAY_FACTOR = 0.7; // Theta decay factor

const PremiumCalculator = {
  // Calculate intrinsic value (if any)
  calculateIntrinsicValue(
    amount: string,
    currentPrice: string,
    strikePrice: string
  ): string {
    const amountBN = ethers.parseEther(amount);
    // Don't parse currentPrice since it's already in correct format
    const currentPriceBN = BigInt(currentPrice);
    const strikePriceBN = ethers.parseEther(strikePrice);
    
    // For calls, intrinsic value is max(0, current - strike)
    if (currentPriceBN > strikePriceBN) {
      const intrinsicPerToken = currentPriceBN - strikePriceBN;
      let result = intrinsicPerToken * amountBN / ethers.parseEther('1');
      return ethers.formatEther(result);
    }
    return '0';
  },

  // Calculate time value component using square root of time
  calculateTimeValue(
    amount: string,
    currentPrice: string,
    duration: number
  ): string {
    const amountBN = ethers.parseEther(amount);
    // Don't parse currentPrice since it's already in correct format
    const currentPriceBN = BigInt(currentPrice);
    
    // Scale duration to year fraction and apply square root to model time decay
    const yearFraction = duration / SECONDS_PER_YEAR;
    const timeDecay = Math.sqrt(yearFraction) * TIME_DECAY_FACTOR;
    
    // Calculate time value as percentage of current price
    const timeValue = (currentPriceBN * BigInt(Math.floor(timeDecay * 1e4))) / BigInt(1e4);
    
    return ethers.formatEther(
      (timeValue * amountBN) / ethers.parseEther('1')
    );
  },

  // Calculate volatility component
  calculateVolComponent(
    amount: string,
    currentPrice: string,
    volatility: number
  ): string {
    const amountBN = ethers.parseEther(amount);
    // Don't parse currentPrice since it's already in correct format
    const currentPriceBN = BigInt(currentPrice);
    
    // Scale volatility and convert to basis points
    const scaledVol = Math.floor(volatility * VOLATILITY_SCALING * 100);
    
    const volComponent = (currentPriceBN * BigInt(scaledVol)) / BigInt(10000);
    
    return ethers.formatEther(
      (volComponent * amountBN) / ethers.parseEther('1')
    );
  },

  // Calculate minimum premium as percentage of notional value
  calculateMinPremium(
    amount: string,
    currentPrice: string
  ): string {
    const amountBN = ethers.parseEther(amount);
    // Don't parse currentPrice since it's already in correct format
    const currentPriceBN = BigInt(currentPrice);
    const baseRateBips = Math.floor(BASE_RATE * 10000);
    
    return ethers.formatEther(
      (amountBN * currentPriceBN * BigInt(baseRateBips)) / BigInt(10000) / ethers.parseEther('1')
    );
  },

  // Combine all components with proper scaling
  calculateTotalPremium(
    amount: string,
    currentPrice: string,
    strikePrice: string,
    duration: number,
    volatility: number
  ): string {
    // Get individual components
    const intrinsicValue = this.calculateIntrinsicValue(amount, currentPrice, strikePrice);
    const timeValue = this.calculateTimeValue(amount, currentPrice, duration);
    const volComponent = this.calculateVolComponent(amount, currentPrice, volatility);
    const minPremium = this.calculateMinPremium(amount, currentPrice);

    // Sum components
    const total = ethers.parseEther(intrinsicValue) +
                 ethers.parseEther(timeValue) +
                 ethers.parseEther(volComponent) +
                 ethers.parseEther(minPremium);

    // Format with limited decimals for readability
    const formatted = ethers.formatEther(total);
    const premium = parseFloat(formatted).toFixed(6);
    
    return premium.toString();
  }
};

const PaginationControls = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number, 
  totalPages: number, 
  onPageChange: (page: number) => void 
}) => (
  <div className="flex items-center justify-center gap-4 mt-6">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <span className="text-gray-300">←</span>
    </button>
    
    <span className="text-gray-300">
      Page {currentPage} of {totalPages}
    </span>
    
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <span className="text-gray-300">→</span>
    </button>
  </div>
);

const OptionsTable = ({ 
  options, 
  onBuyClick,
  currentPage,
  itemsPerPage = 5
}: { 
  options: CallOption[], 
  onBuyClick: (option: CallOption) => void,
  currentPage: number,
  itemsPerPage?: number
}) => {
  useEffect(() => {
    console.log('Options in table:', options);
  }, [options]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOptions = options.slice(startIndex, endIndex);

  return (
    <div className="bg-gray-800/50 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-700">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="p-4 text-gray-400">ID</th>
            <th className="p-4 text-gray-400">Writer</th>
            <th className="p-4 text-gray-400">Amount 🪙</th>
            <th className="p-4 text-gray-400">Strike Price 💰</th>
            <th className="p-4 text-gray-400">Premium 💎</th>
            <th className="p-4 text-gray-400">Expiry ⏰</th>
            <th className="p-4 text-gray-400">Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedOptions.map((option) => (
            <tr key={option.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
              <td className="p-4 text-gray-300">#{option.id}</td>
              <td className="p-4 font-mono text-gray-300">{option.writer.slice(0, 6)}...{option.writer.slice(-4)}</td>
              <td className="p-4">
                <span className="bg-green-400/10 text-green-400 px-3 py-1 rounded-full">
                  {ethers.formatEther(option.amount)}
                </span>
              </td>
              <td className="p-4">
                <span className="bg-blue-400/10 text-blue-400 px-3 py-1 rounded-full">
                  {ethers.formatEther(option.strikePrice)} ETH
                </span>
              </td>
              <td className="p-4">
                <span className="bg-purple-400/10 text-purple-400 px-3 py-1 rounded-full">
                  {ethers.formatEther(option.premium)} ETH
                </span>
              </td>
              <td className="p-4">
                <span className="bg-yellow-400/10 text-yellow-400 px-3 py-1 rounded-full">
                  {new Date(Number(option.expiryTime) * 1000).toLocaleString()}
                </span>
              </td>
              <td className="p-4">
              <button
                    onClick={() => {
                      console.log('Buy clicked for option ID:', option.id);
                      onBuyClick(option);
                    }}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg"
                    disabled={!option.active || option.buyer !== ethers.ZeroAddress}
                  >
                    🎯 Buy Option
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

  const BuyOptionModal = ({ 
  isOpen, 
  onClose, 
  option, 
  onBuyConfirm,
  priceData,
  isProcessing
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  option: CallOption | null,
  onBuyConfirm: () => void,
  priceData: any,
  isProcessing: boolean
}) => {
  if (!isOpen || !option) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-4">
          🎯 Buy Option #{option.id}
        </h2>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Amount:</span>
            <span className="text-white font-medium">
              {ethers.formatEther(option.amount)} Tokens
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Current Price:</span>
            <span className="text-white font-medium">
              {priceData ? `${priceData} ETH` : '---'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Strike Price:</span>
            <span className="text-white font-medium">
              {ethers.formatEther(option.strikePrice)} ETH
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Premium:</span>
            <span className="text-white font-medium">
              {ethers.formatEther(option.premium)} ETH
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Expiry:</span>
            <span className="text-white font-medium">
              {new Date(Number(option.expiryTime) * 1000).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-300">
            By buying this option, you'll pay {ethers.formatEther(option.premium)} ETH as premium.
            This includes the protocol fee.
          </p>
        </div>

        <div className="flex justify-between gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onBuyConfirm}
            disabled={isProcessing}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <span className="animate-spin">🔄</span>
                Processing...
              </>
            ) : (
              <>
                🎯 Confirm Purchase
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
  

const Options: React.FC<OptionsProps> = ({ isEnabled = true, tokenAddress, optionsContract, signer, traderAddress, marketContract}) => {
  const [showWriteModal, setShowWriteModal] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');
  const [strikePrice, setStrikePrice] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [activeOptions, setActiveOptions] = useState<CallOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [calculatedPremium, setCalculatedPremium] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentTokenPrice, setCurrentTokenPrice] = useState<string | null>(null);

  const [showBuyModal, setShowBuyModal] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<CallOption | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate total pages
  const totalPages = Math.ceil(activeOptions.length / itemsPerPage);

  const { user } = usePrivy();
  const { wallets } = useWallets();

  let rpcURL = EIP155_CHAINS["eip155:8453"].rpc;
  const provider = useMemo(() => new ethers.JsonRpcProvider(rpcURL), [rpcURL]);
  
  const optionsContractAddr = '0xcFfCA669CA2DF02801BB9896aE89C20e2F564FE8';
  const tokenABI = require("../abi/traderToken");
  const optionsABI = require("../abi/shorts");

  const marketABI = require("../abi/tokenMarket");

  // Handle page change
  const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
      }
  };
  

  useEffect(() => {
    const initContract = async () => {
      try {
        let embeddedWallet = getEmbeddedConnectedWallet(wallets);
        let privyProvider = await embeddedWallet?.address;
        console.log('Token Address Options:', tokenAddress);
        console.log('traderAddress:', traderAddress);
        console.log('marketContract:', marketContract); 
        console.log('optionsContract:', provider);

        if (tokenAddress) {
          const activeOptionsResult = await optionsContract.getActiveCallsByToken(tokenAddress);
          const optionsWithContractIds = activeOptionsResult.map((option: CallOption) => ({
            ...option,
            // The id is already included in the contract response, no need to map index
            id: option.id
          }));
          
          setActiveOptions(activeOptionsResult);
          console.log('Active Options:', optionsWithContractIds);

          //const priceData = await fetchPriceData();
          //console.log('Price Data:', priceData);

          //setActiveOptions(activeOptionsResult);
          //console.log('Active Options:', activeOptionsResult);
        }

        console.log('Privy Provider:', privyProvider);
        console.log('Embedded Wallet:', embeddedWallet);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing contract:', error);
        setIsLoading(false);
      }
    };

    initContract();
    fetchPriceData();
    console.log('Token Address:', currentTokenPrice);
  }, [user, wallets, tokenAddress]);

  interface PriceEvent {
  args: {
    price: bigint;
    marketCap: bigint;
  };
  blockNumber: number;
}

interface ProcessedPrice {
  price: number;
  timestamp: number;
}

const fetchPriceData = async () => {
  if (!marketContract || !tokenAddress) return null;

  try {
    const formattedPrice = ethers.parseEther("1"); // 1 token with 18 decimals
    const currentPrice = await marketContract.getBuyPriceAfterFee(
      tokenAddress,
      formattedPrice
    );

    setCurrentTokenPrice(ethers.formatEther(currentPrice));
    console.log('Current Token Price:', ethers.formatEther(currentPrice));

    return {
      currentPrice: currentPrice.toString(),
    };
  } catch (error) {
    console.error('Error fetching token price:', error);
    return null;
  }
};

const fetchMarketData = async () => {
  if (!marketContract || !tokenAddress) return null;

  try {
    // Get current block but handle potential RPC errors
    let currentBlock: number;
    try {
      currentBlock = await provider.getBlockNumber();
      console.log('Current Block:', currentBlock);
    } catch (error) {
      console.error('Error fetching current block:', error);
      return null;
    }

    // Use a smaller block range to avoid RPC timeout
    const fromBlock = Math.max(0, currentBlock - 200); // Last 1000 blocks
    console.log('Querying from block:', fromBlock);
    
    // Create the event filter with explicit typing
    const eventSignature = ethers.id("Price(address,uint256,uint256)");
    const eventFilter = {
      address: marketContract.target,
      topics: [
        eventSignature,
        ethers.zeroPadValue(tokenAddress, 32) // pad the address to 32 bytes
      ],
      fromBlock: fromBlock,
      toBlock: 'latest'
    };
    
    console.log('Event Filter:', eventFilter);

    // Query the events with proper error handling
    const logs = await provider.getLogs(eventFilter);
    console.log('Raw logs:', logs);
    
    const priceEvents: PriceEvent[] = logs.map(log => {
      const parsedLog = marketContract.interface.parseLog({
        topics: log.topics,
        data: log.data
      });
      return {
        args: {
          price: parsedLog?.args[1] ?? BigInt(0), // price is the second parameter
          marketCap: parsedLog?.args[2] ?? BigInt(0) // marketCap is the third parameter
        },
        blockNumber: log.blockNumber
      };
    });
    
    console.log('Number of Price Events:', priceEvents.length);
    
    if (priceEvents.length > 0) {
      console.log('Sample Price Event:', priceEvents[0]);
    }

    // Process prices with proper null checking
    const prices: ProcessedPrice[] = priceEvents
      .map(event => {
        try {
          return {
            price: Number(ethers.formatEther(event.args.price)),
            timestamp: event.blockNumber
          };
        } catch (error) {
          console.error('Error processing event:', error, event);
          return null;
        }
      })
      .filter((price): price is ProcessedPrice => price !== null);

    console.log('Processed Prices:', prices);

    // Calculate volatility from price data
    let volatility = 0;
    if (prices.length > 1) {
      const returns = prices.slice(1).map((price, index) => 
        (price.price - prices[index].price) / prices[index].price
      );
      
      if (returns.length > 0) {
        const avgReturn = lodash.mean(returns);
        volatility = Math.sqrt(
          lodash.mean(
            returns.map(r => Math.pow(r - avgReturn, 2))
          )
        ) * 100;
      }
    }

    // Get current price
    const formattedPrice = ethers.parseEther("1");
    const currentPrice = await marketContract.getBuyPriceAfterFee(
      tokenAddress,
      formattedPrice
    );

    //setCurrentTokenPrice(ethers.formatEther(currentPrice));

    console.log('Current Price:', ethers.formatEther(currentPrice));
    console.log('Calculated Volatility:', volatility);

    return {
      currentPrice: currentPrice.toString(),
      volatility: volatility
    };

  } catch (error) {
    console.error('Error fetching market data:', error);
    return null;
  }
};

const calculatePremium = async () => {
  if (!amount || !strikePrice || !duration) {
    console.log('Missing required fields for premium calculation');
    return;
  }

  setIsCalculating(true);
  
  try {
    const marketData = await fetchMarketData();
    
    if (!marketData) {
      console.error('Failed to fetch market data');
      setIsCalculating(false);
      return;
    }

    const { currentPrice, volatility } = marketData;
    console.log('Market Data:', { currentPrice, volatility });

    // 1. Calculate intrinsic value
    const intrinsicValue = PremiumCalculator.calculateIntrinsicValue(
      amount,
      currentPrice,
      strikePrice
    );
    console.log('Intrinsic Value:', intrinsicValue);

    // 2. Calculate time value with improved decay
    const timeValue = PremiumCalculator.calculateTimeValue(
      amount,
      currentPrice,
      parseInt(duration)
    );
    console.log('Time Value:', timeValue);

    // 3. Calculate volatility component with scaling
    const volComponent = PremiumCalculator.calculateVolComponent(
      amount,
      currentPrice,
      volatility
    );
    console.log('Volatility Component:', volComponent);

    // 4. Calculate minimum premium
    const minPremium = PremiumCalculator.calculateMinPremium(
      amount,
      currentPrice
    );
    console.log('Minimum Premium:', minPremium);

    // Sum all components
    const total = ethers.parseEther(intrinsicValue)
        + (ethers.parseEther(timeValue))
        + (ethers.parseEther(volComponent))
        + (ethers.parseEther(minPremium));

  // Format the total with 6 decimal places for readability
  const totalValue = parseFloat(ethers.formatEther(total)).toFixed(18);
  console.log('Total Premium:', totalValue, 'ETH');

    setCalculatedPremium(totalValue);

  } catch (error) {
    console.error('Error calculating premium:', error);
    setCalculatedPremium('');
  } finally {
    setIsCalculating(false);
  }
};

  const handleWriteOption = async () => {
    if (!optionsContract || !tokenAddress || !calculatedPremium)
      return;

    try {
      const newsigner: any = signer;
      if (!newsigner) throw new Error("Failed to get signer");

      const amountWei = ethers.parseEther(amount);
      const strikePriceWei = ethers.parseEther(strikePrice);
      const premiumWei = ethers.parseEther(calculatedPremium);
      const durationSeconds = parseInt(duration);

      console.log('Token Address:', tokenAddress);
      console.log('Amount:', amountWei);
      console.log('Strike Price:', strikePriceWei);
      console.log('Premium:', premiumWei);
      console.log('Duration:', durationSeconds);
      console.log('Trader Address:', traderAddress);

      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, newsigner);

      const approveTx = await tokenContract.approve(optionsContractAddr, amountWei);
      console.log('Approval transaction submitted:', approveTx.hash);
      const approvalReceipt = await provider.waitForTransaction(approveTx.hash, 1);

      console.log('Approval confirmed in block:', approvalReceipt?.blockNumber);

      const optionsContractTwo = new ethers.Contract(optionsContractAddr, optionsABI, signer);

      const tx = await optionsContractTwo.writeCoveredCall(
        amountWei,
        strikePriceWei,
        durationSeconds,
        premiumWei,
        traderAddress
      );
      console.log('Write option transaction submitted:', tx.hash);
      setShowWriteModal(false);

    } catch (error) {
      console.error('Error writing option:', error);
    }
  };
  if (isLoading) {
    return <div className="text-center py-8">Loading options data...</div>;
  }

  const handleBuyClick = (option: CallOption) => {
    setSelectedOption(option);
    setShowBuyModal(true);
  };

  // Update the handleBuyConfirm function
  const handleBuyConfirm = async () => {
    if (!selectedOption || !optionsContract || !signer) return;

    setIsProcessing(true);
    try {
      console.log('Buying option with ID:', selectedOption.id);
    
      const tx = await optionsContract.buyOption(selectedOption.id, {
        value: selectedOption.premium
      });

      console.log('Buy option transaction submitted:', tx.hash);
      const receipt = await provider.waitForTransaction(tx.hash, 1);
    
      // Refresh the options list
      const activeOptionsResult = await optionsContract.getActiveCallsByToken(tokenAddress);
      setActiveOptions(activeOptionsResult);
    
      setShowBuyModal(false);
      setSelectedOption(null);
    
    } catch (error) {
      console.error('Error buying option:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl shadow-xl">
        <TableHeader />
        
        <OptionsTable 
          options={activeOptions}
          onBuyClick={handleBuyClick}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
        />

        <PaginationControls 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
        {/* ... rest of the existing code ... */}

        <BuyOptionModal
          isOpen={showBuyModal}
          onClose={() => setShowBuyModal(false)}
          option={selectedOption}
          onBuyConfirm={handleBuyConfirm}
          priceData={currentTokenPrice}
          isProcessing={isProcessing}
        />

        <div className="mt-6 text-center">
          <button
            onClick={() => setShowWriteModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg inline-flex items-center gap-2"
          >
            <span className="text-xl">📝</span>
            Write New Option
            <span className="text-xl">💫</span>
          </button>
        </div>

        <Modal isOpen={showWriteModal} onClose={() => setShowWriteModal(false)}>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            📝 Write Covered Call Option
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Amount of Tokens
              </label>
              <input
                type="number"
                min="0"
                step="0.000000000000000001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-gray-100"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">
              Current Token Price (ETH)
              </label>
              <div className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-blue-400">
                {currentTokenPrice ? `${currentTokenPrice} ETH` : 'Loading...'}
              </div>
            </div>


            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Strike Price (ETH)
              </label>
              <input
                type="number"
                min="0"
                step="0.000000000000000001"
                value={strikePrice}
                onChange={(e) => setStrikePrice(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-gray-100"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Duration
              </label>
              <select
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-gray-100"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="">Select Duration</option>
                <option value="1000">15 min</option>
                <option value="1800">30 min</option>
                <option value="3600">1 hour</option>
                <option value="7200">2 hours</option>
                <option value="14400">4 hours</option>
                <option value="28800">8 hours</option>
                <option value="86400">24 hours</option>
                <option value="172800">48 hours</option>
                <option value="259200">72 hours</option>
                <option value="345600">4 days</option>
                <option value="432000">5 days</option>
                <option value="518400">6 days</option>
                <option value="604800">7 days</option>
              </select>
            </div>

            <div className="mt-4 flex justify-center">
              <button
                onClick={calculatePremium}
                disabled={!amount || !strikePrice || !duration || isCalculating}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {isCalculating ? (
                  <>
                    <span className="animate-spin">🔄</span>
                    Calculating...
                  </>
                ) : (
                  <>
                    🧮 Calculate Premium
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
              <h3 className="text-gray-300 text-sm mb-2">Calculated Premium (ETH)</h3>
              <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                {calculatedPremium ? `${calculatedPremium} ETH` : '---'}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Click Calculate Premium after filling in all fields
              </p>
            </div>

            <div className="flex justify-between gap-4 mt-6">
              <button
                onClick={() => setShowWriteModal(false)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleWriteOption}
                disabled={!calculatedPremium}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📝 Write Option
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Options;

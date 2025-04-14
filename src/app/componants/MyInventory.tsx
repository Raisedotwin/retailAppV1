import React, { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import ShippingModal from '../componants/ShippingDetailsModal';
import LoyaltyTokensModal from '../componants/LoyaltyTokensModal';

interface TrackingContract {
  getNFTLiquidityRequirement(launchContract: any, tokenId: string | number): Promise<bigint>;
}

// Add this to your existing interfaces section
interface RewardState {
  rewardEth: string;
  rewardUsd: string;
  isLoading: boolean;
  error: string | null;
}

// 1. Add new interface for discount state (add near the RewardState interface)
interface DiscountState {
  discountPercent: number;
  purchasePriceEth: string;
  purchasePriceUsd: string;
  isLoading: boolean;
  error: string | null;
}

// Add these constants before the MyInventory component
const REWARDS_TRACKER_ADDRESS = "0xceBf8556045ace05342Fb2D221C0E3CB22be3C1D";
const REWARDS_TRACKER_ABI = [
  "function calculateReward(address curveAddress, uint256 tokenId) external view returns (uint256)",
  "function getNFTInfo(address curveAddress, uint256 tokenId) external view returns (uint256 weight, uint256 purchasePrice, uint256 purchaseTime, bool isActive)"
];

interface NFTModalState {
  showSellConfirm: boolean;
  showRedeemConfirm: boolean;
  showPayInFullConfirm: boolean; // New state for pay in full confirmation
  actualPrice: string;
  actualPriceUsd: string;
  isLoadingPrice: boolean;
  transactionError: string;
  paymentAmount: string; // New state for payment amount
  paymentAmountUsd: string; // New state for payment amount in USD
}

interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string;
  priceEth: number;
  priceUsd: number;
  tokenId: string;
  creator: string;
  isRedeemable?: boolean;
  attributes?: {
    category: string;
    size: string;
    baseRedemptionValue?: string;
    shipping?: string;
    condition?: string;
    baseValue?: string;  // Added baseValue attribute
  };
}

interface ShippingDetails {
  recipientName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
  email: string;
}

interface MyInventoryProps {
  nftContract?: any;
  curveContract?: any;
  userAddress?: string;
  useContractData?: boolean;
  activeContract?: any;
  signer?: any;
  marketData?: any;
  showRedeemableLabel?: boolean;
  sellingRestricted?: boolean;
  isExpired?: boolean;
  finallyExpired?: boolean;
  currentPeriod?: any
  curveType?: any,
  trackingContract?: any,
  ordersAbi?: any,
  curveLiqudity?: any,
  contractBalance?: any,
  loyaltyName?: string;
}

// Helper functions
const formatPrice = (ethPrice: number, usdPrice: number): React.ReactNode => {
  if (usdPrice > 0) {
    return (
      <div className="flex flex-col">
        <span className="font-bold text-white">${usdPrice.toFixed(2)}</span>
        <span className="text-xs text-gray-400">{ethPrice.toFixed(5)} ETH</span>
      </div>
    );
  }
  
  // Fallback to just ETH
  const numPrice = ethPrice;
  if (numPrice < 0.00001) {
    return `0.000008 ETH`;
  } else if (numPrice < 1) {
    return `${numPrice.toFixed(4)} ETH`;
  } else {
    return `${numPrice.toFixed(2)} ETH`;
  }
};

const formatEthPrice = (price: string): string => {
  const numPrice = parseFloat(price);
  if (numPrice < 0.00001) {
    return `0.000008 ETH`;
  } else if (numPrice < 1) {
    return `${numPrice.toFixed(4)} ETH`;
  } else {
    return `${numPrice.toFixed(2)} ETH`;
  }
};

// LiquidityRequirement Component with explicit typing
const LiquidityRequirement: React.FC<{
  trackingContract: TrackingContract | null;
  activeContract: { target: string } | null;
  tokenId: string | number;
  baseRedemptionValue: string;
  ethUsdPrice: number;
}> = ({ 
  trackingContract, 
  activeContract, 
  tokenId,
  baseRedemptionValue,
  ethUsdPrice
}) => {
  const [liquidityReq, setLiquidityReq] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLiquidityRequirement = async () => {
      if (!trackingContract || !activeContract || !tokenId) {
        setLiquidityReq(baseRedemptionValue || '0.00000001');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Call the tracking contract to get the liquidity requirement
        const liquidityRequirement = await trackingContract.getNFTLiquidityRequirement(
          activeContract.target,
          tokenId
        );
        
        // Format the value from wei to ETH
        const formattedValue = ethers.formatEther(liquidityRequirement);
        setLiquidityReq(formattedValue);
        
        console.log(`Liquidity requirement for NFT #${tokenId}: ${formattedValue} ETH`);
      } catch (err) {
        console.error('Error fetching liquidity requirement:', err);
        setError('Failed to fetch liquidity requirement');
        setLiquidityReq(baseRedemptionValue || '0.005'); // Fallback to baseRedemptionValue
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiquidityRequirement();
  }, [trackingContract, activeContract, tokenId, baseRedemptionValue]);

  // Show loading state
  if (isLoading) {
    return <span className="inline-block animate-pulse">Loading...</span>;
  }

  // Show error state with fallback value
  if (error) {
    return <span>{baseRedemptionValue || '0.005'} ETH</span>;
  }

  // Display the liquidity requirement with USD value if available
  return (
    <>
      {liquidityReq} ETH
      {ethUsdPrice > 0 && (
        <span className="text-xs text-gray-500 block">
          (${(parseFloat(liquidityReq) * ethUsdPrice).toFixed(2)})
        </span>
      )}
    </>
  );
};

const MyInventory: React.FC<MyInventoryProps> = ({
  nftContract,
  curveContract,
  userAddress,
  useContractData = true,
  activeContract,
  signer,
  marketData,
  showRedeemableLabel = true,
  sellingRestricted,
  isExpired,
  finallyExpired,
  currentPeriod,
  curveType,
  trackingContract,
  ordersAbi,
  curveLiqudity,
  contractBalance,
  loyaltyName
}) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [fetchingPage, setFetchingPage] = useState<number>(1);
  const [hasMoreTokens, setHasMoreTokens] = useState<boolean>(true);
  const [itemsPerPage, setItemsPerPage] = useState<number>(4);
  const [ethUsdPrice, setEthUsdPrice] = useState<number>(0);
  const [isLoadingEthPrice, setIsLoadingEthPrice] = useState(false);

  const [discountState, setDiscountState] = useState<DiscountState>({
    discountPercent: 0,
    purchasePriceEth: '0',
    purchasePriceUsd: '0',
    isLoading: false,
    error: null
  });
  
  // State for shipping modal
  const [showShippingModal, setShowShippingModal] = useState(false);
  // Add new state to track if shipping is for Pay in Full
  const [isShippingForPayInFull, setIsShippingForPayInFull] = useState(false);

  const [loyaltyTokens, setLoyaltyTokens] = useState<string>('0');
  const [showLoyaltyModal, setShowLoyaltyModal] = useState<boolean>(false);

    // Add new state for reward calculation
    const [rewardState, setRewardState] = useState<RewardState>({
      rewardEth: '0',
      rewardUsd: '0',
      isLoading: false,
      error: null
    });


  const [modalState, setModalState] = useState<NFTModalState>({
    showSellConfirm: false,
    showRedeemConfirm: false,
    showPayInFullConfirm: false, // Initialize new state
    actualPrice: '',
    actualPriceUsd: '',
    isLoadingPrice: false,
    transactionError: '',
    paymentAmount: '', // Initialize new payment amount state
    paymentAmountUsd: '' // Initialize new payment amount USD state
  });

  // Create a rewardsTracker contract instance using useMemo
  const rewardsTrackerContract = useMemo(() => {
    if (signer) {
      return new ethers.Contract(REWARDS_TRACKER_ADDRESS, REWARDS_TRACKER_ABI, signer);
    }
    return null;
  }, [signer]);
  
  // Add the fetchRedemptionReward function to calculate the reward
  const fetchRedemptionReward = async (curveAddr: any, tokenId: any) => {
    if (!rewardsTrackerContract || !curveAddr || !tokenId) {
      setRewardState(prev => ({
        ...prev,
        error: 'Contract or token data not initialized',
        isLoading: false
      }));
      return;
    }
    
    try {
      setRewardState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Call the contract function to get the reward
      const reward = await rewardsTrackerContract.calculateReward(curveAddr, tokenId);
      console.log(`Redemption reward for NFT #${tokenId}: ${reward.toString()}`);
      
      // Format the result from Wei to ETH
      const rewardEth = ethers.formatEther(reward);
      
      // Calculate USD value if ethUsdPrice is available
      const rewardUsd = ethUsdPrice > 0 
        ? (parseFloat(rewardEth) * ethUsdPrice).toFixed(2) 
        : '0';
      
      console.log(`Redemption reward for NFT #${tokenId}: ${rewardEth} ETH (${rewardUsd} USD)`);
      
      setRewardState({
        rewardEth,
        rewardUsd,
        isLoading: false,
        error: null
      });
      
    } catch (error) {
      console.error('Error fetching redemption reward:', error);
      setRewardState({
        rewardEth: '0',
        rewardUsd: '0',
        isLoading: false,
        error: 'Failed to calculate reward'
      });
    }
  };

// Simplified discount calculation function - all calculations done in ETH
const calculateDiscount = async (curveAddr: string, tokenId: string, currentPriceEth: number, redemptionValueEth: number) => {
  if (!rewardsTrackerContract || !curveAddr || !tokenId) {
    setDiscountState(prev => ({
      ...prev,
      error: 'Contract or token data not initialized',
      isLoading: false
    }));
    return;
  }
  
  try {
    setDiscountState(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Call the contract function to get the NFT info including purchase price
    const [weight, purchasePrice, purchaseTime, isActive] = await rewardsTrackerContract.getNFTInfo(curveAddr, tokenId);
    
    // Format the purchase price from Wei to ETH
    const purchasePriceEth = parseFloat(ethers.formatEther(purchasePrice));
    console.log(`Original purchase price for NFT #${tokenId}: ${purchasePriceEth} ETH`);
    
    // Calculate USD value if ethUsdPrice is available
    const purchasePriceUsd = ethUsdPrice > 0 
      ? (purchasePriceEth * ethUsdPrice).toFixed(2) 
      : '0';
    
    // SIMPLIFIED CALCULATION
    // For this specific use case:
    // The discount is how much OFF you get from the full price
    // If full price is 0.01 ETH and you're paying 0.0003 ETH, that's 97% off
    
    // Calculate the additional amount needed to reach redemption value
    const additionalPaymentNeeded = Math.max(0, redemptionValueEth - currentPriceEth);
    
    // Calculate discount percentage: (full price - what you need to pay) / full price * 100
    const fullPrice = redemptionValueEth; // The full redemption value
    const discountAmount = fullPrice - additionalPaymentNeeded;
    const discountPercent = Math.round((discountAmount / fullPrice) * 100);
    
    console.log(`Simplified discount calculation for NFT #${tokenId}:`);
    console.log(`- Redemption value (full price): ${redemptionValueEth} ETH`);
    console.log(`- Current price: ${currentPriceEth} ETH`);
    console.log(`- Additional payment needed: ${additionalPaymentNeeded} ETH`);
    console.log(`- Discount amount: ${discountAmount} ETH`);
    console.log(`- Discount percent: ${discountPercent}%`);
    
    // If the discount is close to 100%, cap it at 97% for UX reasons
    const cappedDiscountPercent = discountPercent > 97 ? 97 : discountPercent;
    
    setDiscountState({
      discountPercent: cappedDiscountPercent,
      purchasePriceEth: purchasePriceEth.toString(),
      purchasePriceUsd: purchasePriceUsd,
      isLoading: false,
      error: null
    });
    
  } catch (error) {
    console.error('Error calculating discount:', error);
    setDiscountState({
      discountPercent: 0,
      purchasePriceEth: '0',
      purchasePriceUsd: '0',
      isLoading: false,
      error: 'Failed to calculate discount'
    });
  }
};


  // Fetch ETH price
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        setIsLoadingEthPrice(true);
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        setEthUsdPrice(data.ethereum.usd);
        console.log(`Fetched ETH price: $${data.ethereum.usd}`);
      } catch (err) {
        console.error("Failed to fetch ETH price:", err);
        setEthUsdPrice(3000); // Fallback price
      } finally {
        setIsLoadingEthPrice(false);
      }
    };

    fetchEthPrice();
    const intervalId = setInterval(fetchEthPrice, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Fetch user's NFTs
useEffect(() => {
  const fetchUserNFTs = async () => {
    console.log('Fetching user NFTs...');
    setIsLoading(true);
    
    // Helper function to decode base64 data URI
    const decodeTokenURI = (tokenURI: string) => {
      try {
        if (tokenURI.startsWith('data:application/json;base64,')) {
          const base64Data = tokenURI.split(',')[1];
          const decodedData = Buffer.from(base64Data, 'base64').toString('utf-8');
          return JSON.parse(decodedData);
        } else {
          return JSON.parse(tokenURI);
        }
      } catch (error) {
        console.error('Error decoding token URI:', error);
        return null;
      }
    };

    try {
      if (!nftContract || !signer || !userAddress) {
        console.log('Missing required parameters');
        setNfts([]);
        setIsLoading(false);
        return;
      }

      const nftContractABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
        "function tokenURI(uint256 tokenId) view returns (string)",
        "function ownerOf(uint256 tokenId) view returns (address)",
        "function getOwner(uint256 _tokenId) external view returns (address)",
        "function getBaseValue(uint256 tokenId) external view returns (uint256)",
        "function getCirculatingSupply() external view returns (uint256)",
        "function getBaseRedeemValue(uint256 _tokenId) external view returns (uint)"
      ];

      const contract = new ethers.Contract(nftContract, nftContractABI, signer);
      
      // Get total supply instead of balance
      const totalSupply = await contract.getCirculatingSupply();
      console.log('Total Supply:', totalSupply.toString());

      const fetchedNFTs = [];

      // Loop through each NFT in the total supply
      for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
        try {
          // Check if the current user owns this token
          const owner = await contract.ownerOf(tokenId);
          
          // Only process tokens owned by the current user
          if (owner.toLowerCase() === userAddress.toLowerCase()) {
            console.log(`User owns Token ID: ${tokenId}`);
            
            // Get token URI
            const tokenURI = await contract.tokenURI(tokenId);
            console.log('Token URI:', tokenURI);

            // Decode and parse the metadata
            const metadata = decodeTokenURI(tokenURI);
            if (!metadata) continue;

            console.log('Decoded metadata:', metadata);

            // Get creator address (might be different from current owner)
            const creator = await contract.getOwner(tokenId);
            console.log('Creator:', creator);

            // Get base value
            const baseValue = await contract.getBaseValue(tokenId);
            console.log('Base Value:', baseValue.toString());

            const formattedBaseValue = ethers.formatEther(baseValue);

            // Parse attributes
            const attributes = metadata.attributes as Array<{trait_type: string, value: string | number}> || [];

            const category = attributes.find(attr => 
              attr.trait_type === "Category"
            )?.value?.toString() || "";
            
            const size = attributes.find(attr => 
              attr.trait_type === "Size"
            )?.value?.toString() || "";
            
            const shipping = attributes.find(attr => 
              attr.trait_type === "Shipping"
            )?.value?.toString() || "";
            
            const condition = attributes.find(attr => 
              attr.trait_type === "Condition"
            )?.value?.toString() || "";
            
            const baseRedemptionValue = attributes.find(attr => 
              attr.trait_type === "Required Base Value For Redemption"
            )?.value?.toString() || "";

            // Format the redemption value from wei to ETH
            const formattedRedemptionValue = baseRedemptionValue ? 
              ethers.formatEther(baseRedemptionValue) : "0";


            // Get current sell price from the curve
            const [price, , , ] = await activeContract.getSellPriceAfterFee(baseValue);
            console.log('Sell Price:', ethers.formatEther(price));
            const formattedPrice = ethers.formatEther(price);
            
            // Convert to ETH and USD
            const priceInEth = parseFloat(formattedPrice);
            const priceInUsd = priceInEth * ethUsdPrice;

            // Check if token is redeemable
            let isRedeemable = false; // Default to false
            try {
              // First try to use the contract method if it exists
              try {
                isRedeemable = await contract.isRedeemable(tokenId);
                console.log('Is Redeemable (from contract):', isRedeemable);
              } catch (error) {
                console.log('isRedeemable function not available, will calculate dynamically');
                
                // Get the base redemption value from attributes or use baseValue as fallback
                const baseRedemptionValueBigInt = baseRedemptionValue 
                  ? ethers.parseEther(baseRedemptionValue) 
                  : baseValue;
                
                console.log('Sell Price:', ethers.formatEther(price), 'Base Redemption Value:', ethers.formatEther(baseRedemptionValue));
                
                // Compare sell price with base redemption value
                // Item is redeemable if sell price is greater than or equal to base redemption value
                isRedeemable = price >= baseRedemptionValue;
                console.log('Is Redeemable (calculated):', isRedeemable);
              }
            } catch (error) {
              console.log('Error determining redeemability:', error);
              // If there's an error, default to false for safety
              isRedeemable = false;
            }

            fetchedNFTs.push({
              id: tokenId.toString(),
              name: metadata.name || `NFT #${tokenId.toString()}`,
              description: metadata.description || "No description available",
              image: metadata.image,
              price: formattedPrice,
              priceEth: priceInEth,
              priceUsd: priceInUsd,
              tokenId: tokenId.toString(),
              creator,
              isRedeemable,
              attributes: {
                category,
                size,
                baseRedemptionValue: formattedRedemptionValue,
                shipping,
                condition,
                baseValue: formattedBaseValue // Added baseValue attribute
              }
            });
          }
        } catch (tokenError) {
          console.error(`Error checking token ${tokenId}:`, tokenError);
          continue;
        }
      }

      setNfts(fetchedNFTs);
      console.log('Fetched User NFTs:', fetchedNFTs);
    } catch (error) {
      console.error('Error in fetchUserNFTs:', error);
      setNfts([]);
    } finally {
      setIsLoading(false);
    }
  };

  fetchUserNFTs();
}, [nftContract, signer, userAddress, ethUsdPrice, activeContract]);

  // Update the handleNFTClick function to fetch the reward when an NFT is selected
  // 5. Update the handleNFTClick function to calculate discount
const handleNFTClick = (nft: NFT) => {
  setSelectedNFT(nft);
  setShowModal(true);
  
  // Reset reward state
  setRewardState({
    rewardEth: '0',
    rewardUsd: '0',
    isLoading: true,
    error: null
  });
  
  // Reset discount state
  setDiscountState({
    discountPercent: 0,
    purchasePriceEth: '0',
    purchasePriceUsd: '0',
    isLoading: true,
    error: null
  });
  
  // Fetch the redemption reward
  if (activeContract && activeContract.target) {
    fetchRedemptionReward(activeContract.target, nft.tokenId);
    
    // Calculate discount if the NFT is not already redeemable
    if (!nft.isRedeemable && nft.attributes?.baseRedemptionValue) {
      calculateDiscount(
        activeContract.target, 
        nft.tokenId, 
        nft.priceEth,
        parseFloat(nft.attributes.baseRedemptionValue)
      );
    }
  } else {
    setRewardState(prev => ({
      ...prev,
      error: 'Contract not initialized',
      isLoading: false
    }));
    
    setDiscountState(prev => ({
      ...prev,
      error: 'Contract not initialized',
      isLoading: false
    }));
  }
};

  const handleSell = async (nft: NFT) => {
    try {
      if (!activeContract) {
        throw new Error('Contract not initialized');
      }

      //TESTING CONSOLE
      console.log('is expired:', isExpired);

      
      setModalState(prev => ({ ...prev, isLoadingPrice: true, transactionError: '' }));

      const baseValue = ethers.parseEther(nft.attributes?.baseValue|| "0");
      const [actualPrice, , , ] = await activeContract.getSellPriceAfterFee(baseValue);
      console.log("base value", baseValue);
      
      // Convert price to ETH and USD
      const actualPriceEth = ethers.formatEther(actualPrice);
      const actualPriceUsd = (parseFloat(actualPriceEth) * ethUsdPrice).toFixed(2);
      console.log('Actual Price (ETH):', actualPriceEth);
      
      // Show confirmation modal with actual price
      setModalState(prev => ({
        ...prev,
        showSellConfirm: true,
        showRedeemConfirm: false,
        showPayInFullConfirm: false,
        actualPrice: actualPriceEth,
        actualPriceUsd: actualPriceUsd,
        isLoadingPrice: false
      }));
    } catch (error) {
      console.error('Error getting NFT sell price:', error);
      setModalState(prev => ({
        ...prev,
        isLoadingPrice: false,
        transactionError: 'Error calculating sell price. Please try again.'
      }));
    }
  };
  
  const handleRedeem = async (nft: NFT) => {
    // Check if curve type is 1 (closed curve) - only prevent redemption during trading period
    if (curveType === 1 && currentPeriod === 'trading') {
      setModalState(prev => ({
        ...prev,
        transactionError: 'Redemption is not available for closed curves during the trading period.',
        showSellConfirm: false,
        showRedeemConfirm: false,
        showPayInFullConfirm: false
      }));
      return;
    }
    
    // Check if NFT is redeemable
    if (!nft.isRedeemable) {
      // Display error or notification that NFT is not redeemable
      setModalState(prev => ({
        ...prev,
        transactionError: 'This NFT is not eligible for redemption.',
        showSellConfirm: false,
        showRedeemConfirm: false,
        showPayInFullConfirm: false
      }));
      return;
    }
    
    // Select NFT and open shipping modal directly
    setSelectedNFT(nft);
    setIsShippingForPayInFull(false); // Set flag to indicate this is for redemption
    setShowShippingModal(true);
  };

  // Updated handler for Pay in Full option
  const handlePayInFull = async (nft: NFT) => {
    try {
      if (!activeContract) {
        throw new Error('Contract not initialized');
      }
      
      // Check if this is the right curve type and not expired
      if (curveType !== 2 || isExpired) {
        setModalState(prev => ({
          ...prev,
          transactionError: 'Pay in Full is only available during active second curve phase',
          isLoadingPrice: false
        }));
        return;
      }
      
      setModalState(prev => ({ ...prev, isLoadingPrice: true, transactionError: '' }));

      // Calculate the remaining payment amount needed
      const baseRedemptionValue = nft.attributes?.baseRedemptionValue || "0";
      const fullPaymentEth = parseFloat(baseRedemptionValue);
      const currentValueEth = nft.priceEth;
      
      // Calculate the difference (remaining payment)
      let remainingPaymentEth = fullPaymentEth - currentValueEth;
      
      // Ensure the payment is at least a minimum amount
      remainingPaymentEth = Math.max(remainingPaymentEth, 0.000000000000000001);
      
      const remainingPaymentUsd = (remainingPaymentEth * ethUsdPrice).toFixed(2);
      
      // Show pay in full confirmation modal
      setModalState(prev => ({
        ...prev,
        showSellConfirm: false,
        showRedeemConfirm: false,
        showPayInFullConfirm: true,
        paymentAmount: remainingPaymentEth.toFixed(6),
        paymentAmountUsd: remainingPaymentUsd,
        isLoadingPrice: false
      }));
    } catch (error) {
      console.error('Error calculating payment amount:', error);
      setModalState(prev => ({
        ...prev,
        isLoadingPrice: false,
        transactionError: 'Error calculating payment amount. Please try again.'
      }));
    }
  };
  
  const handleShippingSubmit = async (shippingDetails: ShippingDetails, isExpedited: boolean) => {
    console.log("Shipping details:", shippingDetails);
    console.log("Expedited shipping:", isExpedited);
    
    // Close shipping modal
    setShowShippingModal(false);
    
    if (!selectedNFT) return;
    
    try {
      setIsProcessing(true);
      setModalState(prev => ({ ...prev, transactionError: '' }));
      
      // Get the orders contract
      const ordersContractAddress = "0xbBB16632424aBC8Afa6e7F15066B3349CdA24eeb";
      const ordersContract = new ethers.Contract(ordersContractAddress, ordersAbi, signer);
      
      // Format shipping details for the contract
      const shippingDetailsForContract = [
        shippingDetails.recipientName,
        shippingDetails.streetAddress,
        shippingDetails.city,
        shippingDetails.state,
        shippingDetails.zipCode,
        shippingDetails.country,
      ];
      
      // First, approve the orders contract to transfer the NFT
      const erc721ABI = [
        "function approve(address to, uint256 tokenId) external",
        "function getApproved(uint256 tokenId) external view returns (address)"
      ];
      
      const nftContractWithSigner = new ethers.Contract(nftContract, erc721ABI, signer);
      
      // Check if already approved
      const approved = await nftContractWithSigner.getApproved(selectedNFT.tokenId);
      if (approved !== ordersContractAddress) {
        console.log('Approving orders contract to transfer NFT...');
        const approveTx = await nftContractWithSigner.approve(ordersContractAddress, selectedNFT.tokenId);
        console.log('Approval successful');
      }
      
      try {
        // Submit the transaction without waiting for confirmation
        if (isShippingForPayInFull) {
          // For pay in full
          const paymentAmountWei = ethers.parseEther(modalState.paymentAmount);
          
          console.log('Paying in full for NFT:', selectedNFT.tokenId);
          console.log('Payment amount (ETH):', modalState.paymentAmount);
          
          // Submit transaction
          await ordersContract.createOrder(
            nftContract,
            selectedNFT.tokenId,
            shippingDetailsForContract,
            { value: paymentAmountWei }
          );
          
        } else {
          // For redemption
          console.log('Redeeming NFT:', selectedNFT.tokenId);
          
          // Submit transaction
          await ordersContract.createOrder(
            nftContract,
            selectedNFT.tokenId,
            shippingDetailsForContract,
            { value: ethers.parseEther("0") }
          );
        }
        
        let loyaltyAwardAmount = "250"; // Default fallback value

        if (contractBalance) {
        try {
          // Clean up the contract balance value first
          let cleanedBalance = contractBalance;
    
          // If contractBalance is a string that looks like a decimal number
          if (typeof contractBalance === 'string' && contractBalance.includes('.')) {
            // Remove any decimal part as ethers.formatEther expects a BigInt
            cleanedBalance = contractBalance.split('.')[0];
          }
    
          console.log('Raw contract balance:', contractBalance);
          console.log('Cleaned balance:', cleanedBalance);
    
          // Convert to BigInt first
          let balanceAsBigInt;
          try {
            balanceAsBigInt = BigInt(cleanedBalance.toString().replace(/[^\d]/g, ''));
            console.log('Balance as BigInt:', balanceAsBigInt.toString());
          } catch (bigIntError) {
            console.error('Error converting to BigInt:', bigIntError);
            // Try a different approach - treat it as a number directly
            const numericValue = parseFloat(cleanedBalance.toString().replace(/[^\d.]/g, ''));
            console.log('Using numeric value directly:', numericValue);
      
            // Calculate 2% of the balance directly
            const awardAmount = numericValue * 0.02;
            loyaltyAwardAmount = Math.round(awardAmount).toString();
            throw new Error('Used numeric approach instead'); // Skip the BigInt conversion path
          }
    
          // Convert from Wei to ETH (1 ETH = 10^18 Wei)
          const balanceInEth = Number(balanceAsBigInt) / 1e18;
    
          // Calculate 2% of the balance
          const awardAmount = balanceInEth * 0.02;
    
          // Round to nearest whole number for better UX
         loyaltyAwardAmount = Math.round(awardAmount).toString();
    
        console.log(`Contract balance: ${balanceInEth} ETH`);
        console.log(`Loyalty award (2%): ${loyaltyAwardAmount} tokens`);
      } catch (calcError) {
        console.error('Error calculating loyalty tokens from balance:', calcError);
         // Use the default value if calculation fails
      }
    }

      // Ensure it's always at least 50 tokens for a better user experience
      const minTokens = 50;
      const tokenAmount = Math.max(parseInt(loyaltyAwardAmount || "0"), minTokens);
      const formattedTokens = tokenAmount.toLocaleString();

        // Show the loyalty tokens modal
        setLoyaltyTokens(formattedTokens);
        setShowLoyaltyModal(true);
        // Reset other modal states
        setModalState(prev => ({
          ...prev,
          showRedeemConfirm: false,
          paymentAmount: '',
          paymentAmountUsd: ''
        }));
        setShowModal(false);
        
      } catch (txError) {
        console.error('Transaction error:', txError);
        throw txError;
      }
    } catch (error) {
      console.error('Error processing order:', error);
      setModalState(prev => ({
        ...prev,
        transactionError: 'Failed to process order. Please try again.'
      }));
      setIsProcessing(false);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Updated confirmPayInFull function to handle the 2-step process
  const confirmPayInFull = (nft: any) => {
    if (!nft) return;

    // Close the payment confirmation modal
    setModalState(prev => ({
      ...prev,
      showPayInFullConfirm: false
    }));
    
    // Set flag to indicate this shipping is for pay in full
    setIsShippingForPayInFull(true);

    if (!selectedNFT) {
      setSelectedNFT(nft);
    }
    
    // Now open shipping modal to collect shipping details
    setShowShippingModal(true);
  };
  
  const confirmSell = async (nft: NFT) => {
    try {
      setIsProcessing(true);
      setModalState(prev => ({ ...prev, transactionError: '' }));
  
      if (!activeContract) {
        throw new Error('Contract not initialized');
      }
  
      // First, approve the marketplace contract to transfer the NFT
      const erc721ABI = [
        "function approve(address to, uint256 tokenId) external",
        "function getApproved(uint256 tokenId) external view returns (address)"
      ];

      
      const nftContractWithSigner = new ethers.Contract(nftContract, erc721ABI, signer);
      
      // Check if already approved
      const approved = await nftContractWithSigner.getApproved(nft.tokenId);
      console.log('Approved address:', approved);
      if (approved !== activeContract.target) {
        console.log('Approving marketplace to transfer NFT...');
        const approveTx = await nftContractWithSigner.approve(activeContract.target, nft.tokenId);
        console.log('Approval successful');
      }

      const launchABI = [
        "function sellNFT(uint256 tokenId) external payable",
      ];

      const createContractInstance = new ethers.Contract(activeContract.target, launchABI, signer);
      // Now sell the NFT
      console.log('Selling NFT:', nft.tokenId);
      const tx = await createContractInstance.sellNFT(nft.tokenId);
      console.log('NFT sold successfully');
  
      // Reset states and close modals
      setModalState(prev => ({
        ...prev,
        showSellConfirm: false,
        actualPrice: '',
        actualPriceUsd: ''
      }));
      setShowModal(false);
      
      // Refresh the page or NFT list
      window.location.reload();
  
    } catch (error) {
      console.error('Error selling NFT:', error);
      setModalState(prev => ({
        ...prev,
        transactionError: 'Failed to sell NFT. Please try again.'
      }));
    } finally {
      setIsProcessing(false);
    }
  };


  // Pagination
  const totalPages = Math.ceil(nfts.length / itemsPerPage);
  const currentNFTs = nfts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-2xl shadow-lg">
        <div className="animate-spin text-3xl mr-2">⏳</div>
        <span className="text-gray-600 font-medium">Loading your NFT inventory...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mt-8">
      {/* Header section */}
<div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
      </svg>
      <h2 className="text-2xl font-bold text-white">
        My Inventory
      </h2>
    </div>
    <div className="flex items-center gap-4">
      {/* Selling Restriction Badge */}
      {sellingRestricted && (
        <div className="bg-red-500/90 px-3 py-2 rounded-lg text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1 text-white">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
          </svg>
          <span className="text-white font-medium">Selling Restricted - Redeem Only</span>
        </div>
      )}
      {/* Expired Badge in Header */}
{isExpired && (
  <div className="bg-red-500/90 px-3 py-2 rounded-lg text-sm flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1 text-white">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
    </svg>
    <span className="text-white font-medium">Curve Expired - Sell Disabled</span>
  </div>
)}
      {/* ETH price indicator */}
      {ethUsdPrice > 0 && (
        <div className="bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 417" preserveAspectRatio="xMidYMid" className="w-4 h-4 mr-1 text-white">
            <path fill="currentColor" d="M127.962 0L0 212.32l127.962 75.639V154.158z" />
            <path fill="currentColor" d="M127.962 416.905v-104.72L0 236.585z" />
            <path fill="currentColor" d="M0 212.32l127.96 75.638v-133.8z" />
          </svg>
          <span className="text-white">1 ETH = <span className="font-bold">${ethUsdPrice.toLocaleString()}</span></span>
        </div>
      )}
      <div className="bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg text-sm">
        <span className="text-white">Total Items: <span className="font-bold">{nfts.length}</span></span>
      </div>
    </div>
  </div>
</div>
  
      {/* NFT Grid */}
      <div className="p-6">
        {currentNFTs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">🖼️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No NFTs in Your Inventory</h3>
            <p className="text-gray-500">You don't own any NFTs from this collection yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
             
             {currentNFTs.map((nft) => (
  <div
    key={nft.id}
    onClick={() => handleNFTClick(nft)}
    className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-purple-300
             shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-5px] cursor-pointer
             relative"
  >
    <div className="aspect-square overflow-hidden relative">
      <img
        src={nft.image}
        alt={nft.name}
        className="w-full h-full object-cover transform transition-transform hover:scale-110"
      />
      {/* Current value badge */}
      {nft.priceUsd > 0 && (
        <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-md">
          <span className="text-purple-600 font-bold">${nft.priceUsd.toFixed(2)}</span>
        </div>
      )}
      
      {/* Modified badge - show either Redeemable, Non-Redeemable for closed curves, or Discount percentage */}
      {showRedeemableLabel && (
        nft.isRedeemable ? (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full shadow-md font-bold text-xs uppercase
                       bg-green-500 text-white animate-pulse">
            REDEEMABLE
          </div>
          //or curv is ovr 
        ) : curveType === 1 ? (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full shadow-md font-bold text-xs uppercase
                       bg-gray-500 text-white">
            NON-REDEEMABLE
          </div>
        ) : (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full shadow-md font-bold text-xs uppercase
                       bg-orange-500 text-white">
            DISCOUNTED
          </div>
        )
      )}
      
      {/* Closed Curve Badge - show only when curveType is 1 */}
      {curveType === 1 && (
        <div className="absolute bottom-3 left-3 px-3 py-1 bg-amber-500 text-white rounded-full shadow-md font-bold text-xs">
          Closed Curve
        </div>
      )}
    </div>
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{nft.name}</h3>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleSell(nft);
            }}
            disabled={isProcessing || modalState.isLoadingPrice || sellingRestricted || isExpired}
            className="px-3 py-1 bg-purple-500 text-white rounded-lg font-medium
              hover:bg-purple-600 transition-all text-xs
              disabled:opacity-50 disabled:cursor-not-allowed"
            title={isExpired ? "Curve expired, selling not available" : ""}
          >
            {modalState.isLoadingPrice ? 'Loading...' : isExpired ? 'Expired' : 'Sell'}
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleRedeem(nft);
            }}
            disabled={isProcessing || !nft.isRedeemable || (curveType === 1 && currentPeriod === 'trading')}
            className={`px-3 py-1 rounded-lg font-medium transition-all text-xs
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${nft.isRedeemable && !(curveType === 1 && currentPeriod === 'trading')
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-400 text-white'}`}
            title={curveType === 1 && currentPeriod === 'trading' ? "Redemption is not available for closed curves during trading period" : ""}
          >
            Redeem
          </button>
          {/* Updated Pay in Full button - only show when curveType is 2 and not expired */}
          {curveType === 2 && !isExpired && !nft.isRedeemable && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handlePayInFull(nft);
              }}
              disabled={isProcessing || nft.isRedeemable}
              className="px-3 py-1 rounded-lg font-medium transition-all text-xs
                       bg-blue-500 text-white hover:bg-blue-600
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Get Now!
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
))}
          </div>
        )}
      </div>

      {/* Load More Button */}
      {nfts.length > 0 && hasMoreTokens && (
        <div className="flex justify-center mt-2 mb-6">
          <button
            onClick={() => setFetchingPage(prev => prev + 1)}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium
                      hover:bg-purple-200 transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin text-lg">⏳</div>
                <span>Loading more NFTs...</span>
              </>
            ) : (
              <>
                <span>Load More NFTs</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </>
            )}
          </button>
        </div>
      )}
  
      {/* Enhanced Pagination Controls */}
      {currentNFTs.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 p-6 border-t border-gray-200">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-colors"
          >
            <span className="text-gray-600">←</span>
          </button>
          
          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {/* Always show first page */}
            {currentPage > 3 && (
              <>
                <button 
                  onClick={() => setCurrentPage(1)}
                  className={`h-8 w-8 flex items-center justify-center rounded-md
                            ${currentPage === 1 ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  1
                </button>
                {currentPage > 4 && <span className="text-gray-400">...</span>}
              </>
            )}
            
            {/* Show pages around current page */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <button 
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 w-8 flex items-center justify-center rounded-md
                              ${currentPage === pageNum ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
            
            {/* Always show last page */}
            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <span className="text-gray-400">...</span>}
                <button 
                  onClick={() => setCurrentPage(totalPages)}
                  className={`h-8 w-8 flex items-center justify-center rounded-md
                            ${currentPage === totalPages ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-colors"
          >
            <span className="text-gray-600">→</span>
          </button>
        </div>
      )}

      {/* Items per page selector */}
      {nfts.length > 0 && (
        <div className="flex justify-center items-center gap-2 pb-6 text-sm text-gray-600">
          <span>Items per page:</span>
          <select 
            value={itemsPerPage}
            onChange={(e) => {
              const newItemsPerPage = parseInt(e.target.value);
              setItemsPerPage(newItemsPerPage);
              setCurrentPage(1); // Reset to first page when changing items per page
            }}
            className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="4">4</option>
            <option value="8">8</option>
            <option value="12">12</option>
            <option value="16">16</option>
          </select>
        </div>
      )}
  
  {showModal && selectedNFT && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 my-8 max-h-[85vh] overflow-y-auto">
      {/* Modal header with close button and status badge */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-800">{selectedNFT.name}</h2>
          {/* Status badge in header - updated for closed curves */}
          {selectedNFT.isRedeemable ? (
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-0.5 rounded-full uppercase">
              Redeemable
            </span>
          ) : curveType === 1 ? (
            <span className="bg-gray-500 text-white text-xs font-bold px-3 py-0.5 rounded-full uppercase">
              Non-Redeemable
            </span>
          ) : (
            <span className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs font-bold px-3 py-0.5 rounded-full uppercase">
              {discountState.isLoading ? (
                <span className="flex items-center">
                  <div className="animate-spin mr-1 h-3 w-3 border-t-2 border-white border-r-2 rounded-full"></div>
                  Loading...
                </span>
              ) : discountState.error ? (
                "Discount"
              ) : (
                // If discount is 100%, show as 0% OFF
                discountState.discountPercent === 100 ? "0% OFF" : `${discountState.discountPercent}% OFF`
              )}
            </span>
          )}
        </div>
        <button 
          onClick={() => setShowModal(false)}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Left column - Image and primary info */}
        <div className="md:w-1/2 p-4 border-r border-gray-100">
          <div className="bg-gray-50 rounded-lg overflow-hidden shadow-md">
            <img
              src={selectedNFT.image}
              alt={selectedNFT.name}
              className="w-full h-auto object-contain max-h-[300px]"
            />
          </div>
          
          {/* Description under image */}
          {selectedNFT.description && (
            <div className="mt-4 text-gray-600 text-sm p-3 bg-gray-50 rounded-lg">
              <p>{selectedNFT.description}</p>
            </div>
          )}
          
          {/* Pricing and Status info */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Current Price</h4>
              <div className="font-bold text-gray-800">${selectedNFT.priceUsd.toFixed(2)}</div>
              <div className="text-xs text-gray-500">{selectedNFT.priceEth.toFixed(5)} ETH</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Redemption Price</h4>
              <div className="font-bold text-gray-800">
                {selectedNFT.attributes?.baseRedemptionValue || 'N/A'} ETH
              </div>
              {ethUsdPrice > 0 && selectedNFT.attributes?.baseRedemptionValue && (
                <div className="text-xs text-gray-500">
                  (${(parseFloat(selectedNFT.attributes.baseRedemptionValue) * ethUsdPrice).toFixed(2)})
                </div>
              )}
            </div>
          </div>
          
          {/* Buy Now Discount Section - only for non-redeemable NFTs and NOT closed curves */}
          {!selectedNFT.isRedeemable && selectedNFT.attributes?.baseRedemptionValue && curveType !== 1 && (
            <div className="mt-4 bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
              <h3 className="text-orange-800 font-semibold flex items-center gap-2 mb-3 text-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                Get Now Discount
              </h3>
              
              <div className="bg-white p-3 rounded-lg border border-orange-100">
                {discountState.isLoading ? (
                  <div className="flex items-center justify-center py-3">
                    <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-orange-500 border-r-2 rounded-full"></div>
                    <span className="text-gray-600">Calculating discount...</span>
                  </div>
                ) : discountState.error ? (
                  <div className="text-red-500 flex items-center justify-center py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    Failed to calculate discount
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-700">Your price:</span>
                      <span className="text-2xl font-bold text-orange-600">
                        {/* Show "No Discount" for 100% discount */}
                        {discountState.discountPercent === 100 ? "No Discount" : `${discountState.discountPercent}% OFF`}
                      </span>
                    </div>
                    
                    <div className="bg-orange-50 p-3 rounded-lg mb-3">
                      {/*<div className="grid grid-cols-2 gap-2 text-sm">*/}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Original purchase:</p>
                          <p className="text-gray-700 font-medium">{discountState.purchasePriceEth} ETH</p>
                          {ethUsdPrice > 0 && (
                            <p className="text-xs text-gray-500">${discountState.purchasePriceUsd}</p>
                          )}
                        </div>
                        {/*<div>
                          <p className="text-xs text-gray-500 mb-1">Current market value:</p>
                          <p className="text-gray-700 font-medium">{selectedNFT.priceEth.toFixed(5)} ETH</p>
                          {ethUsdPrice > 0 && (
                            <p className="text-xs text-gray-500">${selectedNFT.priceUsd.toFixed(2)}</p>
                          )}
                        </div>
                      </div>*/}
                              
                    {/*<p className="text-sm text-gray-600 mb-3">
                      Pay the remaining amount to get this item at a discount from its full redemption value of {selectedNFT.attributes.baseRedemptionValue} ETH.
                    </p>*/}
                    </div>
                    
                    {/* Call to action button - with colored background and 0% OFF handling */}
                    {curveType === 2 && !isExpired && (
                      <button
                        onClick={() => handlePayInFull(selectedNFT)}
                        disabled={isProcessing}
                        className="w-full py-2.5 bg-orange-500 text-white rounded-lg font-medium
                                hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-white border-r-2 rounded-full"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            Get Now {discountState.discountPercent === 100 ? "" : `at ${discountState.discountPercent}% OFF`}
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Closed Curve Information Section - replaces discount section for closed curves */}
          {!selectedNFT.isRedeemable && curveType === 1 && (
            <div className="mt-4 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200">
              <h3 className="text-amber-800 font-semibold flex items-center gap-2 mb-3 text-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                Closed Curve Information
              </h3>
              
              <div className="bg-white p-3 rounded-lg border border-amber-100">
                <p className="text-gray-700 mb-3">
                  This NFT is part of a closed curve offering. It has the following characteristics:
                </p>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 mt-1">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Trading Period Only:</span> During the trading period, this NFT can only be traded, not redeemed.
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 mt-1">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Redemption Period:</span> Redemption will be available after the trading period expires.
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 mt-1">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Value Requirement:</span> The NFT must reach its redemption value of {selectedNFT.attributes?.baseRedemptionValue || '0.005'} ETH to be redeemable.
                    </p>
                  </div>
                </div>
                
                <div className="bg-amber-50 p-3 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <span className="font-bold">Current Status:</span> This NFT is not yet eligible for redemption. You may hold it until the redemption period or sell it on the market.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right column - Detailed information */}
        <div className="md:w-1/2 p-4 space-y-4">
          {/* Redemption Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-blue-800 font-semibold flex items-center gap-2 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              Redemption Conditions
            </h3>
            
            <div className="space-y-3">
              {/* During Trading Period */}
              <div className={`bg-white p-3 rounded-lg border ${curveType === 1 ? 'border-amber-100' : 'border-blue-100'}`}>
                <h4 className="text-sm font-medium text-blue-800 mb-1">During Trading Period</h4>
                {curveType === 1 ? (
                  <p className="text-sm text-amber-700">
                    <span className="font-bold">Trading Only:</span> During the trading period, this NFT can only be traded. Redemption will be available after the trading period expires.
                  </p>
                ) : (
                  <p className="text-sm text-blue-700">
                    To redeem this NFT for the physical item during the trading period, its price must reach <span className="font-bold">{selectedNFT.attributes?.baseRedemptionValue || '0.005'} ETH</span> (Market Value).
                  </p>
                )}
              </div>
              
              {/* After Expiry */}
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <h4 className="text-sm font-medium text-blue-800 mb-1">After Expiry (Redemption Period)</h4>
                <div className="text-sm text-blue-700">
                  <p>
                    After curve expiry, this NFT can be redeemed when the total liquidity pool value reaches:
                  </p>
                  <p className="font-bold mt-1">
                    <LiquidityRequirement 
                      trackingContract={trackingContract} 
                      activeContract={activeContract} 
                      tokenId={selectedNFT.tokenId} 
                      baseRedemptionValue={selectedNFT.attributes?.baseRedemptionValue || '0.005'}
                      ethUsdPrice={ethUsdPrice}
                    />
                  </p>
                </div>
              </div>
              
              {/* Current Status */}
              <div className={`${currentPeriod === 'trading' ? 'bg-green-50 border-green-100' : 
                               currentPeriod === 'redemption' ? 'bg-amber-50 border-amber-100' : 
                               'bg-gray-50 border-gray-100'} 
                              p-3 rounded-lg border`}>
                <h4 className="text-sm font-medium mb-1 text-gray-800">Current Status</h4>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${
                    currentPeriod === 'trading' ? 'bg-green-500' : 
                    currentPeriod === 'redemption' ? 'bg-amber-500' : 
                    'bg-gray-500'
                  }`}></span>
                  <p className="text-sm font-medium">
                    {currentPeriod === 'trading' ? 'Trading Period Active' : 
                     currentPeriod === 'redemption' ? 'Redemption Period Active' : 
                     'Expired'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Redemption Reward Section */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-green-800 font-semibold flex items-center gap-2 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Estimated Redemption Reward
            </h3>
            
            <div className="bg-white p-3 rounded-lg border border-green-100">
              {rewardState.isLoading ? (
                <div className="flex items-center justify-center py-3">
                  <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-blue-500 border-r-2 rounded-full"></div>
                  <span className="text-gray-600">Calculating reward...</span>
                </div>
              ) : rewardState.error ? (
                <div className="text-red-500 flex items-center py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  Failed to calculate reward
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-700">Reward after curve expiry:</span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-green-600">{rewardState.rewardEth} ETH</span>
                      {ethUsdPrice > 0 && (
                        <div className="text-sm text-gray-500">
                          (${rewardState.rewardUsd})
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 bg-green-50 p-2 rounded">
                    This is your estimated additional reward when you redeem this item after the trading period ends.
                  </p>
                </>
              )}
            </div>
          </div>
          
          {/* Attributes section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Attributes</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Size</p>
                <p className="text-gray-700 font-medium">{selectedNFT.attributes?.size || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Category</p>
                <p className="text-gray-700 font-medium">{selectedNFT.attributes?.category || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Condition</p>
                <p className="text-gray-700 font-medium">{selectedNFT.attributes?.condition || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Shipping</p>
                <p className="text-gray-700 font-medium">{selectedNFT.attributes?.shipping || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Token ID</p>
                <p className="text-green-600 font-medium">{selectedNFT.tokenId}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  selectedNFT.isRedeemable ? 'bg-green-100 text-green-800' :
                  curveType === 1 ? 'bg-gray-100 text-gray-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {selectedNFT.isRedeemable ? 'Redeemable' : 
                   curveType === 1 ? 'Non-Redeemable' :
                   discountState.isLoading ? 'Calculating...' : 
                   discountState.discountPercent === 100 ? '0% OFF' : `${discountState.discountPercent}% OFF`}
                </span>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 mt-4">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <button 
              onClick={() => handleSell(selectedNFT)}
              disabled={isProcessing || modalState.isLoadingPrice || sellingRestricted || isExpired}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium
                hover:bg-purple-700 transition-all
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {modalState.isLoadingPrice ? 'Calculating...' : 
                isProcessing ? 'Processing...' : 'Sell'}
            </button>
            <button 
              onClick={() => handleRedeem(selectedNFT)}
              disabled={isProcessing || !selectedNFT.isRedeemable || (curveType === 1 && currentPeriod === 'trading')}
              className={`px-4 py-2 rounded-lg font-medium transition-all
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${selectedNFT.isRedeemable && !(curveType === 1 && currentPeriod === 'trading')
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-gray-400 text-white'}`}
              title={curveType === 1 && currentPeriod === 'trading' ? "Redemption is not available for closed curves during trading period" : ""}
            >
              {isProcessing ? 'Processing...' : 'Redeem'}
            </button>
            {/* Conditional Pay in Full button - only show for curve type 2 (not for closed curves) */}
            {curveType === 2 && !isExpired && !selectedNFT.isRedeemable && (
              <button 
                onClick={() => handlePayInFull(selectedNFT)}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg font-medium transition-all
                          bg-orange-500 text-white hover:bg-orange-600
                          disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 
                 discountState.isLoading ? 'Buy Now' : 
                 discountState.discountPercent === 100 ? 'Buy Now' : `${discountState.discountPercent}% OFF`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)}
  
  {/* Sell Confirmation Modal */}
{modalState.showSellConfirm && selectedNFT && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Sale</h3>
      
      <div className="bg-purple-50 p-4 rounded-lg mb-6 border border-purple-100">
        <p className="text-gray-600 mb-2">You will receive:</p>
        <p className="text-2xl font-bold text-purple-600 mb-1">
          ${modalState.actualPriceUsd}
        </p>
        <p className="text-sm text-gray-500">
          {modalState.actualPrice} ETH
        </p>
      </div>

      {/* Display error message for expired curve */}
      {isExpired && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>The bonding curve has expired. NFTs can no longer be sold.</span>
          </div>
        </div>
      )}

      {modalState.transactionError && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4">
          {modalState.transactionError}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setModalState(prev => ({ ...prev, showSellConfirm: false }))}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          onClick={() => confirmSell(selectedNFT)}
          disabled={isProcessing || isExpired}
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg
                  hover:bg-purple-700 transition-all disabled:opacity-50 font-medium"
        >
          {isProcessing ? 'Processing...' : isExpired ? 'Curve Expired' : 'Confirm Sale'}
        </button>
      </div>
    </div>
  </div>
)}
      
     
{/* Redeem Confirmation Modal - Updated to remove the confirm button since we now use shipping first */}
{modalState.showRedeemConfirm && selectedNFT && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Redemption Submitted</h3>
            
            <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-100">
              <div className="flex justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <p className="text-center text-gray-700 font-medium mb-2">
                Your redemption request has been submitted successfully!
              </p>
              <p className="text-center text-sm text-gray-500">
                You'll receive your physical item at the shipping address you provided.
              </p>
            </div>
  
            {modalState.transactionError && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4">
                {modalState.transactionError}
              </div>
            )}
  
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setModalState(prev => ({ ...prev, showRedeemConfirm: false }));
                  setShowModal(false);
                  // Refresh the page
                  window.location.reload();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg
                        hover:bg-green-700 transition-all font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      

      {/* New Pay in Full Confirmation Modal */}
      {modalState.showPayInFullConfirm && selectedNFT && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Buy Now!</h3>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
              <p className="text-gray-600 mb-2">You are about to pay the remaining amount to make this item eligible for redemption:</p>
              <p className="text-xl font-bold text-blue-600 mb-1">
                ${modalState.paymentAmountUsd}
              </p>
              <p className="text-sm text-gray-500">
                {modalState.paymentAmount} ETH
              </p>
              
              <div className="mt-4 bg-blue-100 p-3 rounded">
                <p className="text-blue-700 text-sm font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  After payment, this NFT will become redeemable for the physical item.
                </p>
              </div>
            </div>
  
            {modalState.transactionError && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4">
                {modalState.transactionError}
              </div>
            )}
  
            <div className="flex gap-3">
              <button
                onClick={() => setModalState(prev => ({ ...prev, showPayInFullConfirm: false }))}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmPayInFull(selectedNFT)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg
                        hover:bg-blue-700 transition-all disabled:opacity-50 font-medium"
              >
                {isProcessing ? 'Processing...' : 'Proceed to Shipping'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loyalty Tokens Modal */}
      {showLoyaltyModal && (
        <LoyaltyTokensModal
          isOpen={showLoyaltyModal}
          tokenName={loyaltyName}
          onClose={() => {
          setShowLoyaltyModal(false);
          window.location.reload();
      }}
      tokenAmount={loyaltyTokens}
      />
    )}

      {/* Shipping Modal */}
      {showShippingModal && selectedNFT && (
        <ShippingModal
          isOpen={showShippingModal}
          onClose={() => {
            setShowShippingModal(false);
            // Reset isShippingForPayInFull if user closes modal
            setIsShippingForPayInFull(false);
          }}
          onSubmit={(shippingDetails, isExpedited) => {
            handleShippingSubmit(shippingDetails, isExpedited);
          }}
        />
      )}
    </div>
  );
};

export default MyInventory;
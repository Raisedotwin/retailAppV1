import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ShippingModal from '../componants/ShippingDetailsModal';

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
  curveType?: any
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
  curveType
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
  
  // State for shipping modal
  const [showShippingModal, setShowShippingModal] = useState(false);
  // Add new state to track if shipping is for Pay in Full
  const [isShippingForPayInFull, setIsShippingForPayInFull] = useState(false);

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
                
                console.log('Sell Price:', ethers.formatEther(price), 'Base Redemption Value:', ethers.formatEther(baseRedemptionValueBigInt));
                
                // Compare sell price with base redemption value
                // Item is redeemable if sell price is greater than or equal to base redemption value
                isRedeemable = price >= baseRedemptionValueBigInt;
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

  const handleNFTClick = (nft: NFT) => {
    setSelectedNFT(nft);
    setShowModal(true);
  };

  const handleSell = async (nft: NFT) => {
    try {
      if (!activeContract) {
        throw new Error('Contract not initialized');
      }
      
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
    
    // Select NFT and open shipping modal instead of redeem confirmation
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
  
  // Updated shipping submit handler to handle both redemption and pay in full cases
  const handleShippingSubmit = async (shippingDetails: ShippingDetails, isExpedited: boolean) => {
    console.log("Shipping details:", shippingDetails);
    console.log("Expedited shipping:", isExpedited);
    
    // Close shipping modal
    setShowShippingModal(false);
    
    if (isShippingForPayInFull && selectedNFT) {
      // This is for pay in full
      try {
        setIsProcessing(true);
        setModalState(prev => ({ ...prev, transactionError: '' }));
        
        // Get the orders contract
        const ordersContractAddress = "0xCfAe2f219E22a774211B12c2F2185Ad0CB34A31e";
        const ordersContractABI = [
          "function createOrder(address _collection, uint256 _tokenId, tuple(string recipientName, string streetAddress, string city, string state, string zipCode, string country, string phoneNumber, string email) _shipping) external payable nonReentrant"
        ];
        
        const ordersContract = new ethers.Contract(ordersContractAddress, ordersContractABI, signer);
        
        // Convert payment amount to wei
        const paymentAmountWei = ethers.parseEther(modalState.paymentAmount);
        
        console.log('Paying in full for NFT:', selectedNFT.tokenId);
        console.log('Payment amount (ETH):', modalState.paymentAmount);
        console.log('Payment amount (Wei):', paymentAmountWei.toString());
        
        // Format shipping details for the contract
        const shippingDetailsForContract = [
          shippingDetails.recipientName,
          shippingDetails.streetAddress,
          shippingDetails.city,
          shippingDetails.state,
          shippingDetails.zipCode,
          shippingDetails.country,
          shippingDetails.phoneNumber,
          shippingDetails.email
        ];
        
        // Call the createOrder function on the orders contract
        const tx = await ordersContract.createOrder(
          nftContract, // collection address
          selectedNFT.tokenId, 
          shippingDetailsForContract,
          { value: paymentAmountWei }
        );
        
        console.log('Payment and order creation successful');
        
        // Reset states and close modals
        setModalState(prev => ({
          ...prev,
          paymentAmount: '',
          paymentAmountUsd: ''
        }));
        setShowModal(false);
        
        // Refresh the page or NFT list
        window.location.reload();
        
      } catch (error) {
        console.error('Error processing payment and creating order:', error);
        setModalState(prev => ({
          ...prev,
          showRedeemConfirm: true, // Show redeem confirmation with error
          transactionError: 'Failed to process payment and create order. Please try again.'
        }));
      } finally {
        setIsProcessing(false);
      }
    } else {
      // This is for normal redemption
      setModalState(prev => ({
        ...prev,
        showSellConfirm: false,
        showRedeemConfirm: true,
        showPayInFullConfirm: false,
        transactionError: ''
      }));
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
  
  const confirmRedeem = async (nft: NFT) => {
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
      if (approved !== activeContract.address) {
        console.log('Approving marketplace to transfer NFT...');
        const approveTx = await nftContractWithSigner.approve(activeContract.address, nft.tokenId);
        await approveTx.wait();
        console.log('Approval successful');
      }
  
      // Now redeem the NFT
      console.log('Redeeming NFT:', nft.tokenId);
      const tx = await activeContract.redeemNFT(nft.tokenId);
      console.log('NFT redeemed successfully');
  
      // Reset states and close modals
      setModalState(prev => ({
        ...prev,
        showRedeemConfirm: false
      }));
      setShowModal(false);
      
      // Refresh the page or NFT list
      window.location.reload();
  
    } catch (error) {
      console.error('Error redeeming NFT:', error);
      setModalState(prev => ({
        ...prev,
        transactionError: 'Failed to redeem NFT. Please try again.'
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
        My NFT Inventory
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
                         relative" // Added relative positioning for absolute label
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
                  
                  {/* Redeemable badge - only show if showRedeemableLabel is true */}
                  {showRedeemableLabel && (
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full shadow-md font-bold text-xs uppercase
                                 ${nft.isRedeemable 
                                    ? 'bg-green-500 text-white animate-pulse' 
                                    : 'bg-red-500 text-white'}`}
                                    >
                      {nft.isRedeemable ? 'Redeemable' : 'Not Redeemable'}
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
                        disabled={isProcessing || !nft.isRedeemable} // Disable if not redeemable
                        className={`px-3 py-1 rounded-lg font-medium transition-all text-xs
                                  disabled:opacity-50 disabled:cursor-not-allowed
                                  ${nft.isRedeemable
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : 'bg-gray-400 text-white'}`}
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
                          Pay Full
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
  
     {/* NFT Detail Modal */}
{showModal && selectedNFT && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 my-8 max-h-[85vh] overflow-y-auto">
      {/* Modal header with close button */}
      <div className="flex justify-between items-center p-3 border-b border-gray-200 sticky top-0 bg-white z-10">
        <h2 className="text-lg font-bold text-gray-800">{selectedNFT.name}</h2>
        <button 
          onClick={() => setShowModal(false)}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Image section - more compact */}
        <div className="md:w-1/2 p-4">
          <div className="bg-gray-50 rounded-lg overflow-hidden shadow-md">
            <img
              src={selectedNFT.image}
              alt={selectedNFT.name}
              className="w-full h-[300px] object-contain"
            />
          </div>
        </div>
        
        {/* Info section */}
        <div className="md:w-1/2 p-4 space-y-3">
          {selectedNFT.description && (
            <p className="text-gray-600 text-sm">{selectedNFT.description}</p>
          )}
          
          {/* Important Redemption Information - more compact */}
          <div className={`p-3 rounded-lg border text-sm ${selectedNFT.isRedeemable ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mt-0.5 flex-shrink-0 ${selectedNFT.isRedeemable ? 'text-amber-500' : 'text-red-500'}`}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <div>
                <h4 className={`font-medium text-sm ${selectedNFT.isRedeemable ? 'text-amber-800' : 'text-red-800'}`}>
                  {selectedNFT.isRedeemable ? 'Eligible for Redemption' : 'Not Eligible for Redemption Yet'}
                </h4>
                <p className={`text-xs ${selectedNFT.isRedeemable ? 'text-amber-700' : 'text-red-700'}`}>
                  {selectedNFT.isRedeemable 
                    ? 'This NFT can be redeemed for the physical item.'
                    : `This NFT is not yet eligible for redemption. The current price needs to reach ${selectedNFT.attributes?.baseRedemptionValue || '0.005'} ETH first.`
                  }
                </p>
              </div>
            </div>
          </div>
          
          {/* Details & Attributes in a more compact format */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800 text-sm">Details</h3>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs">Current Price:</span>
                    <span className="font-medium text-xs">
                      ${selectedNFT.priceUsd.toFixed(2)}
                      <span className="block text-gray-500 text-xs">{selectedNFT.priceEth.toFixed(5)} ETH</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs">Token ID:</span>
                    <span className="text-green-600 text-xs">{selectedNFT.tokenId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs">Status:</span>
                    <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                      selectedNFT.isRedeemable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedNFT.isRedeemable ? 'Redeemable' : 'Not Redeemable'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800 text-sm">Market Value</h3>
              <div className="bg-gray-50 p-3 rounded-lg text-sm h-[calc(100%-24px)]">
                <div className="flex items-center justify-between h-full">
                  <span className="text-gray-600 text-xs">Redemption Price:</span>
                  <div className="text-right">
                    <p className="text-gray-700 font-medium">
                      {selectedNFT.attributes?.baseRedemptionValue || 'N/A'} ETH
                    </p>
                    {ethUsdPrice > 0 && selectedNFT.attributes?.baseRedemptionValue && (
                      <span className="block text-xs text-gray-500">
                        (${(parseFloat(selectedNFT.attributes.baseRedemptionValue) * ethUsdPrice).toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Attributes grid - more compact */}
          <div>
            <h3 className="font-semibold text-gray-800 text-sm mb-2">Attributes</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-xs text-gray-500">Size</p>
                <p className="text-gray-700 font-medium text-sm">{selectedNFT.attributes?.size || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-xs text-gray-500">Category</p>
                <p className="text-gray-700 font-medium text-sm">{selectedNFT.attributes?.category || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-xs text-gray-500">Condition</p>
                <p className="text-gray-700 font-medium text-sm">{selectedNFT.attributes?.condition || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-xs text-gray-500">Shipping</p>
                <p className="text-gray-700 font-medium text-sm">{selectedNFT.attributes?.shipping || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          {/* Action buttons with conditional Pay in Full button */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <button 
              onClick={() => handleSell(selectedNFT)}
              disabled={isProcessing || modalState.isLoadingPrice || sellingRestricted || isExpired}
              className="px-4 py-1.5 bg-purple-600 text-white rounded-lg font-medium text-sm
                hover:bg-purple-700 transition-all
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {modalState.isLoadingPrice ? 'Calculating...' : 
                isProcessing ? 'Processing...' : 'Sell'}
            </button>
            <button 
              onClick={() => handleRedeem(selectedNFT)}
              disabled={isProcessing || !selectedNFT.isRedeemable}
              className={`px-4 py-1.5 rounded-lg font-medium text-sm transition-all
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${selectedNFT.isRedeemable 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-gray-400 text-white'}`}
            >
              {isProcessing ? 'Processing...' : 'Redeem'}
            </button>
            {/* Conditional Pay in Full button in modal - only show when curveType is 2 and not expired */}
            {curveType === 2 && !isExpired && !selectedNFT.isRedeemable && (
              <button 
                onClick={() => handlePayInFull(selectedNFT)}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-lg font-medium text-sm transition-all
                          bg-blue-600 text-white hover:bg-blue-700
                          disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Pay in Full'}
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
      
      {/* Redeem Confirmation Modal */}
      {modalState.showRedeemConfirm && selectedNFT && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Redemption</h3>
            
            <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-100">
              <p className="text-gray-600 mb-2">You are about to redeem this item:</p>
              <p className="text-xl font-bold text-gray-800 mb-1">
                {selectedNFT.name}
              </p>
              <p className="text-sm text-gray-500">
                Token ID: {selectedNFT.tokenId}
              </p>
              <div className="mt-4 bg-yellow-50 p-3 rounded border border-yellow-100">
                <p className="text-amber-700 text-sm font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  Once redeemed, this NFT will be burned. This action cannot be undone.
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
                onClick={() => setModalState(prev => ({ ...prev, showRedeemConfirm: false }))}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmRedeem(selectedNFT)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg
                        hover:bg-green-700 transition-all disabled:opacity-50 font-medium"
              >
                {isProcessing ? 'Processing...' : 'Confirm Redemption'}
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
import React, { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';

interface NFTModalState {
  showPurchaseConfirm: boolean;
  actualPrice: string;
  actualPriceUsd: string;  // Added USD price
  isLoadingPrice: boolean;
  purchaseError: string;
}

interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string;
  priceEth: number;     // Added ETH price as number
  priceUsd: number;     // Added USD price as number
  tokenId: string;
  creator: string;
  attributes?: {
    category: string;
    size: string;
    condition: string;  // Added condition instead of weightClass
    shipping: string;   // Added shipping attribute
    baseRedemptionValue?: string;
    baseValue?: string;  // Added baseValue attribute
  };
}

interface NFTMarketplaceProps {
  nftContract?: any;
  curveContract?: any;
  userAddress?: string;
  useContractData?: boolean;
  storeAddress?: any;
  provider?: any;
  activeContract?: any;
  isOpenForAll?: boolean;
  isWhitelistRequired?: boolean;
  launchContract?: any;
  openContract?: any;
  curveType?: number | null;
  signer?: any;
  pageLink?: string;
  expired?: boolean;  
  marketData?: any;
  isAffiliate?: boolean;
  affiliateAddress?: string | null;
  finallyExpired?: boolean;
  currentPeriod?: any;
  redeemValue?: any;

}

// Update the ListingFormData interface to include baseValueDisplay
interface ListingFormData {
  quantity: string;
  name: string;
  description: string;
  itemPhoto: string;
  condition: string;
  shipping: string;     // Added shipping
  category: string;
  size: string;
  inputEthAmount: string;
  baseValue: string;      // Raw BigInt string for contract
  baseValueDisplay: string; // Formatted ETH value for display
  minRedeemValue: string;
}


// Add these helper functions at the top of your component
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
    // Show in scientific notation for very small numbers
    return `0.000008 ETH`;
  } else if (numPrice < 1) {
    // Show 4 decimal places for small numbers
    return `${numPrice.toFixed(4)} ETH`;
  } else {
    // Show 2 decimal places for numbers >= 1
    return `${numPrice.toFixed(2)} ETH`;
  }
};

// Simple formatter that returns just the string value
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

const NFTMarketplace: React.FC<NFTMarketplaceProps> = ({
  nftContract,
  curveContract,
  userAddress,
  useContractData = false, // Default to using dummy data
  storeAddress,
  provider,
  activeContract,
  isOpenForAll = true,
  isWhitelistRequired = false,
  launchContract,
  openContract,
  curveType,
  signer,
  pageLink,
  expired,
  marketData,
  isAffiliate,
  affiliateAddress = null,
  finallyExpired,
  currentPeriod,
  redeemValue

}) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [showExpiredNotification, setShowExpiredNotification] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showListingModal, setShowListingModal] = useState(false);
  // Initialize the new field in the state
  const [listingForm, setListingForm] = useState<ListingFormData>({
    quantity: '',
    name: '',
    description: '',
    itemPhoto: '',
    condition: '',      // Changed from weightClass
    shipping: '',       // Added shipping
    category: '',
    size: '',
    inputEthAmount: '',
    baseValue: '',
    baseValueDisplay: '',
    minRedeemValue: ''
  });
  

    // Create a wallet instance from the private key
  const adminWallet = useMemo(() => {
      return new ethers.Wallet('cac636e07dd1ec983b66c5693b97ac5150d9a0cc5db8dd39ddb58b2e142cb192', provider);
  }, [provider]);

  const [isCalculatingBaseValue, setIsCalculatingBaseValue] = useState(false);
  // Add state for ETH price
  const [ethUsdPrice, setEthUsdPrice] = useState<number>(0);
  const [isLoadingEthPrice, setIsLoadingEthPrice] = useState(false);

  const [modalState, setModalState] = useState<NFTModalState>({
    showPurchaseConfirm: false,
    actualPrice: '',
    actualPriceUsd: '', // Added USD price
    isLoadingPrice: false,
    purchaseError: ''
  });
  
  const itemsPerPage = 4;

  // Add useEffect to fetch ETH price
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        setIsLoadingEthPrice(true);
        // Fetch ETH price from CoinGecko API
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        setEthUsdPrice(data.ethereum.usd);
        console.log(`Fetched ETH price: $${data.ethereum.usd}`);
      } catch (err) {
        console.error("Failed to fetch ETH price:", err);
        // Fallback price if the API fails
        setEthUsdPrice(3000); // Use a reasonable default or last known price
      } finally {
        setIsLoadingEthPrice(false);
      }
    };

    fetchEthPrice();
    // Refresh price every 5 minutes
    const intervalId = setInterval(fetchEthPrice, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Fetch NFTs for marketplace
useEffect(() => {
  const fetchNFTs = async () => {
    console.log('Fetching NFTs...');
    console.log('contract:', nftContract);
    console.log('signer:', pageLink);
    setIsLoading(true);
    
    // Helper function to decode base64 data URI
    const decodeTokenURI = (tokenURI: string) => {
      try {
        // Check if it's a data URI
        if (tokenURI.startsWith('data:application/json;base64,')) {
          // Remove the prefix and decode
          const base64Data = tokenURI.split(',')[1];
          const decodedData = Buffer.from(base64Data, 'base64').toString('utf-8');
          return JSON.parse(decodedData);
        } else {
          // If it's not base64 encoded, try parsing directly
          return JSON.parse(tokenURI);
        }
      } catch (error) {
        console.error('Error decoding token URI:', error);
        return null;
      }
    };

    try {
      if (!nftContract || !signer) {
        console.log('No NFT contract address or signer');
        setNfts([]);
        setIsLoading(false);
        return;
      }

      const nftContractABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
        "function tokenURI(uint256 tokenId) view returns (string)",
        "function ownerOf(uint256 tokenId) view returns (address)",
        "function totalSupply() view returns (uint256)",
        "function getOwner(uint256 _tokenId) external view returns (address)",
        "function getBaseValue(uint256 tokenId) external view returns (uint256)",
        "function getCirculatingSupply() external view returns (uint256)"
      ];

      const contract = new ethers.Contract(nftContract, nftContractABI, signer);
      
      // Get total supply of NFTs
      const totalSupply = await contract.getCirculatingSupply();
      console.log('Total Supply:', totalSupply.toString());

      const fetchedNFTs = [];

      // Loop through the entire NFT supply
      for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
        try {
          // Check if the NFT is owned by the marketplace contract (activeContract)
          const owner = await contract.ownerOf(tokenId);
          
          // Only include NFTs owned by the marketplace contract
          if (owner.toLowerCase() === activeContract.target.toLowerCase()) {
            console.log(`Token ID ${tokenId} is owned by the marketplace`);
            
            // Get token URI
            const tokenURI = await contract.tokenURI(tokenId);
            console.log('Token URI:', tokenURI);

            // Decode and parse the metadata
            const metadata = decodeTokenURI(tokenURI);
            if (!metadata) continue;

            console.log('Decoded metadata:', metadata);

            // Get creator address
            const creator = await contract.getOwner(tokenId);
            console.log('Creator:', creator);

            // Get base value
            const baseValue = await contract.getBaseValue(tokenId);
            console.log('Base value:', baseValue.toString());
            
            // Format the base value from wei to ETH
            const formattedBaseValue = ethers.formatEther(baseValue);

            // Get current buy price from the curve
            const [price, , , ] = await activeContract.getBuyPriceAfterFee(baseValue);
            console.log('Price:', ethers.formatEther(price));
            const formattedPrice = ethers.formatEther(price);
            
            // Convert to ETH price as number
            const priceInEth = parseFloat(formattedPrice);
            
            // Calculate USD price
            const priceInUsd = priceInEth * ethUsdPrice;

            // Parse attributes with type checking
            const attributes = metadata.attributes as Array<{trait_type: string, value: string | number}> || [];

            const category = attributes.find(attr => 
              attr.trait_type === "Category"
            )?.value?.toString() || "";
            
            const size = attributes.find(attr => 
              attr.trait_type === "Size"
            )?.value?.toString() || "";
            
            const condition = attributes.find(attr => 
              attr.trait_type === "Condition"
            )?.value?.toString() || "";
            
            const shipping = attributes.find(attr => 
              attr.trait_type === "Shipping"
            )?.value?.toString() || "";
            
            const baseRedemptionValue = attributes.find(attr => 
              attr.trait_type === "Required Base Value For Redemption"
            )?.value?.toString() || "";

            // Format the redemption value from wei to ETH
            const formattedRedemptionValue = baseRedemptionValue ? 
              ethers.formatEther(baseRedemptionValue) : "0";

            fetchedNFTs.push({
              id: tokenId.toString(),
              name: metadata.name || `NFT #${tokenId}`,
              description: metadata.description || "No description available",
              image: metadata.image || "/api/placeholder/400/400",
              price: formattedPrice,
              priceEth: priceInEth,
              priceUsd: priceInUsd,
              tokenId: tokenId.toString(),
              creator: creator,
              attributes: {
                category,
                size,
                condition,
                shipping,
                baseRedemptionValue: formattedRedemptionValue,
                baseValue: formattedBaseValue
              }
            });
          }
        } catch (tokenError) {
          console.error(`Error checking token ${tokenId}:`, tokenError);
          continue; // Skip this token if there's an error
        }
      }

      setNfts(fetchedNFTs);
      console.log('Fetched NFTs:', fetchedNFTs);
    } catch (error) {
      console.error('Error in fetchNFTs:', error);
      setNfts([]);
    } finally {
      setIsLoading(false);
    }
  };

  fetchNFTs();
}, [nftContract, signer, ethUsdPrice, activeContract]); // Added activeContract as dependency

  // Calculate base value from ETH amount using getNumberOfTokensForAmount
  const calculateBaseValue = async (ethAmount: string) => {
    try {
      setIsCalculatingBaseValue(true);
      
      if (!activeContract || !ethAmount || isNaN(parseFloat(ethAmount))) {
        setListingForm(prev => ({
          ...prev,
          baseValue: '',
          baseValueDisplay: ''
        }));
        return;
      }
      
      // Convert ETH to Wei
      const amountInWei = ethers.parseEther(ethAmount);
      
      // Call getNumberOfTokensForAmount
      const baseValueBigInt = await activeContract.getNumberOfTokensForAmount(amountInWei);
      
      // Store the raw BigInt value as string for submission
      const baseValueRaw = baseValueBigInt.toString();
      
      // Create a display version for UI only
      const baseValueFormatted = ethers.formatEther(baseValueBigInt);
      
      // Update the form with both values
      setListingForm(prev => ({
        ...prev,
        baseValue: baseValueRaw, // Use this for contract submission
        baseValueDisplay: baseValueFormatted // Use this only for display
      }));
      
      console.log(`Calculated base value: ${baseValueRaw} (raw) / ${baseValueFormatted} ETH (display)`);
    } catch (error) {
      console.error('Error calculating base value:', error);
      setListingForm(prev => ({
        ...prev,
        baseValue: '',
        baseValueDisplay: ''
      }));
    } finally {
      setIsCalculatingBaseValue(false);
    }
  };

  // Modified input change handler to calculate base value when ETH amount changes
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setListingForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If ethAmount is changing, calculate the base value
    if (name === 'inputEthAmount') {
      calculateBaseValue(value);
    }
  };

  const handleListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
  
    console.log('nftContract:', nftContract);
  
    try {
      if (!signer) throw new Error('Signer not initialized');
  
      // Create contract instance with signer
      const contractToUse = curveType === 1 ? launchContract : openContract;
      if (!contractToUse) throw new Error('Contract not initialized');
  
      // Connect the contract with signer
      const contractWithSigner = contractToUse.connect(signer);
  
      // Convert values to appropriate types
      const quantity = parseInt(listingForm.quantity);
      
      // Use the raw baseValue string directly - do NOT use ethers.parseUnits on it!
      const baseValue = listingForm.baseValue; // It's already a BigInt string
      
      // For minRedeemValue, we need to convert from ETH to Wei
      const baseRedeem = ethers.parseEther(listingForm.minRedeemValue);
  
      let tx;
      if (curveType === 1) {
        // Closed curve
        tx = await contractWithSigner.mintPhygital(
          quantity,
          listingForm.name,
          listingForm.description,
          listingForm.itemPhoto,
          listingForm.condition,  // Changed from weightClass
          listingForm.category,
          listingForm.size,
          pageLink,
          baseValue,
          baseRedeem
        );
      } else {
        // Open curve
        tx = await contractWithSigner.mintPhygital(
          quantity,
          listingForm.name,
          listingForm.description,
          listingForm.itemPhoto,
          listingForm.condition,  // Changed from weightClass
          listingForm.category,
          listingForm.size,
          pageLink,
          baseValue,
          baseRedeem
        );
      }
  
      //await tx.wait();
      setShowListingModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Error listing NFT:', error);
      alert('Failed to list NFT. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }; 

  const handleNFTClick = (nft: NFT) => {
    setSelectedNFT(nft);
    setShowModal(true);
    console.log("base redemption value:", listingForm.baseValue);
  };

  const handlePurchase = async (nft: NFT) => {
    try {
      if (!activeContract || !nft.attributes?.baseRedemptionValue) {
        throw new Error('Contract or NFT data not initialized');
      }
  
      // First, get the actual price
      setModalState(prev => ({ ...prev, isLoadingPrice: true, purchaseError: '' }));

      const baseValueformated = Number(nft.attributes.baseValue);

      const baseValue = ethers.parseEther(baseValueformated.toString());
      const [actualPrice, , , ] = await activeContract.getBuyPriceAfterFee(baseValue);
      console.log('Actual Price:', ethers.formatEther(actualPrice));
      console.log('Base Value:', actualPrice.toString());
      console.log("nft attrivute base value:", nft.attributes.baseValue);
      
      // Convert price to ETH and USD
      const actualPriceEth = ethers.formatEther(actualPrice);
      const actualPriceUsd = (parseFloat(actualPriceEth) * ethUsdPrice).toFixed(2);
      
      // Show confirmation modal with actual price
      setModalState(prev => ({
        ...prev,
        showPurchaseConfirm: true,
        actualPrice: actualPriceEth,
        actualPriceUsd: actualPriceUsd,
        isLoadingPrice: false
      }));
    } catch (error) {
      console.error('Error getting NFT price:', error);
      setModalState(prev => ({
        ...prev,
        isLoadingPrice: false,
        purchaseError: 'Error calculating price. Please try again.'
      }));
    }
  };
  
  const confirmPurchase = async (nft: NFT) => {
    try {
      setIsProcessing(true);
      setModalState(prev => ({ ...prev, purchaseError: '' }));
  
      if (!activeContract || !modalState.actualPrice) {
        throw new Error('Contract or price not initialized');
      }
  
      const launchABI = [
        "function buyNFT(uint256 tokenId) external payable",
      ];
  
      const createContractInstance = new ethers.Contract(activeContract.target, launchABI, signer);

      const price = ethers.parseEther(modalState.actualPrice);
      
      // Call the buyNFT function with the token ID and value
      const tx = await createContractInstance.buyNFT(nft.tokenId, {
        value: price
      });
  
      // Wait for transaction to complete
      //await tx.wait();
  
      // Handle affiliate registration if applicable
      if (isAffiliate && affiliateAddress) {
        try {
          console.log('Registering affiliate for purchase:', {
            collection: nftContract,
            tokenId: nft.tokenId,
            affiliate: affiliateAddress
          });

          const storePayouts = [
            "function registerAffiliate(address _collectionAddress, uint _tokenId, address _affiliate) external"
          ];
    
          const storeContract = new ethers.Contract(storeAddress, storePayouts, adminWallet);
  
          // Register the affiliate using the admin wallet
          const affiliateTx = await storeContract.registerAffiliate(
            nftContract,
            nft.tokenId,
            affiliateAddress
          );
          
          // Wait for affiliate registration transaction to complete
          //await affiliateTx.wait();
          
          console.log('Affiliate registration successful:', affiliateTx.hash);
        } catch (affiliateError) {
          console.error('Error registering affiliate:', affiliateError);
          // Note: We continue even if affiliate registration fails, as the purchase was successful
        }
      }
  
      // Reset states and close modals
      setModalState(prev => ({
        ...prev,
        showPurchaseConfirm: false,
        actualPrice: '',
        actualPriceUsd: ''
      }));
      setShowModal(false);
      
      // Optionally refresh the page or NFT list
      window.location.reload();
  
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      setModalState(prev => ({
        ...prev,
        purchaseError: 'Failed to purchase NFT. Please try again.'
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPages = Math.ceil(nfts.length / itemsPerPage);
  const currentNFTs = nfts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-2xl shadow-lg">
        <div className="animate-spin text-3xl mr-2">⏳</div>
        <span className="text-gray-600 font-medium">Loading marketplace items...</span>
      </div>
    );
  }


  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mt-8">
      {/* Header section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a2.12 2.12 0 0 0-.05 3.69l12.22 6.93a2 2 0 0 0 1.94 0L21 12.51a2.12 2.12 0 0 0-.09-3.67Z"></path>
              <path d="m3.09 8.84 12.35-6.61a1.93 1.93 0 0 1 1.81 0l3.65 1.9a2.12 2.12 0 0 1 .1 3.69L8.73 14.75a2 2 0 0 1-1.94 0L3 12.51a2.12 2.12 0 0 1 .09-3.67Z"></path>
              <line x1="12" y1="22" x2="12" y2="13"></line>
              <path d="M20 13.5v3.37a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13.5"></path>
            </svg>
            <h2 className="text-2xl font-bold text-white">
              Marketplace Items
            </h2>
            {/* Status labels */}
            <div className="flex gap-2 ml-4">
              {isOpenForAll && (
                <span className="px-3 py-1 bg-green-500/20 text-white text-sm font-medium rounded-full border border-green-500/30">
                  Open For All
                </span>
              )}
              {isWhitelistRequired && (
                <span className="px-3 py-1 bg-blue-400/20 text-white text-sm font-medium rounded-full border border-blue-400/30">
                  Whitelist Required
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
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
{/* Added Batch List button with Coming Soon tag */}
<button 
  className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg font-medium cursor-not-allowed relative"
>
  Batch List
  <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-yellow-400 text-xs text-gray-800 font-bold rounded-full shadow-sm">
    Coming Soon
  </span>
</button>
{/* List New Item button - conditionally shows different styling when expired */}
{expired ? (
  <button 
    onClick={() => setShowExpiredNotification(true)}
    className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg font-medium cursor-not-allowed shadow-md"
  >
    List New Item
  </button>
) : (
  <button 
    onClick={() => setShowListingModal(true)}
    className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-all transform hover:scale-105 shadow-md"
  >
    List New Item
  </button>
)}
</div>

        </div>
      </div>
  
      {/* NFT Grid */}
      <div className="p-6">
        {currentNFTs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Items Listed Yet</h3>
            <p className="text-gray-500">Be the first to list an item in this marketplace!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentNFTs.map((nft) => (
              <div
                key={nft.id}
                onClick={() => handleNFTClick(nft)}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-blue-300
                         shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-5px] cursor-pointer"
              >
                <div className="aspect-square overflow-hidden relative">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-full object-cover transform transition-transform hover:scale-110"
                  />
                  {/* Price badge */}
                  {nft.priceUsd > 0 && (
                    <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-md">
                      <span className="text-blue-600 font-bold">${nft.priceUsd.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{nft.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-gray-500 text-sm">
                      {nft.attributes?.category || ''} {nft.attributes?.size && `• ${nft.attributes.size}`}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase(nft);
                      }}
                      disabled={isProcessing || modalState.isLoadingPrice}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium
                               hover:bg-blue-600 transition-all text-sm
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {modalState.isLoadingPrice ? 'Checking...' : 
                       isProcessing ? 'Processing...' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  
      {/* Pagination Controls */}
      {currentNFTs.length > 0 && (
        <div className="flex items-center justify-center gap-4 p-6 border-t border-gray-200">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-colors"
          >
            <span className="text-gray-600">←</span>
          </button>
          
          <span className="text-gray-600 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          
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
  
{/* NFT Detail Modal */}
{showModal && selectedNFT && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      {/* Modal header with close button */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">{selectedNFT.name}</h2>
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
      
      {/* Modal content */}
      <div className="flex flex-col md:flex-row">
        {/* Image section - Fixed to show full image */}
        <div className="md:w-1/2 p-4">
          <div className="rounded-lg overflow-hidden shadow-md flex items-center justify-center">
            <img
              src={selectedNFT.image}
              alt={selectedNFT.name}
              className="w-full object-contain h-auto max-h-[350px]"
            />
          </div>
        </div>
        
        {/* Info section */}
        <div className="md:w-1/2 p-4 space-y-4">
          <p className="text-gray-600">{selectedNFT.description}</p>
          
          {/* Redemption Info Card - Modified based on curveType */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-blue-800 font-semibold flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              Redemption Conditions
            </h3>
            
            <div className="space-y-3">
              {/* During Trading Period - Modified based on curveType */}
              <div className={`bg-white p-3 rounded-lg border ${curveType === 1 ? 'border-amber-100' : 'border-blue-100'}`}>
                <h4 className="text-sm font-medium text-blue-800 mb-1">During Trading Period</h4>
                {curveType === 1 ? (
                  <p className="text-sm text-amber-700">
                    <span className="font-bold">Trading Only:</span> During the trading period, this NFT can only be traded. Redemption for physical items is not available until after the trading period expires.
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
                <p className="text-sm text-blue-700">
                  After curve expiry, the NFT can be redeemed when the total liquidity pool value is at least <span className="font-bold">{redeemValue ? 
                    `${(Number(redeemValue) + Number(selectedNFT.attributes?.baseRedemptionValue || '0.005')).toFixed(5)} ETH` : 
                    `${(Number(selectedNFT.attributes?.baseRedemptionValue || '0.005') + 0.01).toFixed(5)} ETH`}</span>
                  <span className="text-xs text-gray-500 block mt-1">
                    (Pool Requirement: {redeemValue || '0.01'} ETH + Market Value: {selectedNFT.attributes?.baseRedemptionValue || '0.005'} ETH)
                  </span>
                </p>
              </div>
              
              {/* Current Status */}
              <div className={`${currentPeriod === 'trading' ? 'bg-green-50 border-green-100' : 
                               currentPeriod === 'redemption' ? 'bg-amber-50 border-amber-100' : 
                               'bg-gray-50 border-gray-100'} 
                              p-3 rounded-lg border`}>
                <h4 className="text-sm font-medium mb-1 
                      text-gray-800">Current Status</h4>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${
                    currentPeriod === 'trading' ? 'bg-green-500' : 
                    currentPeriod === 'redemption' ? 'bg-amber-500' : 
                    'bg-gray-500'
                  }`}></span>
                  <p className="text-sm">
                    {currentPeriod === 'trading' ? 'Trading Period Active' : 
                     currentPeriod === 'redemption' ? 'Redemption Period Active' : 
                     'Expired'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Details card */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Price:</span>
                <span className="font-medium">
                  {selectedNFT.priceUsd > 0 ? (
                    <span className="text-blue-600">${selectedNFT.priceUsd.toFixed(2)} <span className="text-gray-500 text-sm">({selectedNFT.priceEth.toFixed(5)} ETH)</span></span>
                  ) : (
                    <span className="text-blue-600">{formatEthPrice(selectedNFT.price)}</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Creator:</span>
                <span className="font-mono text-blue-600 text-sm">
                  {`${selectedNFT.creator.slice(0, 6)}...${selectedNFT.creator.slice(-4)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Token ID:</span>
                <span className="text-green-600">{selectedNFT.tokenId}</span>
              </div>
            </div>
          </div>
          
         {/* Attributes grid */}
<div className="bg-gray-50 p-3 rounded-lg">
  <h3 className="font-semibold text-gray-800 mb-2">Attributes</h3>
  <div className="grid grid-cols-2 gap-2">
    <div className="bg-white p-2 rounded-lg border border-gray-100">
      <p className="text-xs text-gray-500">Size</p>
      <p className="font-medium">{selectedNFT.attributes?.size || 'Large'}</p>
    </div>
    <div className="bg-white p-2 rounded-lg border border-gray-100">
      <p className="text-xs text-gray-500">Category</p>
      <p className="font-medium">{selectedNFT.attributes?.category || 'Footwear'}</p>
    </div>
    <div className="bg-white p-2 rounded-lg border border-gray-100">
      <p className="text-xs text-gray-500">Condition</p>
      <p className="font-medium">{selectedNFT.attributes?.condition || 'New'}</p>
    </div>
    <div className="bg-white p-2 rounded-lg border border-gray-100">
      <p className="text-xs text-gray-500">Shipping</p>
      <p className="font-medium">{selectedNFT.attributes?.shipping || 'Worldwide'}</p>
    </div>
    <div className="bg-white p-2 rounded-lg border border-gray-100">
      <p className="text-xs text-gray-500">Market Value</p>
      <p className="font-medium">
        {selectedNFT.attributes?.baseRedemptionValue || '0.005'} ETH
        {ethUsdPrice > 0 && selectedNFT.attributes?.baseRedemptionValue && (
          <span className="block text-xs text-gray-500">
            (${(parseFloat(selectedNFT.attributes.baseRedemptionValue) * ethUsdPrice).toFixed(2)})
          </span>
        )}
      </p>
    </div>
    <div className="bg-white p-2 rounded-lg border border-blue-100">
      <p className="text-xs text-blue-500">Pool at Expiry</p>
      <p className="font-medium text-blue-700">
        {redeemValue ? 
          `${(Number(redeemValue) + Number(selectedNFT.attributes?.baseRedemptionValue || '0.005')).toFixed(5)}` : 
          `${(Number(selectedNFT.attributes?.baseRedemptionValue || '0.005') + 0.01).toFixed(5)}`} ETH
        {ethUsdPrice > 0 && (
          <span className="block text-xs text-blue-500">
            (${((Number(redeemValue || 0.01) + Number(selectedNFT.attributes?.baseRedemptionValue || 0.005)) * ethUsdPrice).toFixed(2)})
          </span>
        )}
      </p>
    </div>
  </div>
</div>
        </div>
      </div>
      
      {/* Footer with actions */}
      <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Close
        </button>
        <button 
          onClick={() => handlePurchase(selectedNFT)}
          disabled={isProcessing || modalState.isLoadingPrice}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {modalState.isLoadingPrice ? 'Calculating Price...' : 
           isProcessing ? 'Processing...' : 'Purchase Now'}
        </button>
      </div>
    </div>
  </div>
)}

{/* Purchase Confirmation Modal */}
{modalState.showPurchaseConfirm && selectedNFT && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Purchase</h3>
      
      {/* Expired Curve Notice */}
      {expired && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
          <div className="flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 mt-0.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div>
              <h4 className="text-red-800 font-medium">Expired Curve</h4>
              <p className="text-red-700 text-sm">
                This curve has expired. You cannot purchase NFTs on this marketplace at this time.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
        <p className="text-gray-600 mb-2">Actual price to pay:</p>
        <p className="text-2xl font-bold text-blue-600 mb-1">
          ${modalState.actualPriceUsd}
        </p>
        <p className="text-sm text-gray-500">
          {modalState.actualPrice} ETH
        </p>
      </div>

      {modalState.purchaseError && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4">
          {modalState.purchaseError}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setModalState(prev => ({ ...prev, showPurchaseConfirm: false }))}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          onClick={() => confirmPurchase(selectedNFT)}
          disabled={isProcessing || expired}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg
                  hover:bg-blue-700 transition-all disabled:opacity-50 font-medium"
        >
          {isProcessing ? 'Processing...' : expired ? 'Curve Expired' : 'Confirm Purchase'}
        </button>
      </div>
    </div>
  </div>
)}
      
{/* Expired Curve Notification Modal */}
{showExpiredNotification && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-5 rounded-lg shadow-xl max-w-md w-full">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-red-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Cannot List on Expired Curve</h3>
          <p className="text-gray-600 mt-1">
            This marketplace is attached to an expired curve and no longer accepts new listings. 
            Please contact the administrator for more information.
          </p>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => setShowExpiredNotification(false)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
  
{/* Listing Modal - Modified to reduce height */}
{showListingModal && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-11/12 max-h-[90vh] overflow-y-auto border border-gray-200">
      <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center z-10">
        <h2 className="text-xl font-bold text-gray-800">List New Item</h2>
        <button 
          onClick={() => setShowListingModal(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <form onSubmit={handleListingSubmit} className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* First column */}
          <div>
            <div className="mb-3">
              <label className="block text-gray-700 text-sm font-medium mb-1">Quantity (10 per listing)</label>
              <input
                type="number"
                name="quantity"
                value={listingForm.quantity}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
              {parseInt(listingForm.quantity, 10) > 10 && (
                <p className="text-red-500 text-xs mt-1">Maximum quantity is 10</p>
              )}
            </div>
            
            <div className="mb-3">
              <label className="block text-gray-700 text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={listingForm.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div className="mb-3">
              <label className="block text-gray-700 text-sm font-medium mb-1">Condition</label>
              <input
                type="text"
                name="condition"
                value={listingForm.condition}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Second column */}
          <div>
            <div className="mb-3">
              <label className="block text-gray-700 text-sm font-medium mb-1">Item Photo URL</label>
              <input
                type="text"
                name="itemPhoto"
                value={listingForm.itemPhoto}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div className="mb-3">
              <label className="block text-gray-700 text-sm font-medium mb-1">Category</label>
              <input type="text"
                name="category"
                value={listingForm.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div className="mb-3">
              <label className="block text-gray-700 text-sm font-medium mb-1">Size</label>
              <input
                type="text"
                name="size"
                value={listingForm.size}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Third column */}
          <div>
            <div className="mb-3">
              <label className="block text-gray-700 text-sm font-medium mb-1">Shipping</label>
              <button
                type="button"
                onClick={() => {
                  // This will be connected to the shipping modal in the future
                  // For now, set a default value
                  setListingForm(prev => ({
                    ...prev,
                    shipping: "Default Worldwide Shipping"
                  }));
                }}
                className="w-full px-3 py-2 bg-blue-50 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                  <line x1="2" x2="22" y1="10" y2="10"></line>
                </svg>
                Set Shipping Details
              </button>
              {listingForm.shipping && (
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                  {listingForm.shipping}
                </p>
              )}
            </div>

            <div className="mb-3">
              <label className="flex justify-between items-center text-gray-700 text-sm font-medium mb-1">
                <span>Listing Price (ETH)</span>
                {ethUsdPrice > 0 && parseFloat(listingForm.inputEthAmount) > 0 && (
                  <span className="text-green-600 text-xs font-medium">
                    ≈ ${(parseFloat(listingForm.inputEthAmount) * ethUsdPrice).toFixed(2)} USD
                  </span>
                )}
              </label>
              <input
                type="text"
                name="inputEthAmount"
                value={listingForm.inputEthAmount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g. 0.1"
                required
              />
              <p className="text-xs text-gray-500 mt-0.5">The initial purchase price of the item</p>
            </div>

            <div className="mb-3">
              <label className="block text-gray-700 text-sm font-medium mb-1">Base Value / Token Weight</label>
              <div className="flex items-center">
                <input
                  type="text"
                  name="baseValueDisplay"
                  value={listingForm.baseValueDisplay}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                  placeholder={isCalculatingBaseValue ? "Calculating..." : "Enter ETH amount first"}
                />
                {isCalculatingBaseValue && (
                  <div className="animate-spin text-lg ml-2 text-blue-500">⏳</div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Automatically calculated</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
          {/* Market Value Field */}
          <div>
            <label className="flex justify-between items-center text-gray-700 text-sm font-medium mb-1">
              <span>Market Value (ETH)</span>
              {ethUsdPrice > 0 && parseFloat(listingForm.minRedeemValue) > 0 && (
                <span className="text-green-600 text-xs font-medium">
                  ≈ ${(parseFloat(listingForm.minRedeemValue) * ethUsdPrice).toFixed(2)} USD
                </span>
              )}
            </label>
            <input
              type="text"
              name="minRedeemValue"
              value={listingForm.minRedeemValue}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-0.5">The value required for redemption</p>
          </div>

          {/* Description field */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={listingForm.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              rows={2}
              required
            />
          </div>
        </div>

        {/* Info section explaining the ETH to Base Value conversion - Condensed */}
        <div className="bg-blue-50 p-3 rounded-lg mt-4 border border-blue-100">
          <div className="flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mt-0.5 flex-shrink-0">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div>
              <h4 className="text-blue-700 text-sm font-medium">How listing price & market value work</h4>
              <p className="text-gray-700 text-xs">
                The listing price is the initial sale price. The market value is the price required for redemption. The base value determines the item's weight on the curve - higher values make your item more valuable in the marketplace.
              </p>
              {ethUsdPrice > 0 && (
                <div className="mt-1 flex items-center text-xs text-gray-600">
                  <span>Current ETH price: ${ethUsdPrice.toLocaleString()} USD</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 sticky bottom-0 bg-white border-t border-gray-200 pt-3 pb-2">
          <button
            type="button"
            onClick={() => setShowListingModal(false)}
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isProcessing || isCalculatingBaseValue || !listingForm.baseValue}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg
                     hover:bg-blue-700 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isProcessing ? 'Processing...' : isCalculatingBaseValue ? 'Calculating...' : 'List Item'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

export default NFTMarketplace;
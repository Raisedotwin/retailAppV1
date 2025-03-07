import React, { useState, useEffect } from 'react';
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
    weightClass: string;
    category: string;
    size: string;
    baseRedemptionValue?: string;
  };
}

interface NFTMarketplaceProps {
  nftContract?: any;
  curveContract?: any;
  userAddress?: string;
  useContractData?: boolean;
  activeContract?: any;
  isOpenForAll?: boolean;
  isWhitelistRequired?: boolean;
  launchContract?: any;
  openContract?: any;
  curveType?: number | null;
  signer?: any;
  pageLink?: string;
  marketData?: any;
  isAffiliate?: boolean;
  affiliateAddress?: string | null;
}

interface ListingFormData {
  quantity: string;
  name: string;
  description: string;
  itemPhoto: string;
  weightClass: string;
  category: string;
  size: string;
  inputEthAmount: string; // New field for ETH input
  baseValue: string;      // This will be calculated
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
  activeContract,
  isOpenForAll = true,
  isWhitelistRequired = false,
  launchContract,
  openContract,
  curveType,
  signer,
  pageLink,
  marketData,
  isAffiliate = false,
  affiliateAddress = null
}) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showListingModal, setShowListingModal] = useState(false);
  const [listingForm, setListingForm] = useState<ListingFormData>({
    quantity: '',
    name: '',
    description: '',
    itemPhoto: '',
    weightClass: '',
    category: '',
    size: '',
    inputEthAmount: '',  // New field for ETH input
    baseValue: '',
    minRedeemValue: ''
  });
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
          "function getBaseValue(uint256 tokenId) external view returns (uint256)"
        ];
  
        const contract = new ethers.Contract(nftContract, nftContractABI, signer);
        
        //this needs to be the total amouunt of nfts rather then the balance of the user
        const balance = await contract.balanceOf(activeContract);
        console.log('NFT Balance:', balance.toString());

        //const totalSupply = await activeContract.totalSupply();
        //console.log('Total Supply:', totalSupply.toString());

        //then in the curve contract we need ceck which ids they own currently 
  
        const fetchedNFTs = [];
  
        //for the entire supply of nfts
        for (let i = 0; i < balance; i++) {
          try {

            //get all the tokens owned by the launch 
            //marketData.
            //either getTokensHeldByLaunch(address launchAddress) or isTokenHeldByLaunch(address launchAddress, uint256 tokenId) 
            //then we will dynamically get the token ids, maybe there is a way we can do it by page so dont loop through everything

            // Get token URI
            const tokenURI = await contract.tokenURI(0);
            console.log('Raw Token URI:', tokenURI);
  
            // Decode and parse the metadata
            const metadata = decodeTokenURI(tokenURI);
            if (!metadata) continue;
  
            console.log('Decoded metadata:', metadata);
  
            // Get owner address
            const owner = await contract.getOwner(0);
            console.log('Owner:', owner);

            const baseValue = await contract.getBaseValue(0);
            console.log('basevalue:', baseValue);
            console.log("activeContract", activeContract);

            const [price, , , ] = await activeContract.getBuyPriceAfterFee(baseValue);
            console.log('Price:', ethers.formatEther(price));
            const formattedPrice = ethers.formatEther(price);
            
            // Convert to ETH price as number
            const priceInEth = parseFloat(formattedPrice);
            
            // Calculate USD price
            const priceInUsd = priceInEth * ethUsdPrice;
  
            // Parse attributes with type checking
            const attributes = metadata.attributes as Array<{trait_type: string, value: string | number}> || [];

            const weightClass = attributes.find(attr => 
              attr.trait_type === "Weight Class"
            )?.value?.toString() || "";

            const category = attributes.find(attr => 
              attr.trait_type === "Category"
            )?.value?.toString() || "";

            const size = attributes.find(attr => 
              attr.trait_type === "Size"
            )?.value?.toString() || "";

            const baseRedemptionValue = attributes.find(attr => 
              attr.trait_type === "Required Base Value For Redemption"
            )?.value?.toString() || "";

            // Format the redemption value from wei to ETH
            const formattedRedemptionValue = baseRedemptionValue ? 
            ethers.formatEther(baseRedemptionValue) : "0";

            fetchedNFTs.push({
              id: i.toString(),
              name: metadata.name || `NFT #1`,
              description: metadata.description || "No description available",
              image: metadata.image || "/api/placeholder/400/400",
              price: formattedPrice,
              priceEth: priceInEth,
              priceUsd: priceInUsd,
              tokenId: "0",
              creator: owner,
              attributes: {
              weightClass,
              category,
              size,
              baseRedemptionValue: formattedRedemptionValue
            }
          });
          } catch (tokenError) {
            console.error('Error fetching token:', tokenError);
            continue;
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
  }, [nftContract, signer, ethUsdPrice]); // Added ethUsdPrice as dependency to refresh NFTs when price changes

  // Calculate base value from ETH amount using getNumberOfTokensForAmount
  const calculateBaseValue = async (ethAmount: string) => {
    try {
      setIsCalculatingBaseValue(true);
      
      if (!activeContract || !ethAmount || isNaN(parseFloat(ethAmount))) {
        setListingForm(prev => ({
          ...prev,
          baseValue: ''
        }));
        return;
      }
      
      // Convert ETH to Wei
      const amountInWei = ethers.parseEther(ethAmount);
      
      // Call getNumberOfTokensForAmount
      const baseValueBigInt = await activeContract.getNumberOfTokensForAmount(amountInWei);
      
      // Format the result
      const baseValueFormatted = ethers.formatEther(baseValueBigInt.toString());
      
      // Update the form
      setListingForm(prev => ({
        ...prev,
        baseValue: baseValueFormatted
      }));
      
      console.log(`Calculated base value: ${baseValueFormatted} for ${ethAmount} ETH`);
    } catch (error) {
      console.error('Error calculating base value:', error);
      setListingForm(prev => ({
        ...prev,
        baseValue: ''
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
      
      // Use the calculated baseValue (already in correct format)
      const baseValue = ethers.parseUnits(listingForm.baseValue, 0); // It's already in wei
      const baseRedeem = ethers.parseEther(listingForm.minRedeemValue);
  
      let tx;
      if (curveType === 1) {
        // Closed curve
        tx = await contractWithSigner.mintPhygital(
          quantity,
          listingForm.name,
          listingForm.description,
          listingForm.itemPhoto,
          listingForm.weightClass,
          listingForm.category,
          listingForm.size,
          pageLink,
          baseValue
        );
      } else {
        // Open curve
        tx = await contractWithSigner.mintPhygital(
          quantity,
          listingForm.name,
          listingForm.description,
          listingForm.itemPhoto,
          listingForm.weightClass,
          listingForm.category,
          listingForm.size,
          pageLink,
          baseValue,
          baseRedeem
        );
      }
  
      await tx.wait();
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
  };

  const handlePurchase = async (nft: NFT) => {
    try {
      if (!activeContract || !nft.attributes?.baseRedemptionValue) {
        throw new Error('Contract or NFT data not initialized');
      }
  
      // First, get the actual price
      setModalState(prev => ({ ...prev, isLoadingPrice: true, purchaseError: '' }));
      
      const baseValue = ethers.parseEther(nft.attributes.baseRedemptionValue);
      const [actualPrice, , , ] = await activeContract.getBuyPriceAfterFee(baseValue);
      
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
  
      const price = ethers.parseEther(modalState.actualPrice);
      
      // Call the buyNFT function with the token ID and value
      const tx = await activeContract.buyNFT(nft.tokenId, {
        value: price
      });
  
      // Wait for transaction to complete
      await tx.wait();
  
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
            <button 
              onClick={() => setShowListingModal(true)}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium
                      hover:bg-blue-50 transition-all transform hover:scale-105 shadow-md"
            >
              List New Item
            </button>
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="flex gap-6">
              <div className="w-1/2">
                <img
                  src={selectedNFT.image}
                  alt={selectedNFT.name}
                  className="w-full rounded-lg object-cover h-[400px]"
                />
              </div>
              <div className="w-1/2 space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedNFT.name}</h2>
                <p className="text-gray-600 mb-4">{selectedNFT.description}</p>
                
                {/* NFT Details */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Details</h3>
                  <p className="text-gray-700">
                    Current Price: 
                    {selectedNFT.priceUsd > 0 ? (
                      <span className="flex items-baseline gap-2">
                        <span className="text-blue-600 font-bold">${selectedNFT.priceUsd.toFixed(2)}</span>
                        <span className="text-gray-500 text-sm">({selectedNFT.priceEth.toFixed(5)} ETH)</span>
                      </span>
                    ) : (
                      <span className="text-blue-600">{formatEthPrice(selectedNFT.price)}</span>
                    )}
                  </p>
                  <p className="text-gray-700">
                    Creator: <span className="text-blue-600 font-mono">
                      {`${selectedNFT.creator.slice(0, 6)}...${selectedNFT.creator.slice(-4)}`}
                    </span>
                  </p>
                  <p className="text-gray-700">
                    Token ID: <span className="text-green-600">{selectedNFT.tokenId}</span>
                  </p>
                </div>
  
                {/* NFT Attributes */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Attributes</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500">Size</p>
                      <p className="text-gray-700 font-medium">{selectedNFT.attributes?.size || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="text-gray-700 font-medium">{selectedNFT.attributes?.category || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500">Weight Class</p>
                      <p className="text-gray-700 font-medium">{selectedNFT.attributes?.weightClass || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500">Min Value for Redemption</p>
                      <p className="text-gray-700 font-medium">
                        {selectedNFT.attributes?.baseRedemptionValue || 'N/A'} ETH
                        {ethUsdPrice > 0 && selectedNFT.attributes?.baseRedemptionValue && (
                          <span className="block text-xs text-gray-500">
                            (${(parseFloat(selectedNFT.attributes.baseRedemptionValue) * ethUsdPrice).toFixed(2)})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
  
                <div className="flex justify-between gap-4 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium
                             hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => handlePurchase(selectedNFT)}
                    disabled={isProcessing || modalState.isLoadingPrice}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium
                             hover:bg-blue-700 transition-all transform hover:scale-105
                             disabled:opacity-50 disabled:transform-none"
                  >
                    {modalState.isLoadingPrice ? 'Calculating Price...' : 
                     isProcessing ? 'Processing...' : 'Purchase Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
  
      {/* Purchase Confirmation Modal */}
      {modalState.showPurchaseConfirm && selectedNFT && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Purchase</h3>
            
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
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg
                        hover:bg-blue-700 transition-all disabled:opacity-50 font-medium"
              >
                {isProcessing ? 'Processing...' : 'Confirm Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}
  
      {/* Listing Modal */}
      {showListingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-2xl w-full border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">List New Item</h2>
            
            <form onSubmit={handleListingSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={listingForm.quantity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={listingForm.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={listingForm.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Item Photo URL</label>
                  <input
                    type="text"
                    name="itemPhoto"
                    value={listingForm.itemPhoto}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Weight Class</label>
                  <input
                    type="text"
                    name="weightClass"
                    value={listingForm.weightClass}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Category</label>
                  <input type="text"
                    name="category"
                    value={listingForm.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Size</label>
                  <input
                    type="text"
                    name="size"
                    value={listingForm.size}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="flex justify-between items-center text-gray-700 mb-2">
                    <span>Base Price (ETH)</span>
                    {ethUsdPrice > 0 && parseFloat(listingForm.inputEthAmount) > 0 && (
                      <span className="text-green-600 text-sm font-medium">
                        ≈ ${(parseFloat(listingForm.inputEthAmount) * ethUsdPrice).toFixed(2)} USD
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="inputEthAmount"
                    value={listingForm.inputEthAmount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="e.g. 0.1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter amount in ETH, base value will be calculated automatically
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Calculated Base Token Value</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      name="baseValue"
                      value={listingForm.baseValue}
                      readOnly
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                      placeholder={isCalculatingBaseValue ? "Calculating..." : "Enter ETH amount first"}
                    />
                    {isCalculatingBaseValue && (
                      <div className="animate-spin text-xl ml-2 text-blue-500">⏳</div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This value is automatically calculated from your ETH input
                  </p>
                </div>

                <div>
                  <label className="flex justify-between items-center text-gray-700 mb-2">
                    <span>Redeem Price (ETH)</span>
                    {ethUsdPrice > 0 && parseFloat(listingForm.minRedeemValue) > 0 && (
                      <span className="text-green-600 text-sm font-medium">
                        ≈ ${(parseFloat(listingForm.minRedeemValue) * ethUsdPrice).toFixed(2)} USD
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="minRedeemValue"
                    value={listingForm.minRedeemValue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Info section explaining the ETH to Base Value conversion */}
              <div className="bg-blue-50 p-4 rounded-lg my-4 border border-blue-100">
                <h4 className="text-blue-700 font-medium mb-2">How ETH Amount and Base Value Work</h4>
                <p className="text-gray-700 text-sm">
                  The ETH amount you enter is converted to a Base Value. This Base Value represents the token amount that corresponds to your ETH input based on the bonding curve.
                </p>
                {ethUsdPrice > 0 && (
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1 text-blue-500">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <span>Current ETH price: ${ethUsdPrice.toLocaleString()} USD</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowListingModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || isCalculatingBaseValue || !listingForm.baseValue}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg
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
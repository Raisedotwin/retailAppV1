import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface NFTModalState {
  showPurchaseConfirm: boolean;
  actualPrice: string;
  isLoadingPrice: boolean;
  purchaseError: string;
}

interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string;
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

// Add this helper function at the top of your component
const formatPrice = (price: string): string => {
  const numPrice = parseFloat(price);
  if (numPrice < 0.00001) {
    // Show in scientific notation for very small numbers
    //return `${numPrice.toExponential(2)} ETH`;
    return `0.000008 ETH`;
  } else if (numPrice < 1) {
    // Show 4 decimal places for small numbers
    return `${numPrice.toFixed(4)} ETH`;
  } else {
    // Show 2 decimal places for numbers >= 1
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
  marketData
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

  const [modalState, setModalState] = useState<NFTModalState>({
    showPurchaseConfirm: false,
    actualPrice: '',
    isLoadingPrice: false,
    purchaseError: ''
  });
  
  const itemsPerPage = 4;

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
  }, [nftContract, signer]);

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
      
      // Show confirmation modal with actual price
      setModalState(prev => ({
        ...prev,
        showPurchaseConfirm: true,
        actualPrice: ethers.formatEther(actualPrice),
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
        actualPrice: ''
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
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin text-3xl mr-2">🔄</div>
        <span className="text-gray-300">Loading NFTs...</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl shadow-xl mt-8">
      {/* Header section with new labels */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-purple-400 text-3xl">🎨</span>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              NFT Marketplace
            </h2>
            {/* Status labels */}
            <div className="flex gap-2 ml-4">
              {isOpenForAll && (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm font-medium rounded-full border border-yellow-500/30">
                  Open For All
                </span>
              )}
              {isWhitelistRequired && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full border border-blue-500/30">
                  Whitelist Required
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={() => setShowListingModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg
                     hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
          >
            List NFT
          </button>
        </div>
      </div>
  
      {/* NFT Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentNFTs.map((nft) => (
          <div
            key={nft.id}
            onClick={() => handleNFTClick(nft)}
            className="bg-gray-800/50 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-700 
                     transform transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={nft.image}
                alt={nft.name}
                className="w-full h-full object-cover transform transition-transform hover:scale-110"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-2">{nft.name}</h3>
              <div className="flex justify-between items-center">
                <span className="bg-purple-400/10 text-purple-400 px-3 py-1 rounded-full text-sm">
                  {formatPrice(nft.price)}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePurchase(nft);
                  }}
                  disabled={isProcessing || modalState.isLoadingPrice}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg
                           hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105
                           disabled:opacity-50 disabled:transform-none"
                >
                  {modalState.isLoadingPrice ? 'Calculating...' : 
                   isProcessing ? 'Processing...' : 'Buy'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
  
      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 
                   disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-gray-300">←</span>
        </button>
        
        <span className="text-gray-300">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 
                   disabled:cursor-not-allowed transition-colors"
        >
          <span className="text-gray-300">→</span>
        </button>
      </div>
  
      {/* NFT Detail Modal */}
      {showModal && selectedNFT && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-700">
            <div className="flex gap-6">
              <div className="w-1/2">
                <img
                  src={selectedNFT.image}
                  alt={selectedNFT.name}
                  className="w-full rounded-lg object-cover h-[400px]"
                />
              </div>
              <div className="w-1/2 space-y-4">
                <h2 className="text-2xl font-bold text-white mb-4">{selectedNFT.name}</h2>
                <p className="text-gray-300 mb-4">{selectedNFT.description}</p>
                
                {/* NFT Details */}
                <div className="bg-gray-700/50 p-4 rounded-lg space-y-3">
                  <h3 className="text-lg font-semibold text-white mb-2">Details</h3>
                  <p className="text-gray-300">
                    Current Price: <span className="text-purple-400">{formatPrice(selectedNFT.price)}</span>
                  </p>
                  <p className="text-gray-300">
                    Creator: <span className="text-blue-400 font-mono">
                      {`${selectedNFT.creator.slice(0, 6)}...${selectedNFT.creator.slice(-4)}`}
                    </span>
                  </p>
                  <p className="text-gray-300">
                    Token ID: <span className="text-green-400">{selectedNFT.tokenId}</span>
                  </p>
                </div>
  
                {/* NFT Attributes */}
                <div className="bg-gray-700/50 p-4 rounded-lg space-y-3">
                  <h3 className="text-lg font-semibold text-white mb-2">Attributes</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-600/50 p-3 rounded-lg">
                      <p className="text-sm text-gray-400">Size</p>
                      <p className="text-white font-medium">{selectedNFT.attributes?.size || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-600/50 p-3 rounded-lg">
                      <p className="text-sm text-gray-400">Category</p>
                      <p className="text-white font-medium">{selectedNFT.attributes?.category || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-600/50 p-3 rounded-lg">
                      <p className="text-sm text-gray-400">Weight Class</p>
                      <p className="text-white font-medium">{selectedNFT.attributes?.weightClass || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-600/50 p-3 rounded-lg">
                      <p className="text-sm text-gray-400">Min Value for Redemption</p>
                      <p className="text-white font-medium">
                        {selectedNFT.attributes?.baseRedemptionValue || 'N/A'} ETH
                      </p>
                    </div>
                  </div>
                </div>
  
                <div className="flex justify-between gap-4 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg 
                             hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => handlePurchase(selectedNFT)}
                    disabled={isProcessing || modalState.isLoadingPrice}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg
                             hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105
                             disabled:opacity-50 disabled:transform-none"
                  >
                    {modalState.isLoadingPrice ? 'Calculating Price...' : 
                     isProcessing ? 'Processing...' : 'Purchase NFT'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
  
      {/* Purchase Confirmation Modal */}
      {modalState.showPurchaseConfirm && selectedNFT && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Purchase</h3>
            
            <div className="bg-gray-700/50 p-4 rounded-lg mb-6">
              <p className="text-gray-300 mb-2">Actual price to pay:</p>
              <p className="text-2xl font-bold text-purple-400">
                {modalState.actualPrice} ETH
              </p>
            </div>
  
            {modalState.purchaseError && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4">
                {modalState.purchaseError}
              </div>
            )}
  
            <div className="flex gap-3">
              <button
                onClick={() => setModalState(prev => ({ ...prev, showPurchaseConfirm: false }))}
                className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmPurchase(selectedNFT)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg
                         hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Confirm Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}
  
  {/* Modified Listing Modal with ETH input */}
  {showListingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">List New NFT</h2>
            
            <form onSubmit={handleListingSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={listingForm.quantity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={listingForm.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-300 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={listingForm.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Item Photo URL</label>
                  <input
                    type="text"
                    name="itemPhoto"
                    value={listingForm.itemPhoto}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Weight Class</label>
                  <input
                    type="text"
                    name="weightClass"
                    value={listingForm.weightClass}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Category</label>
                  <input type="text"
                    name="category"
                    value={listingForm.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Size</label>
                  <input
                    type="text"
                    name="size"
                    value={listingForm.size}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Base Price (ETH)</label>
                  <input
                    type="text"
                    name="inputEthAmount"
                    value={listingForm.inputEthAmount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                    placeholder="e.g. 0.1"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Enter amount in ETH, base value will be calculated automatically
                  </p>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Calculated Base Token Value</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      name="baseValue"
                      value={listingForm.baseValue}
                      readOnly
                      className="w-full px-4 py-2 bg-gray-600 rounded-lg text-white cursor-not-allowed"
                      placeholder={isCalculatingBaseValue ? "Calculating..." : "Enter ETH amount first"}
                    />
                    {isCalculatingBaseValue && (
                      <div className="animate-spin text-xl ml-2">🔄</div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    This value is automatically calculated from your ETH input and displayed in ETH format
                  </p>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Redeem Price (ETH)</label>
                  <input
                    type="text"
                    name="minRedeemValue"
                    value={listingForm.minRedeemValue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
                    required
                  />
                </div>
              </div>

              {/* Info section explaining the ETH to Base Value conversion */}
              <div className="bg-gray-700/30 p-4 rounded-lg my-4 border border-purple-500/20">
                <h4 className="text-purple-400 font-medium mb-2">How ETH Amount and Base Value Work</h4>
                <p className="text-gray-300 text-sm">
                  The ETH amount you enter is converted to a Base Value. This Base Value represents the token amount that corresponds to your ETH input based on the bonding curve.
                </p>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowListingModal(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || isCalculatingBaseValue || !listingForm.baseValue}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg
                           hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : isCalculatingBaseValue ? 'Calculating...' : 'List NFT'}
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
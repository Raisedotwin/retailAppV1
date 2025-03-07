'use client';

import Link from 'next/link';
import React, { useState, useMemo, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { EIP155_CHAINS } from '@/data/EIP155Data';
import { ethers } from 'ethers';

// Define the updated NFT interface based on blockchain data
interface NFT {
  id: number;
  name: string;
  price: string;
  priceEth: number;     // Raw ETH price value
  priceUsd: number;     // Raw USD price value
  image: string;
  merchantImage: string;
  merchantName: string; // Added merchant name
  storeName: string;
  category: string;
  mintedAt: string;
  redeemableAt: string;
  tokenId: number;
  collectionAddress: string;
  storeLink: string;
}

interface NFTCardProps {
  nft: NFT;
}

// Mock placeholder for loading state
const mockNFTs: NFT[] = [
  // This will be replaced with real data
];

// NFT card component with improved image fitting
const NFTCard: React.FC<NFTCardProps> = ({ nft }) => {
  const timeUntilRedeemable = new Date(nft.redeemableAt).getTime() - new Date().getTime();
  const daysUntilRedeemable = Math.max(0, Math.floor(timeUntilRedeemable / (1000 * 60 * 60 * 24)));

  // Function to format prices nicely
  const formatPrice = () => {
    if (nft.priceUsd) {
      return (
        <div className="flex flex-col items-end">
          <span className="font-bold text-lg">${nft.priceUsd.toFixed(2)}</span>
          <span className="text-xs text-gray-300">{nft.priceEth.toFixed(5)} ETH</span>
        </div>
      );
    }
    // Fallback to original price string if USD price isn't available
    return <span className="font-bold">{nft.price}</span>;
  };

  return (
    <Link href={nft.storeLink || "#"} passHref>
      <div className="group relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:translate-y-[-4px] hover:bg-white/90 cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative aspect-square w-full overflow-hidden">
          <img 
            src={nft.image} 
            alt={nft.name}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Category Tag */}
          <div className="absolute top-3 right-3">
            <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
              {nft.category}
            </div>
          </div>

          {/* Store Info */}
          <div className="absolute bottom-3 left-3">
            <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg transition-transform duration-300 group-hover:scale-105">
              <img 
                src={nft.merchantImage || "/api/placeholder/40/40"} 
                alt={nft.merchantName || nft.storeName}
                className="w-6 h-6 rounded-full ring-2 ring-purple-500 object-cover"
              />
              <span className="ml-2 text-sm font-semibold text-gray-800 truncate max-w-[120px]">
                {nft.merchantName || nft.storeName}
              </span>
            </div>
          </div>
          
          {/* Token ID Badge */}
          <div className="absolute top-3 left-3">
            <div className="bg-purple-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
              #{nft.tokenId.toString()}
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-purple-600 transition-colors duration-300">{nft.name}</h3>
            </div>
            <div className="flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
              <span className="mr-2">💰</span>
              {formatPrice()}
            </div>
          </div>

          {/* Redeemable Timer */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <span className="mr-2">⏱️</span>
            <span>Redeemable in {nft.redeemableAt} days</span>
          </div>
          
          {/* Visual indication for clickable card */}
          <div className="flex items-center justify-center mt-3 text-purple-600 group-hover:text-purple-800 transition-colors">
            <span className="mr-1">🏪</span>
            <span className="font-medium">View in Store</span>
            <svg className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Updated MarketplacePage component with special graphic for the newest item
const MarketplacePage: React.FC = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ethUsdPrice, setEthUsdPrice] = useState<number>(0);

  // Use Base network RPC URL
  let rpcURL = EIP155_CHAINS["eip155:84532"].rpc;
  const provider = useMemo(() => new ethers.JsonRpcProvider(rpcURL), [rpcURL]);
  
  // Contract addresses and ABIs
  const marketDataContractAddr = '0x9baed514ed5AB1B13B6A4d05249C8F9f30EdF15E';
  const profileAddr = '0xA07Dc7B3d8cD9CE3a75237ed9E1b007932AA45Fb';
  
  // Simplified ABIs for the required functions
  const marketDataABI = [
    "function getNFTCount() view returns (uint256)",
    "function nfts(uint256) view returns (address collectionAddress, string storeLink, uint256 tokenId, uint256 timestamp, uint256 curveExpiry)"
  ];
  
  const phygitalABI = [
    "function getAddressName() view returns (string)",
    "function metadata(uint256) view returns (string name, string description, string itemPhoto, string weightClass, uint256 dateUntilRedemption, uint256 launchDate, string store, string category, string size, address owner, uint256 redeemValue)",
    "function getAddressLaunch() view returns (address)",
    "function getBaseValue(uint256) view returns (uint256)"
  ];
  
  const launchABI = [
    "function getBuyPriceAfterFee(uint256 amount) view returns (uint256, uint256, uint256, uint256)"
  ];
  
  const profileABI = [
    "function getStoreNameByLaunchAddress(address _launchAddress) view returns (string memory, string memory, string memory)"
  ];

  // Add a new useEffect to fetch the ETH/USD price
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        // Fetch ETH price from CoinGecko API
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        setEthUsdPrice(data.ethereum.usd);
        console.log(`Fetched ETH price: $${data.ethereum.usd}`);
      } catch (err) {
        console.error("Failed to fetch ETH price:", err);
        // Fallback price if the API fails
        setEthUsdPrice(3000); // Use a reasonable default or last known price
      }
    };

    fetchEthPrice();
    // Refresh price every 5 minutes
    const intervalId = setInterval(fetchEthPrice, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        
        // Connect to MarketData contract
        const marketDataContract = new ethers.Contract(
          marketDataContractAddr,
          marketDataABI,
          provider
        );
        
        // Connect to Profile contract
        const profileContract = new ethers.Contract(
          profileAddr,
          profileABI,
          provider
        );
        
        // Get the total number of NFTs
        const nftCount = await marketDataContract.getNFTCount();
        // Convert BigInt to Number safely
        const nftCountNumber = Number(nftCount);
        console.log(`Found ${nftCountNumber} NFTs in MarketData contract`);
        
        const nftPromises = [];
        
        // Get the data for each NFT, starting from the most recent (highest index)
        for (let i = nftCountNumber - 1; i >= 0 && i >= nftCountNumber - 20; i--) {
          nftPromises.push(fetchNFTData(marketDataContract, profileContract, i));
        }
        
        const fetchedNFTs = await Promise.all(nftPromises);
        // Filter out any null results (failed fetches)
        const validNFTs = fetchedNFTs.filter(nft => nft !== null) as NFT[];
        
        setNfts(validNFTs);
      } catch (err) {
        console.error("Error fetching NFTs:", err);
        setError("Failed to load NFTs from the blockchain. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    // Function to fetch data for a single NFT
    const fetchNFTData = async (marketDataContract: ethers.Contract, profileContract: ethers.Contract, index: number) => {
      try {
        console.log(`Fetching NFT data for index ${index}...`);
        // Get basic NFT data from MarketData contract
        const nftData = await marketDataContract.nfts(index);
        
        // Connect to the Phygital contract for this NFT
        const phygitalContract = new ethers.Contract(
          nftData.collectionAddress,
          phygitalABI,
          provider
        );
        
        // Get collection name
        const collectionName = await phygitalContract.getAddressName();
        
        // Get NFT metadata
        const metadata = await phygitalContract.metadata(nftData.tokenId);
        
        // Get base value 
        const baseValue = await phygitalContract.getBaseValue(nftData.tokenId);
        
        // Get launch contract address
        const launchAddress = await phygitalContract.getAddressLaunch();
        console.log(`Launch address for collection ${nftData.collectionAddress}, token ${nftData.tokenId}: ${launchAddress}`);
        
        // Get merchant details from Profile contract
        let merchantName = "";
        let merchantImage = "/api/placeholder/40/40";
        try {
          // Call getStoreNameByLaunchAddress to get merchant details
          const [storeName, avatarUrl, storeBio] = await profileContract.getStoreNameByLaunchAddress(launchAddress);
          merchantName = storeName;
          merchantImage = avatarUrl || "/api/placeholder/40/40";
          console.log(`Fetched merchant details for token ${nftData.tokenId}: ${merchantName}, ${merchantImage}`);
        } catch (merchantErr) {
          console.error(`Error fetching merchant details for token ${nftData.tokenId}:`, merchantErr);
          // Use collection name as fallback
          merchantName = collectionName;
        }
        
        let formattedPrice = "Price unavailable";
        let ethPrice = 0;
        let usdPrice = 0;
        
        try {
          // Connect to the Launch contract
          const launchContract = new ethers.Contract(
            launchAddress,
            launchABI,
            provider
          );
          
          // Get the actual price from the Launch contract using the base value
          const priceData = await launchContract.getBuyPriceAfterFee(baseValue);
          const actualPrice = priceData[0]; // Get first returned value
          
          // Convert BigInt to string before formatting
          const priceInEth = parseFloat(ethers.formatEther(actualPrice.toString()));
          // Ensure minimum price display of 0.00001 ETH
          ethPrice = priceInEth < 0.00001 ? 0.00001 : priceInEth;
          
          // Calculate USD price
          usdPrice = ethPrice * ethUsdPrice;
          
          // Format price
          formattedPrice = `${ethPrice.toFixed(5)} ETH ($${usdPrice.toFixed(2)})`;
          console.log(`Fetched price for token ${nftData.tokenId}: ${formattedPrice}`);
        } catch (priceErr) {
          console.error(`Error fetching price from launch contract for token ${nftData.tokenId}:`, priceErr);
          // Fallback to base value with a marker
          const fallbackPrice = parseFloat(ethers.formatEther(baseValue.toString()));
          // Ensure minimum price display of 0.00001 ETH
          ethPrice = fallbackPrice < 0.00001 ? 0.00001 : fallbackPrice;
          
          // Calculate USD price
          usdPrice = ethPrice * ethUsdPrice;
          
          // Format price
          formattedPrice = `${ethPrice.toFixed(5)} ETH* ($${usdPrice.toFixed(2)})`;
        }

        console.log(`dateUntilRedemption: ${metadata.dateUntilRedemption}`);
        
        // Format the NFT data
        return {
          id: index,
          tokenId: Number(nftData.tokenId.toString()),
          collectionAddress: nftData.collectionAddress,
          name: metadata.name,
          price: formattedPrice,
          priceEth: ethPrice,          // Add raw ETH price
          priceUsd: usdPrice,          // Add raw USD price
          image: metadata.itemPhoto || "/api/placeholder/300/300",
          merchantImage: merchantImage,
          merchantName: collectionName,
          storeName: collectionName,
          category: metadata.category,
          storeLink: nftData.storeLink,
          mintedAt: new Date(Number(nftData.timestamp.toString()) * 1000).toISOString(),
          redeemableAt: (Number(metadata.dateUntilRedemption.toString()) / 86400).toFixed(2).toString()
        };
      } catch (err) {
        console.error(`Error fetching NFT at index ${index}:`, err);
        return null;
      }
    };
    
    fetchNFTs();
  }, [provider, marketDataContractAddr, profileAddr, ethUsdPrice]);

  // New component to render NFT card with special treatment for the first item
  const renderNFTCards = () => {
    if (nfts.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <p className="text-lg text-gray-600">No NFTs found</p>
        </div>
      );
    }

    return nfts.map((nft, index) => {
      if (index === 0) {
        // Special treatment for the first item (newest)
        return (
          <div key={`${nft.collectionAddress}-${nft.tokenId}`} className="relative">
            {/* Special glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 animate-gradient-xy z-0"></div>
            
            {/* Regular NFT card with modified styling */}
            <div className="relative z-10">
              <NFTCard nft={nft} />
            </div>
            
            {/* New minted ribbon - moved to top layer */}
            <div className="absolute -top-4 -right-4 z-30 overflow-visible">
              <div className="relative w-32 h-10">
                {/* Animated starburst effect */}
                {/*<div className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 blur animate-spin-slow"></div>*/}
                
                {/* "New" badge */}
                {/* <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-yellow-400 to-red-500 text-white font-bold py-2 px-4 rounded-full shadow-lg transform -rotate-12 animate-pulse">
                  <span className="mr-1 text-xl">🔥</span>
                  <span className="text-sm whitespace-nowrap">NEW</span>
                </div>*/}
              </div>
            </div>
          </div>
        );
      }
      
      // Regular NFT cards
      return <NFTCard key={`${nft.collectionAddress}-${nft.tokenId}`} nft={nft} />;
    });
  };

  return (
    <>
      {/* Enhanced Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-purple-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob top-0 -left-4" />
          <div className="absolute w-96 h-96 bg-blue-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 top-0 -right-4" />
          <div className="absolute w-96 h-96 bg-pink-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000 -bottom-8 left-1/2 transform -translate-x-1/2" />
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjwvc3ZnPg==')] opacity-5" />
      </div>

      {/* Enhanced Sell Loyalty Points Button - with animation and effects */}
      <div className="fixed top-20 right-6 z-50">
        <Link href="/swaps">
          <button className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-400 to-orange-600 px-8 py-4 font-bold shadow-lg transition-all duration-500 hover:scale-110 hover:shadow-2xl animate-pulse">
            {/* Animated sparkles */}
            <span className="absolute top-0 left-0 h-4 w-4 rounded-full bg-white opacity-75 blur-sm animate-ping"></span>
            <span className="absolute bottom-0 right-4 h-3 w-3 rounded-full bg-white opacity-75 blur-sm animate-ping animation-delay-700"></span>
            <span className="absolute top-2 right-3 h-2 w-2 rounded-full bg-white opacity-75 blur-sm animate-ping animation-delay-1500"></span>
            
            {/* Glow effect */}
            <span className="absolute inset-0 z-0 bg-gradient-to-r from-amber-300 to-yellow-400 opacity-0 blur-xl transition-all duration-500 group-hover:opacity-70"></span>
            
            {/* Inner shine effect */}
            <span className="absolute inset-0 z-0 bg-gradient-to-tr from-white/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
            
            {/* Button content */}
            <span className="relative z-10 flex items-center">
              <span className="mr-3 text-2xl animate-bounce">💎</span>
              <span className="text-lg font-extrabold text-gray-900 drop-shadow-sm">
                Sell Loyalty Points
              </span>
              {/* Animated arrow */}
              <svg className="ml-3 h-6 w-6 transform transition-all duration-300 group-hover:translate-x-2 group-hover:scale-125" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            
            {/* Rotating border effect */}
            <span className="absolute -inset-1 z-0 rounded-2xl bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100 animate-gradient-xy"></span>
          </button>
        </Link>
      </div>

      {/* Main content - made wider */}
      <div className="min-h-screen pt-16 px-6 pb-12">
        <div className="max-w-8xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              NFT Marketplace
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover and collect unique physical items backed by blockchain technology ⚡️
            </p>
            {/* ETH price indicator */}
            {ethUsdPrice > 0 && (
              <div className="mt-4 flex justify-center items-center">
                <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-md border border-gray-200 flex items-center">
                  <span className="mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 417" preserveAspectRatio="xMidYMid" className="w-5 h-5">
                      <path fill="#343434" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" />
                      <path fill="#8C8C8C" d="M127.962 0L0 212.32l127.962 75.639V154.158z" />
                      <path fill="#3C3C3B" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z" />
                      <path fill="#8C8C8C" d="M127.962 416.905v-104.72L0 236.585z" />
                      <path fill="#141414" d="M127.961 287.958l127.96-75.637-127.96-58.162z" />
                      <path fill="#393939" d="M0 212.32l127.96 75.638v-133.8z" />
                    </svg>
                  </span>
                  <span className="font-medium text-gray-800">1 ETH = ${ethUsdPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  <span className="ml-2 text-xs text-gray-500">(All prices shown in USD)</span>
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-lg text-gray-600">Loading items from blockchain...</p>
            </div>
          )}

          {/* Loading ETH Price State */}
          {!loading && !error && ethUsdPrice === 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded mb-8 mx-auto max-w-2xl">
              <p className="font-bold">Loading price data</p>
              <p>ETH to USD conversion rate is being fetched. Prices will update momentarily.</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-8 mx-auto max-w-2xl">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* NFT Grid with special treatment for first item */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {renderNFTCards()}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MarketplacePage;
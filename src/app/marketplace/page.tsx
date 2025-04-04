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

// NFT card component with improved image fitting
const NFTCard: React.FC<NFTCardProps> = ({ nft }) => {
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

  // Add fallback URL for image errors
  const [imgError, setImgError] = useState(false);
  const handleImgError = () => setImgError(true);

  return (
    <Link href={nft.storeLink || "#"} passHref>
      <div className="group relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:translate-y-[-4px] hover:bg-white/90 cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative aspect-square w-full overflow-hidden">
          <img 
            src={imgError ? "/api/placeholder/400/400" : nft.image} 
            alt={nft.name}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={handleImgError}
          />
          
          {/* Category Tag */}
          <div className="absolute top-3 right-3">
            <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
              {nft.category || "Uncategorized"}
            </div>
          </div>

          {/* Store Info */}
          <div className="absolute bottom-3 left-3">
            <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg transition-transform duration-300 group-hover:scale-105">
              <img 
                src={nft.merchantImage || "/api/placeholder/40/40"} 
                alt={nft.merchantName || nft.storeName || "Store"}
                className="w-6 h-6 rounded-full ring-2 ring-purple-500 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/api/placeholder/40/40";
                }}
              />
              <span className="ml-2 text-sm font-semibold text-gray-800 truncate max-w-[120px]">
                {nft.merchantName || nft.storeName || "Store"}
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
              <h3 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-purple-600 transition-colors duration-300">{nft.name || "Unnamed Item"}</h3>
            </div>
            <div className="flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
              <span className="mr-2">💰</span>
              {formatPrice()}
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-600 mb-3">
            <span className="mr-2">⏱️</span>
            <span> Condition {nft.redeemableAt || "N/A"} </span>
          </div>

          <div className="flex items-center text-sm text-gray-600 mb-3">
            <span className="mr-2">⏱️</span>
            <span> Shipping {nft.mintedAt || "N/A"} </span>
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

// Beta mode configuration
const BETA_MODE = true; // Toggle this to enable/disable beta mode
const APPROVED_ADDRESSES = [
  '0x42b93B8d07eee075B851F5b488Ef6B7db148F470', 
  '0x33DCCe8EbA08DF90047fB581a2A56548a0d697Ff'
];

// Updated MarketplacePage component with better error handling and loading states
const MarketplacePage: React.FC = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ethUsdPrice, setEthUsdPrice] = useState<number>(0);
  const [loadingStatus, setLoadingStatus] = useState<string>("Initializing...");
  const [hasAccess, setHasAccess] = useState(false);
  
  // Get authentication from Privy
  const { user, authenticated, ready } = usePrivy();

  // Check access status whenever auth state or beta mode changes
  useEffect(() => {
    // If beta mode is not enabled, everyone has access
    if (!BETA_MODE) {
      setHasAccess(true);
      return;
    }

    // If not authenticated or not ready, no access
    if (!authenticated || !ready) {
      setHasAccess(false);
      return;
    }

    // Check if the user has a wallet and if it's in the approved list
    const wallets = user?.wallet?.address ? [user.wallet.address] : 
                    user?.linkedAccounts?.filter(account => account.type === 'wallet')
                    .map(account => account.address as string) || [];
    
    const hasApprovedWallet = wallets.some(wallet => 
      APPROVED_ADDRESSES.includes(wallet.toLowerCase()) || 
      APPROVED_ADDRESSES.includes(wallet)
    );
    
    setHasAccess(hasApprovedWallet);
  }, [authenticated, ready, user]);

  // Add multiple RPC URLs for fallback
  const rpcURLs = useMemo(() => [
    EIP155_CHAINS["eip155:84532"].rpc,
    "https://mainnet.base.org", // Alternative Base RPC
    "https://1rpc.io/base", // Another alternative
  ], []);

  // Create provider with fallback mechanism
  const provider = useMemo(() => {
    // Try to create provider with first URL
    try {
      const mainProvider = new ethers.JsonRpcProvider(rpcURLs[0]);
      return mainProvider;
    } catch (e) {
      console.error("Failed to connect to primary RPC, trying fallback:", e);
      try {
        // Try fallback URL if first fails
        return new ethers.JsonRpcProvider(rpcURLs[1]);
      } catch (e2) {
        console.error("Failed to connect to secondary RPC:", e2);
        // Last attempt
        return new ethers.JsonRpcProvider(rpcURLs[2]);
      }
    }
  }, [rpcURLs]);
  
  // Contract addresses and ABIs
  const marketDataContractAddr = '0xa83a1f2Bd6F1805a3a938c31b9c05606459c9043';
  const profileAddr = '0x681Fa3a6300C38973B6B9eB66df5066EA6356145';
  
  // Simplified ABIs for the required functions
  const marketDataABI = [
    "function getNFTCount() view returns (uint256)",
    "function nfts(uint256) view returns (address collectionAddress, string storeLink, uint256 tokenId, uint256 timestamp, uint256 curveExpiry)"
  ];
  
  const phygitalABI = [
    "function metadata(uint256) view returns (string name, string description, string itemPhoto, string condition, string shipping, string store, string category, string size, address owner, uint redeemValue)",
    "function getAddressLaunch() view returns (address)",
    "function getBaseValue(uint256) view returns (uint256)",
    "function getOwner(uint256 _tokenId) view returns (address)",
    "function name() view returns (string memory)"
  ];
  
  const launchABI = [
    "function getBuyPriceAfterFee(uint256 amount) view returns (uint256, uint256, uint256, uint256)"
  ];
  
  const profileABI = [
    "function getStoreNameByLaunchAddress(address _launchAddress) view returns (string memory, string memory, string memory)"
  ];

  // Add a new useEffect to fetch the ETH/USD price with retries
  useEffect(() => {
    // Skip fetching if user doesn't have access
    if (!hasAccess && BETA_MODE) return;
    
    const fetchEthPrice = async (retryCount = 0) => {
      try {
        // Try multiple price APIs
        const apis = [
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
          'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD'
        ];
        
        // Try first API
        const response = await fetch(apis[0], { signal: AbortSignal.timeout(3000) });
        if (!response.ok) throw new Error("Primary price API failed");
        
        const data = await response.json();
        const price = data.ethereum?.usd;
        
        if (!price && retryCount < 1) {
          // Try second API if first fails
          console.log("Trying alternate price API...");
          const altResponse = await fetch(apis[1], { signal: AbortSignal.timeout(3000) });
          const altData = await altResponse.json();
          const altPrice = altData.USD;
          
          if (altPrice) {
            setEthUsdPrice(altPrice);
            console.log(`Fetched ETH price from alternate API: $${altPrice}`);
            return;
          }
        } else if (price) {
          setEthUsdPrice(price);
          console.log(`Fetched ETH price: $${price}`);
          return;
        }
        
        // If we're here, both APIs failed
        if (retryCount < 3) {
          console.log(`Retrying price fetch (${retryCount + 1}/3)...`);
          setTimeout(() => fetchEthPrice(retryCount + 1), 2000);
        } else {
          // Set fallback price after multiple failures
          console.warn("Failed to fetch ETH price after multiple attempts, using fallback");
          setEthUsdPrice(3000); // Use fallback price
        }
      } catch (err) {
        console.error("Failed to fetch ETH price:", err);
        if (retryCount < 3) {
          console.log(`Retrying price fetch (${retryCount + 1}/3)...`);
          setTimeout(() => fetchEthPrice(retryCount + 1), 2000);
        } else {
          // Fallback price if the API fails after retries
          setEthUsdPrice(3000);
        }
      }
    };

    fetchEthPrice();
    // Refresh price every 5 minutes
    const intervalId = setInterval(() => fetchEthPrice(), 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [hasAccess]);

  useEffect(() => {
    // Skip fetching if user doesn't have access
    if (!hasAccess && BETA_MODE) {
      setLoading(false);
      return;
    }
    
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        setLoadingStatus("Connecting to blockchain...");
        
        // Connect to MarketData contract with timeout
        const connectPromise = new Promise<ethers.Contract>(async (resolve, reject) => {
          try {
            const marketDataContract = new ethers.Contract(
              marketDataContractAddr,
              marketDataABI,
              provider
            );
            resolve(marketDataContract);
          } catch (err) {
            reject(err);
          }
        });
        
        // Add timeout for connection
        const marketDataContract = await Promise.race([
          connectPromise,
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error("Connection timeout")), 10000)
          )
        ]) as ethers.Contract;
        
        // Connect to Profile contract
        const profileContract = new ethers.Contract(
          profileAddr,
          profileABI,
          provider
        );
        
        setLoadingStatus("Fetching NFT count...");
        
        // Get the total number of NFTs with timeout and retry
        const getNFTCount = async (retries = 2): Promise<number> => {
          try {
            const nftCountPromise = marketDataContract.getNFTCount();
            const nftCount = await Promise.race([
              nftCountPromise,
              new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error("NFT count timeout")), 5000)
              )
            ]);
            
            // Convert BigInt to Number safely
            return Number(nftCount);
          } catch (err) {
            console.error(`Error fetching NFT count (retries left: ${retries}):`, err);
            if (retries > 0) {
              console.log("Retrying getNFTCount...");
              // Wait briefly before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
              return getNFTCount(retries - 1);
            }
            throw new Error("Failed to get NFT count after retries");
          }
        };
        
        const nftCountNumber = await getNFTCount();
        console.log(`Found ${nftCountNumber} NFTs in MarketData contract`);
        
        if (nftCountNumber === 0) {
          setNfts([]);
          setLoading(false);
          return;
        }
        
        setLoadingStatus(`Loading NFT data for ${Math.min(nftCountNumber, 20)} items...`);
        
        // Instead of fetching all NFTs at once, fetch in batches
        const fetchBatch = async (startIdx: number, endIdx: number): Promise<(NFT | null)[]> => {
          const batchPromises = [];
          
          for (let i = startIdx; i >= endIdx; i--) {
            // Add timeout to each fetch
            const fetchWithTimeout = async (): Promise<NFT | null> => {
              return Promise.race([
                fetchNFTData(marketDataContract, profileContract, i),
                new Promise<null>((resolve) => {
                  setTimeout(() => {
                    console.warn(`NFT fetch timeout for index ${i}`);
                    resolve(null);
                  }, 10000); // 10 second timeout per NFT
                })
              ]);
            };
            
            batchPromises.push(fetchWithTimeout());
          }
          
          return Promise.all(batchPromises);
        };
        
        // Calculate start and end indices (fetch last 20 NFTs maximum)
        const startIdx = nftCountNumber - 1;
        const endIdx = Math.max(0, nftCountNumber - 20);
        
        // Fetch NFTs in smaller batches to avoid overwhelming the RPC
        const batchSize = 5;
        let allNFTs: (NFT | null)[] = [];
        
        for (let i = startIdx; i >= endIdx; i -= batchSize) {
          const batchEndIdx = Math.max(endIdx, i - batchSize + 1);
          setLoadingStatus(`Loading batch ${Math.floor((startIdx - i) / batchSize) + 1}/${Math.ceil((startIdx - endIdx + 1) / batchSize)}...`);
          
          const batchResult = await fetchBatch(i, batchEndIdx);
          allNFTs = [...allNFTs, ...batchResult];
          
          // Update the UI with partial results as we go
          const validNFTsSoFar = allNFTs.filter(nft => nft !== null) as NFT[];
          if (validNFTsSoFar.length > 0) {
            setNfts(validNFTsSoFar);
          }
        }
        
        // Final filtered results
        const validNFTs = allNFTs.filter(nft => nft !== null) as NFT[];
        console.log(`Successfully fetched ${validNFTs.length} valid NFTs out of ${allNFTs.length} attempts`);
        
        if (validNFTs.length === 0 && allNFTs.length > 0) {
          // All fetches failed but we tried - show error
          setError("Failed to load NFT data. Please refresh to try again.");
        }
        
        setNfts(validNFTs);
      } catch (err) {
        console.error("Error in main fetchNFTs:", err);
        setError("Failed to load NFTs from the blockchain. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    // Function to fetch data for a single NFT with improved error handling
    const fetchNFTData = async (marketDataContract: ethers.Contract, profileContract: ethers.Contract, index: number) => {
      try {
        // Get basic NFT data from MarketData contract
        const nftData = await marketDataContract.nfts(index);
        
        let collectionName = "Unknown Collection";
        let metadata = { 
          name: "Unnamed NFT", 
          itemPhoto: "/api/placeholder/400/400", 
          category: "Other", 
          shipping: "Unknown", 
          condition: "Unknown"
        };
        let merchantName = "Unknown Merchant";
        let merchantImage = "/api/placeholder/40/40";
        let formattedPrice = "Price unavailable";
        let ethPrice = 0;
        let usdPrice = 0;
        let launchAddress = ethers.ZeroAddress;
        
        try {
          // Connect to the Phygital contract for this NFT
          const phygitalContract = new ethers.Contract(
            nftData.collectionAddress,
            phygitalABI,
            provider
          );
          
          // Wrap each call in a try/catch to prevent a single failure from breaking everything
          try {
            collectionName = await phygitalContract.name();
          } catch (e) {
            console.warn(`Failed to get collection name for NFT ${index}:`, e);
          }
          
          try {
            metadata = await phygitalContract.metadata(nftData.tokenId);
          } catch (e) {
            console.warn(`Failed to get metadata for NFT ${index}:`, e);
          }
          
          try {
            launchAddress = await phygitalContract.getAddressLaunch();
          
            // Try to get merchant details from Profile contract
            try {
              const [storeName, avatarUrl] = await profileContract.getStoreNameByLaunchAddress(launchAddress);
              merchantName = storeName || collectionName;
              merchantImage = avatarUrl || "/api/placeholder/40/40";
            } catch (e) {
              console.warn(`Failed to get merchant details for NFT ${index}:`, e);
              merchantName = collectionName;
            }
          } catch (e) {
            console.warn(`Failed to get launch address for NFT ${index}:`, e);
          }
          
          // Try to get price
          try {
            // Get base value first
            const baseValue = await phygitalContract.getBaseValue(nftData.tokenId);
            
            // Only proceed with price calculation if we have launch address and base value
            if (launchAddress !== ethers.ZeroAddress) {
              const launchContract = new ethers.Contract(
                launchAddress,
                launchABI,
                provider
              );
              
              // Get the actual price from the Launch contract using the base value
              const priceData = await launchContract.getBuyPriceAfterFee(baseValue.toString());
              const actualPrice = priceData[0]; // Get first returned value
              
              // Convert BigInt to string before formatting
              const priceInEth = parseFloat(ethers.formatEther(actualPrice.toString()));
              // Ensure minimum price display of 0.00001 ETH
              ethPrice = priceInEth < 0.00001 ? 0.00001 : priceInEth;
              
              // Calculate USD price
              usdPrice = ethPrice * ethUsdPrice;
              
              // Format price
              formattedPrice = `${ethPrice.toFixed(5)} ETH ($${usdPrice.toFixed(2)})`;
            } else {
              // Fallback to base value
              const fallbackPrice = parseFloat(ethers.formatEther(baseValue.toString()));
              ethPrice = fallbackPrice < 0.00001 ? 0.00001 : fallbackPrice;
              usdPrice = ethPrice * ethUsdPrice;
              formattedPrice = `${ethPrice.toFixed(5)} ETH* ($${usdPrice.toFixed(2)})`;
            }
          } catch (e) {
            console.warn(`Failed to calculate price for NFT ${index}:`, e);
          }
        } catch (e) {
          console.error(`Failed to process Phygital contract for NFT ${index}:`, e);
        }
        
        // Format the NFT data with fallbacks for missing values
        return {
          id: index,
          tokenId: Number(nftData.tokenId.toString()),
          collectionAddress: nftData.collectionAddress,
          name: metadata.name || "Unnamed Item",
          price: formattedPrice,
          priceEth: ethPrice,
          priceUsd: usdPrice,
          image: metadata.itemPhoto || "/api/placeholder/400/400",
          merchantImage: merchantImage,
          merchantName: merchantName,
          storeName: collectionName,
          category: metadata.category || "Other",
          storeLink: nftData.storeLink || "#",
          mintedAt: metadata.shipping || "Unknown",
          redeemableAt: metadata.condition || "Unknown"
        };
      
      } catch (err) {
        console.error(`Error fetching NFT at index ${index}:`, err);
        return null;
      }
    };
    
    fetchNFTs();
  }, [provider, marketDataContractAddr, profileAddr, ethUsdPrice, hasAccess]);

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
          </div>
        );
      }
      
      // Regular NFT cards
      return <NFTCard key={`${nft.collectionAddress}-${nft.tokenId}`} nft={nft} />;
    });
  };

  // Component for access denied state
  const AccessDenied = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-xl">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-4 text-purple-700">Access Restricted</h1>
        <p className="text-gray-600 mb-6">
          This marketplace is currently in beta mode and only accessible to approved wallets.
        </p>
        {!authenticated ? (
          <div>
            <p className="text-gray-700 mb-4">Please connect your wallet to continue.</p>
            <button 
              onClick={() => user}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-700">
              Your wallet address is not on the approved list. Please contact the administrator 
              for access or try connecting with an approved wallet.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // If in beta mode and user doesn't have access, show access denied page
  if (BETA_MODE && !hasAccess) {
    return <AccessDenied />;
  }

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
'use client';

import React from 'react';
import Link from 'next/link';

interface NFT {
  id: number;
  name: string;
  price: string;
  image: string;
  merchantImage: string;
  storeName: string;
  category: string;
  mintedAt: string;
  redeemableAt: string;
}

interface NFTCardProps {
  nft: NFT;
}

const mockNFTs: NFT[] = [
  {
    id: 1,
    name: "Vintage Baseball Card",
    price: "2.5 ETH",
    image: "/api/placeholder/300/300",
    merchantImage: "/api/placeholder/40/40",
    storeName: "Collectibles Plus",
    category: "Sports Memorabilia",
    mintedAt: "2024-02-14T12:00:00Z",
    redeemableAt: "2024-03-14T12:00:00Z"
  },
  {
    id: 2,
    name: "Limited Edition Sneakers",
    price: "1.8 ETH",
    image: "/api/placeholder/300/300",
    merchantImage: "/api/placeholder/40/40",
    storeName: "Kicks Supreme",
    category: "Fashion",
    mintedAt: "2024-02-14T11:30:00Z",
    redeemableAt: "2024-03-14T11:30:00Z"
  },
  {
    id: 3,
    name: "Rare Comic Book",
    price: "3.2 ETH",
    image: "/api/placeholder/300/300",
    merchantImage: "/api/placeholder/40/40",
    storeName: "Comic Haven",
    category: "Entertainment",
    mintedAt: "2024-02-14T11:00:00Z",
    redeemableAt: "2024-03-14T11:00:00Z"
  },
  {
    id: 4,
    name: "Rare Comic Book",
    price: "3.2 ETH",
    image: "/api/placeholder/300/300",
    merchantImage: "/api/placeholder/40/40",
    storeName: "Comic Haven",
    category: "Entertainment",
    mintedAt: "2024-02-14T11:00:00Z",
    redeemableAt: "2024-03-14T11:00:00Z"
  },
  {
    id: 5,
    name: "Rare Comic Book",
    price: "3.2 ETH",
    image: "/api/placeholder/300/300",
    merchantImage: "/api/placeholder/40/40",
    storeName: "Comic Haven",
    category: "Entertainment",
    mintedAt: "2024-02-14T11:00:00Z",
    redeemableAt: "2024-03-14T11:00:00Z"
  },

  {
    id: 6,
    name: "Rare Comic Book",
    price: "3.2 ETH",
    image: "/api/placeholder/300/300",
    merchantImage: "/api/placeholder/40/40",
    storeName: "Comic Haven",
    category: "Entertainment",
    mintedAt: "2024-02-14T11:00:00Z",
    redeemableAt: "2024-03-14T11:00:00Z"
  },
  {
    id: 7,
    name: "Rare Comic Book",
    price: "3.2 ETH",
    image: "/api/placeholder/300/300",
    merchantImage: "/api/placeholder/40/40",
    storeName: "Comic Haven",
    category: "Entertainment",
    mintedAt: "2024-02-14T11:00:00Z",
    redeemableAt: "2024-03-14T11:00:00Z"
  },
  {
    id: 8,
    name: "Rare Comic Book",
    price: "3.2 ETH",
    image: "/api/placeholder/300/300",
    merchantImage: "/api/placeholder/40/40",
    storeName: "Comic Haven",
    category: "Entertainment",
    mintedAt: "2024-02-14T11:00:00Z",
    redeemableAt: "2024-03-14T11:00:00Z"
  }
];

//we will have a market data contract here we fetch all market data and link back to the the store as well
const NFTCard: React.FC<NFTCardProps> = ({ nft }) => {
  const timeUntilRedeemable = new Date(nft.redeemableAt).getTime() - new Date().getTime();
  const daysUntilRedeemable = Math.max(0, Math.floor(timeUntilRedeemable / (1000 * 60 * 60 * 24)));

  return (
    <div className="group relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:translate-y-[-4px] hover:bg-white/90">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        <img 
          src={nft.image} 
          alt={nft.name}
          className="w-full h-64 object-cover transform transition-transform duration-300 group-hover:scale-105"
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
              src={nft.merchantImage} 
              alt={nft.storeName}
              className="w-6 h-6 rounded-full ring-2 ring-purple-500"
            />
            <span className="ml-2 text-sm font-semibold text-gray-800">{nft.storeName}</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-purple-600 transition-colors duration-300">{nft.name}</h3>
          </div>
          <div className="flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <span className="mr-2">✨</span>
            <span className="font-bold">{nft.price}</span>
          </div>
        </div>

        {/* Redeemable Timer */}
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">⏱️</span>
          <span>Redeemable in {daysUntilRedeemable} days</span>
        </div>
      </div>
    </div>
  );
};

const MarketplacePage: React.FC = () => {
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
          </div>

          {/* NFT Grid - changed to 4 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockNFTs
              .sort((a, b) => new Date(b.mintedAt).getTime() - new Date(a.mintedAt).getTime())
              .map(nft => (
                <NFTCard key={nft.id} nft={nft} />
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MarketplacePage;
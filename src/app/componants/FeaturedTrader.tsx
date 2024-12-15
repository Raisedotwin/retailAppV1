import React from 'react';
import Image from 'next/image';

const ArrowIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors"
  >
    <path d="M7 17L17 7"/>
    <path d="M7 7h10v10"/>
  </svg>
);

interface BlinkingEmojiProps {
  children: React.ReactNode;
  delay?: string;
}

const BlinkingEmoji: React.FC<BlinkingEmojiProps> = ({ children, delay = '0s' }) => (
  <span 
    className="inline-block animate-bounce"
    style={{ animationDelay: delay }}
  >
    <span className="animate-pulse text-2xl">{children}</span>
  </span>
);

const FeaturedTrader: React.FC = () => {
  const platforms = [
    {
      name: 'Opensea',
      url: 'https://opensea.io/',
      imagePath: '/icons/opensea2699.jpg',
      description: 'Trade NFTs'
    },
    {
      name: 'JOJO Perps',
      url: 'https://jojo.exchange/',
      imagePath: '/icons/jojo.exchange.jpg',
      description: 'Trade Perpetuals'
    },
    {
      name: 'Uniswap',
      url: 'https://app.uniswap.org/',
      imagePath: '/icons/uniswap8205.jpg',
      description: 'Swap Tokens'
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-16">
      <div className="space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <BlinkingEmoji delay="0.1s">✈️</BlinkingEmoji>
            <BlinkingEmoji delay="0.2s">⭐</BlinkingEmoji>
            <BlinkingEmoji delay="0.3s">💫</BlinkingEmoji>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mx-4">
              Raise Your Token Price
            </h2>
            <BlinkingEmoji delay="0.4s">💰</BlinkingEmoji>
            <BlinkingEmoji delay="0.5s">🌟</BlinkingEmoji>
            <BlinkingEmoji delay="0.6s">☁️</BlinkingEmoji>
          </div>
          <p className="text-lg text-gray-600">
            Raise From Token || Create Profit || Make Buybacks
          </p>
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {platforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="h-full bg-white rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-100">
                <div className="p-6">
                  <div className="relative h-48 mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={platform.imagePath}
                      alt={platform.name}
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">{platform.name}</h3>
                      <ArrowIcon />
                    </div>
                    <p className="text-sm text-gray-500">{platform.description}</p>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTrader;
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
    className="w-6 h-6 text-purple-400 group-hover:text-blue-500 transition-all duration-300 group-hover:rotate-45"
  >
    <path d="M7 17L17 7"/>
    <path d="M7 7h10v10"/>
  </svg>
);

const NeonText = () => (
  <p className="relative text-l md:text-2xl font-bold text-center">
   
    <span className="relative text-black bg-clip-text text-transparent">
      The #1 Buyback Game On Base
    </span>
  </p>
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
      description: 'Trade NFTs',
      bgGradient: 'from-blue-500 to-purple-500'
    },
    {
      name: 'JOJO Perps',
      url: 'https://jojo.exchange/',
      imagePath: '/icons/jojo.exchange.jpg',
      description: 'Trade Perpetuals',
      bgGradient: 'from-emerald-500 to-cyan-500'
    },
    {
      name: 'Uniswap',
      url: 'https://app.uniswap.org/',
      imagePath: '/icons/uniswap8205.jpg',
      description: 'Swap Tokens',
      bgGradient: 'from-pink-500 to-rose-500'
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-16">
      <div className="space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
        <div className="flex justify-center items-center gap-4 flex-wrap">
  <BlinkingEmoji delay="0.1s">🪙</BlinkingEmoji>
  <BlinkingEmoji delay="0.2s">💎</BlinkingEmoji>
  <BlinkingEmoji delay="0.3s">🦍</BlinkingEmoji>
  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mx-4">
    Raise Your Marketcap
  </h2>
  <BlinkingEmoji delay="0.4s">🧠</BlinkingEmoji>
  <BlinkingEmoji delay="0.5s">🤑</BlinkingEmoji>
  <BlinkingEmoji delay="0.6s">🔥</BlinkingEmoji>
</div>
          <NeonText />
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
              <div className="relative h-full rounded-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2">
                {/* Gradient background with blur effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${platform.bgGradient} opacity-10 rounded-2xl blur-xl group-hover:opacity-20 transition-opacity`}></div>
                
                {/* Card content */}
                <div className="relative h-full bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg group-hover:shadow-2xl transition-all duration-300">
                  <div className="p-8">
                    <div className="relative h-48 mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden group-hover:shadow-lg transition-shadow">
                      <Image
                        src={platform.imagePath}
                        alt={platform.name}
                        fill
                        className="object-contain p-4 transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                          {platform.name}
                        </h3>
                        <ArrowIcon />
                      </div>
                      <p className="text-base text-gray-600 font-medium">
                        {platform.description}
                      </p>
                    </div>
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
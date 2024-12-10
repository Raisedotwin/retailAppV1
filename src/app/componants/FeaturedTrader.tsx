import React from 'react';
import Image from 'next/image';

const FeaturedTrader: React.FC = () => {
  return (
    <section className="mb-12">
      {/* Title */}
      <h2 className="text-3xl font-bold text-center mb-8">
        Raise your token price by trading perps, NFTs, and swaps.
      </h2>

      {/* Image Row */}
      <div className="flex justify-center space-x-8">
        {/* Example Card 1 */}
        <div className="flex-none w-80">
          <a
            href="https://opensea.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white border border-gray-200 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-center justify-center mb-4 h-48">
              <Image
                src="/icons/opensea2699.jpg"
                alt="Opensea"
                width={200}
                height={200}
                className="rounded-md object-contain"
              />
            </div>
            <p className="text-lg font-semibold text-center">Opensea</p>
          </a>
        </div>

        {/* Example Card 2 */}
        <div className="flex-none w-80">
          <a
            href="https://jojo.exchange/"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white border border-gray-200 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-center justify-center mb-4 h-48">
              <Image
                src="/icons/jojo.exchange.jpg"
                alt="JOJO Perps"
                width={200}
                height={200}
                className="rounded-md object-contain"
              />
            </div>
            <p className="text-lg font-semibold text-center">JOJO Perps</p>
          </a>
        </div>

        {/* Example Card 3 */}
        <div className="flex-none w-80">
          <a
            href="https://app.uniswap.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white border border-gray-200 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-center justify-center mb-4 h-48">
              <Image
                src="/icons/uniswap8205.jpg"
                alt="Uniswap"
                width={200}
                height={200}
                className="rounded-md object-contain"
              />
            </div>
            <p className="text-lg font-semibold text-center">Uniswap</p>
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTrader;

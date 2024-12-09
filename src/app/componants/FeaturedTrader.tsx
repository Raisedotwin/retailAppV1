// components/FeaturedCreators.tsx
import React from 'react';
import Image from 'next/image';

const FeaturedTrader: React.FC = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4">Featured Traders</h2>
      <p className="text-gray-500 mb-6">In-demand traders</p>
      <div className="flex overflow-x-auto space-x-4">
        {/* Example Featured Creator */}
        <div className="flex-none w-48">
          <div className="bg-gray-200 rounded-lg p-4">
            <Image src="/path-to-image.jpg" alt="Creator" width={192} height={192} className="rounded-full mb-4"/>
            <p className="text-lg font-semibold">Trader Name</p>
            <p className="text-gray-500">$12.38 per token</p>
          </div>
        </div>
        {/* Add more creator cards as needed */}
      </div>
    </section>
  );
};

export default FeaturedTrader;

// components/BrowseCategories.tsx
import React from 'react';

const Categories: React.FC = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4">Browse Categories</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-200 p-6 rounded-lg text-center">
          <p className="font-semibold">Base</p>
          <p className="text-gray-500">Traders on base</p>
        </div>
        <div className="bg-gray-200 p-6 rounded-lg text-center">
          <p className="font-semibold">Avax</p>
          <p className="text-gray-500">Traders on avalanche</p>
        </div>
        <div className="bg-gray-200 p-6 rounded-lg text-center">
          <p className="font-semibold">Meme Coins</p>
          <p className="text-gray-500">Top trading degens</p>
        </div>
        {/* Add more categories as needed */}
      </div>
    </section>
  );
};

export default Categories;

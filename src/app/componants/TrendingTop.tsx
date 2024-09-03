// components/TrendingTop.tsx
import React from 'react';

const TrendingTop: React.FC = () => {
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Trending</h2>
        <button className="bg-gray-200 px-4 py-2 rounded-lg">Top</button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p>Rank</p>
          <div className="flex flex-col items-start">
            {/* Example Rank Entry */}
            <div className="flex items-center space-x-4 mb-4">
              <img src="/path-to-image.jpg" alt="Creator" className="rounded-full w-8 h-8"/>
              <div>
                <p className="font-semibold">Creator Name</p>
                <p className="text-gray-500">$198</p>
              </div>
            </div>
            {/* Add more rank entries as needed */}
          </div>
        </div>
        <div className="text-center">
          <p>Volume</p>
          {/* Add volume entries similar to rank */}
        </div>
      </div>
    </section>
  );
};

export default TrendingTop;

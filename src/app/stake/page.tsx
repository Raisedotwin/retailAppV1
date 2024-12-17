import React, { useEffect, useState } from 'react';
import { useAccount } from '../context/AccountContext';
import FeaturedTrader from '../componants/FeaturedTrader';
import Categories from '../componants/Categories';
import TrendingTop from '../componants/TrendingTop';
import LatestActivity from '../componants/LatestActivity';

interface Balance {
  runeName: string;
  amount: number;
}

const StakePage: React.FC = () => {
  const { account } = useAccount();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);

  return (
    <>
      {/* Background effects container */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-[500px] h-[500px] bg-purple-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob top-0 left-0" />
          <div className="absolute w-[500px] h-[500px] bg-blue-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 top-0 right-0" />
          <div className="absolute w-[500px] h-[500px] bg-pink-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 bottom-0 left-1/2 transform -translate-x-1/2" />
        </div>
      </div>

      {/* Main content with reduced top spacing */}
      <div className="min-h-screen pt-12 px-6 pb-6"> {/* Reduced from pt-20 to pt-12 */}
        <div className="max-w-7xl w-full mx-auto p-4"> {/* Reduced from p-6 to p-4 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
            <div className="pt-2"> {/* Added small top padding for subtle spacing */}
              <FeaturedTrader />
              <TrendingTop />
              <Categories />
              <LatestActivity />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StakePage;
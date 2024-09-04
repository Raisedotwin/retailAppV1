"use client";

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
    <div className="min-h-screen p-6" style={{ backgroundColor: '#edf2f7' }}>
      {/* Adjusted max width to occupy more space */}
      <div className="max-w-7xl w-full mx-auto p-6 bg-white rounded-lg shadow-md">
         <FeaturedTrader />
         <TrendingTop />
         <Categories />
         <LatestActivity />
      </div>
    </div>
  );
};

export default StakePage;

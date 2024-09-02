"use client";

import React from 'react';
import Leaderboard from '../componants/Leaderboard';

const Leaderboards = () => {
  const data = [
    // Example data
    { rank: 1, wallet: 'bc1p7...p5ym0', rewards: '1,125', apy: '12.5', daysStaked: 121 },
    { rank: 2, wallet: 'bc1p7...p5ym0', rewards: '1,021', apy: '12.5', daysStaked: 119 },
    { rank: 3, wallet: 'bc1p7...p5ym0', rewards: '1,021', apy: '12.5', daysStaked: 119 },
    { rank: 4, wallet: 'bc1p7...p5ym0', rewards: '1,021', apy: '12.5', daysStaked: 119 },
    { rank: 5, wallet: 'bc1p7...p5ym0', rewards: '1,021', apy: '12.5', daysStaked: 119 },
    { rank: 6, wallet: 'bc1p7...p5ym0', rewards: '1,021', apy: '12.5', daysStaked: 119 },
    { rank: 7, wallet: 'bc1p7...p5ym0', rewards: '1,021', apy: '12.5', daysStaked: 119 },
    // More data here
  ];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#edf2f7' }}>
    </div>
  );
};

export default Leaderboards;


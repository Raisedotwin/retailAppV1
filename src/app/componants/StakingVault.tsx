"use client";

import React from 'react';

const StakingVault = ({ token, apy, rewards }) => (
  <div className="p-6 bg-gray-100 rounded mb-4 flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <h3 className="font-bold">{token}</h3>
      <p>APY: {apy}%</p>
      <p>Rewards: {rewards}</p>
    </div>
    <button className="bg-gradient-to-r from-orange-400 to-purple-500 text-white py-2 px-4 rounded">
      Claim Rewards
    </button>
  </div>
);

export default StakingVault;


  
import React from 'react';

interface StakingVaultProps {
  token: string;
  apy: number;
  rewards: number; // or string, depending on what type rewards is
  balance: number;
  staked: boolean;
}

const StakingVault: React.FC<StakingVaultProps> = ({ token, apy, rewards, balance, staked }) => (
  <div className="p-6 bg-white rounded-lg shadow-md mb-4 flex items-center justify-between">
    <div className="flex items-center space-x-6">
      <h3 className="font-bold text-lg text-gray-800">{token}</h3>
      <div className={`py-1 px-3 rounded-full ${staked ? 'bg-green-500' : 'bg-red-500'} text-white`}>
        {staked ? 'Staked' : 'Unstaked'}
      </div>
    </div>
    <p className="text-gray-600">APY: <span className="font-semibold">{apy}%</span></p>
    <p className="text-gray-600">Rewards: <span className="font-semibold">{rewards}</span></p>
    <button className="bg-gradient-to-r from-orange-400 to-purple-500 text-white py-2 px-4 rounded-lg">
      Claim Rewards
    </button>
  </div>
);

export default StakingVault;



  
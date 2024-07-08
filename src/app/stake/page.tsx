import React from 'react';
import StakeForm from '../componants/StakingForm';
import StakingVault from '../componants/StakingVault';

const StakePage = () => (
  <div className="min-h-screen bg-gray-100 p-6">
    <div className="max-w-4xl w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      <StakeForm />
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Staking Vaults</h2>
        <StakingVault token="DOG-TO-THE-MOON" apy="10.65" rewards="1,125" />
        <StakingVault token="RUNIVERSE-TOKEN" apy="15" rewards="5,550" />
      </div>
    </div>
  </div>
);

export default StakePage;


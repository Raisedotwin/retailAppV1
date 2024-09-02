"use client";

import React, { useEffect, useState } from 'react';
import StakeForm from '../componants/StakingForm';
import StakingVault from '../componants/StakingVault';
import Wallet from 'sats-connect';
import { useAccount } from '../context/AccountContext';

interface Balance {
  runeName: string;
  amount: number;
}

const StakePage: React.FC = () => {
  const { account } = useAccount();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);

  const getTokenBalance = (tokenName: string): number => {
    const tokenBalance = balances.find(balance => balance.runeName === tokenName);
    return tokenBalance ? tokenBalance.amount : 0;
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#edf2f7' }}>
      <div className="max-w-4xl w-full mx-auto p-6 bg-white rounded-lg shadow-md">
        <StakeForm />
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Staking Vaults</h2>
          {loading ? (
            <p>Loading balances...</p>
          ) : (
            <>
              <StakingVault 
                token="DOG-TO-THE-MOON" 
                apy={10.65} 
                rewards={0} 
                balance={getTokenBalance('DOG-TO-THE-MOON')}
                staked={false}
              />
              <StakingVault 
                token="RUNIVERSE-TOKEN" 
                apy={15} 
                rewards={0} 
                balance={getTokenBalance('RUNIVERSE-TOKEN')}
                staked={false}
              />
              <StakingVault 
                token="STAKINGDOGTOKEN" 
                apy={8.5} 
                rewards={0.00001} 
                balance={getTokenBalance('STAKINGDOGTOKEN')}
                staked={true}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StakePage;

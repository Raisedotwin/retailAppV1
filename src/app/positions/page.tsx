"use client";

import Leaderboard from '../componants/Leaderboard';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAccount } from '../context/AccountContext';
import { ethers } from 'ethers';
import { EIP155_CHAINS } from '@/data/EIP155Data';
import { usePrivy } from '@privy-io/react-auth';

interface Position {
  token: string;
  amount: string;
}

const PositionsPage = () => {
  const { account } = useAccount();
  const [positions, setPositions] = useState<Position[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const { user } = usePrivy();

  const rpcURL = EIP155_CHAINS["eip155:8453"].rpc;
  const provider = useMemo(() => new ethers.JsonRpcProvider(rpcURL), [rpcURL]);

  const tokenPoolABI = require("../abi/traderPool");
  const profileAddr = '0x1330DF62D4CA561B96C2F7B69fd1F490c654B690';
  const profileABI = require("../abi/profile");
  const profileContract = useMemo(() => new ethers.Contract(profileAddr, profileABI, provider), [profileAddr, profileABI, provider]);

  const fetchProfile = useCallback(async () => {
    try {
      let username = user?.twitter?.username;
      if (username) {
        const profile = await profileContract.getProfileByName(username);
        return profile;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [profileContract, user?.twitter?.username]);

  const fetchPositions = useCallback(async () => {
    try {
      const profile = await fetchProfile();
      if (profile && profile.length > 5) {
        const traderPoolAddr = profile[5];
        if (traderPoolAddr) {
          const traderPoolInstance = new ethers.Contract(traderPoolAddr, tokenPoolABI, provider);
          const currentPositions: Position[] = await traderPoolInstance.getCurrentPositions(); // Explicitly typing the positions
  
          const filteredPositions = currentPositions.filter((position: Position) =>
            position.token !== '0x0000000000000000000000000000000000000000'
          );
  
          setPositions(filteredPositions);
  
          // Structure data for Leaderboard
          const leaderboardFormattedData = filteredPositions.map((position, index) => ({
            rank: index + 1,
            wallet: position.token, // You can add truncation logic if needed
            rewards: parseFloat(ethers.formatEther(position.amount)).toFixed(4), // Assuming rewards is amount
            apy: '12.5', // Replace with actual APY if available
            daysStaked: 100 + index, // Placeholder, replace with actual data if available
          }));
  
          setLeaderboardData(leaderboardFormattedData);
        }
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  }, [fetchProfile, provider, tokenPoolABI]);
  

  useEffect(() => {
    const initContract = async () => {
      try {
        await fetchPositions();
      } catch (error) {
        console.error('Error initializing contract:', error);
      }
    };
    initContract();
  }, [fetchPositions]);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#edf2f7' }}>
      <Leaderboard data={leaderboardData} />
    </div>
  );
};

export default PositionsPage;


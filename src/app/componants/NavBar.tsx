"use client";

import React from 'react';
import Link from 'next/link';
import Wallet from 'sats-connect';
import { useAccount } from '../context/AccountContext';

const NavBar: React.FC = () => {
  const { account, setAccount } = useAccount();

  const handleConnect = async () => {
    try {
      const response = await Wallet.request('getAccounts', {
        purposes: ['ordinals', 'payment', 'stacks'],
        message: 'Connect your wallet to RUNIVERSE to manage your assets.',
      });

      console.log("getAccounts ~ response:", response);

      if (response.status === 'success') {
        const paymentAddressItem = response.result.find(
          (address: any) => address.purpose === 'payment'
        );
        const ordinalsAddressItem = response.result.find(
          (address: any) => address.purpose === 'ordinals'
        );
        const stacksAddressItem = response.result.find(
          (address: any) => address.purpose === 'stacks'
        );

        // Update state with the desired address, e.g., payment address
        setAccount(paymentAddressItem?.address || ordinalsAddressItem?.address || stacksAddressItem?.address);
      } else {
        if (response.error.code === 'USER_REJECTION') {
          // Handle user cancellation error
          console.warn('User rejected the connection request');
        } else {
          // Handle other errors
          console.error('Connection request failed', response.error);
        }
      }
    } catch (err: any) {
      console.error('Connection request error', err.message);
      alert(err.message);
    }
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-black text-white w-full">
      <div className="flex items-center space-x-4">
        <Link href="/"><div className="text-lg font-bold cursor-pointer">RUNIVERSE</div></Link>
        <Link href="/leaderboards"><div className="hover:text-gray-300 cursor-pointer">Leaderboard</div></Link>
        <Link href="/create"><div className="hover:text-gray-300 cursor-pointer">Create</div></Link>
        <Link href="/profile"><div className="hover:text-gray-300 cursor-pointer">Profile</div></Link>
      </div>
      {account ? (
        <div className="bg-gradient-to-r from-orange-400 to-purple-500 px-4 py-2 rounded">
          {account}
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="bg-gradient-to-r from-orange-400 to-purple-500 px-4 py-2 rounded"
        >
          Connect Wallet
        </button>
      )}
    </nav>
  );
};

export default NavBar;



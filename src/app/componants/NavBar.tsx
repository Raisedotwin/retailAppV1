
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Wallet from 'sats-connect';

const Navbar = () => {
  const [account, setAccount] = useState(null);

  const handleConnect = async () => {
    try {
      const response = await Wallet.request('getAccounts', {
        purposes: ['ordinals', 'payment', 'stacks'],
        message: 'Connect your wallet to RUNIVERSE to manage your assets.',
      });
      console.log("getAccounts ~ response:", response);
      if (response.status === 'success') {
        const paymentAddressItem = response.result.find(
          (address) => address.purpose === 'payment'
        );
        const ordinalsAddressItem = response.result.find(
          (address) => address.purpose === 'ordinals'
        );
        const stacksAddressItem = response.result.find(
          (address) => address.purpose === 'stacks'
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
    } catch (err) {
      console.error('Connection request error', err.message);
      alert(err.message);
    }
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-black text-white w-full">
      <div className="flex items-center space-x-4">
        <Link href="/"><div className="text-lg font-bold">RUNIVERSE</div></Link>
        <Link href="/leaderboards"><div className="hover:text-gray-300">Leaderboard</div></Link>
        <Link href="/create"><div className="hover:text-gray-300">Create</div></Link>
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

export default Navbar;


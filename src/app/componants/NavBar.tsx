"use client";

import React from 'react';
import Link from 'next/link';
import Wallet from 'sats-connect';
import { useAccount } from '../context/AccountContext';

const NavBar: React.FC = () => {
  const { account, setAccount } = useAccount();

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
          className="bg-gradient-to-r from-orange-400 to-purple-500 px-4 py-2 rounded"
        >
          Connect Wallet
        </button>
      )}
    </nav>
  );
};

export default NavBar;



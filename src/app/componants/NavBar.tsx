import React from 'react';
import Link from 'next/link';

const Navbar = () => (
  <nav className="flex items-center justify-between p-4 bg-black text-white w-full">
    <div className="flex items-center space-x-4">
      <Link href="/"><div className="text-lg font-bold">RUNIVERSE</div></Link>
      <Link href="/leaderboards"><div className="hover:text-gray-300">Leaderboard</div></Link>
      <Link href="/create"><div className="hover:text-gray-300">Create</div></Link>
    </div>
    <button className="bg-gradient-to-r from-orange-400 to-purple-500 px-4 py-2 rounded">
      Connect Wallet
    </button>
  </nav>
);

export default Navbar;


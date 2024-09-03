"use client";

import React from 'react';
import Link from 'next/link';
import { useAccount } from '../context/AccountContext';

const ProfilePage: React.FC = () => {
  const { account } = useAccount();

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl w-full mx-auto p-6 bg-gray-900 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 md:mb-0">Profile:</h2>
          <div className="flex space-x-4">
            <Link href="/holdings">
              <div className="px-4 py-2 bg-gradient-to-r from-orange-400 to-purple-500 text-white rounded-lg shadow hover:from-orange-500 hover:to-purple-600 transition duration-300 cursor-pointer">
                Holdings
              </div>
            </Link>
          </div>
        </div>
        {account ? (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-white">Connected Wallet:</h3>
            <p className="text-gray-400">{account}</p>
          </div>
        ) : (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-white">No Wallet Connected</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

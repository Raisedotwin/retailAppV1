"use client";

import React from 'react';
import Link from 'next/link';
import { useAccount } from '../context/AccountContext';

const SettingsPage: React.FC = () => {
  const { account } = useAccount();

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl w-full mx-auto p-6 bg-gray-900 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-white mb-8">Settings</h2>

        {/* Notification Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Notifications</h3>
          <p className="text-gray-400 mb-4">
            Manage your notifications preferences. At least one is required.
          </p>

          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2">Email</label>
            <div className="flex">
              <input
                type="email"
                placeholder="e.g. yourname@example.com"
                className="bg-gray-700 border border-gray-600 text-white p-3 w-full rounded-l focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-4 py-3 rounded-r shadow-lg hover:from-blue-500 hover:to-purple-600 transition duration-300"
              >
                Verify
              </button>
            </div>
            <p className="text-gray-500 mt-2">Already have a code?</p>
          </div>

          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2">Phone</label>
            <div className="flex">
              <input
                type="tel"
                placeholder="e.g. 123456789"
                className="bg-gray-700 border border-gray-600 text-white p-3 w-full rounded-l focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-4 py-3 rounded-r shadow-lg hover:from-blue-500 hover:to-purple-600 transition duration-300"
              >
                Verify
              </button>
            </div>
            <p className="text-gray-500 mt-2">Already have a code?</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;


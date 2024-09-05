"use client";

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation'; // Use this to access query parameters
import { Avatar } from '@nextui-org/react';
import Image from 'next/image';

const TraderPage: React.FC = () => {
  const searchParams = useSearchParams();
  
  // Extracting the query parameters from the searchParams object
  const name = searchParams.get('name');
  const logo = searchParams.get('logo');
  const username = searchParams.get('username');
  
  // Setting default values or using the query parameters
  const [params] = useState({
    name: name ? name : 'Trader',
    logo: logo ? logo : 'https://via.placeholder.com/150',
    username: username ? username : 'username',
  });

  // State for active tab
  const [activeTab, setActiveTab] = useState('buy');

  // Mock data for stats, you can replace this with actual dynamic data
  const stats = {
    holders: 120,
    buybacks: 50,
    marketCap: "$10,000",
    price: "$1.53",
    winRate: "75%"
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#edf2f7' }}>
      {/* Main Container */}
      <div className="max-w-5xl w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
        
        {/* Profile Section */}
        <div className="flex items-center justify-start mb-8">
          {/* Avatar */}
          <Avatar 
            src={params.logo} // Dynamic avatar
            style={{ width: '95px', height: '95px', paddingTop: "35px" }} // Custom size
          />

          {/* Name and Username */}
          <div className="ml-4 flex flex-col">
            <h2 className="text-2xl font-bold">{params.name}</h2> {/* Dynamic name */}
            <p className="text-gray-500">@{params.username}</p> {/* Dynamic username */}
          </div>

          {/* Twitter Icon Link */}
          <a
            href={`https://twitter.com/${params.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4"
          >
            <Image
              style={{ paddingBottom: "20px" }} // Custom size
              src="/icons/x-logo-2.png" // Path to your Twitter icon
              alt="Twitter Icon"
              width={30}
              height={30}
            />
          </a>
        </div>

        <br />

        {/* Stats Section */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {/* Holders */}
          <div className="text-center">
            <p className="text-xl font-semibold">{stats.holders}</p>
            <p className="text-gray-500">Holders</p>
          </div>

          {/* Buybacks */}
          <div className="text-center">
            <p className="text-xl font-semibold">{stats.buybacks}</p>
            <p className="text-gray-500">Buybacks</p>
          </div>

          {/* Market Cap */}
          <div className="text-center">
            <p className="text-xl font-semibold">{stats.marketCap}</p>
            <p className="text-gray-500">Market Cap</p>
          </div>

          {/* Price */}
          <div className="text-center">
            <p className="text-xl font-semibold">{stats.price}</p>
            <p className="text-gray-500">Price</p>
          </div>

          {/* Win Rate */}
          <div className="text-center">
            <p className="text-xl font-semibold">{stats.winRate}</p>
            <p className="text-gray-500">Win Rate</p>
          </div>
        </div>

        {/* Buy and Sell Section and Price Chart */}
        <div className="grid grid-cols-2 gap-8">
          {/* Buy and Sell Time Section */}
          <div className="p-6 bg-gray-100 rounded-lg shadow">
            {/* Tabs for Buy and Sell */}
            <div className="flex justify-center mb-4">
              <button
                className={`px-8 py-2 ${activeTab === 'buy' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
                onClick={() => setActiveTab('buy')}
              >
                Buy
              </button>
              <button
                className={`ml-4 px-8 py-2 ${activeTab === 'sell' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
                onClick={() => setActiveTab('sell')}
              >
                Sell
              </button>
            </div>

            {/* Buy Form */}
            {activeTab === 'buy' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Buy Time</h3>
                <div className="flex items-center mb-4">
                  <p className="mr-2">Amount (minutes)</p>
                  <button className="px-3 py-1 bg-gray-200">-</button>
                  <input
                    type="number"
                    defaultValue={1}
                    className="mx-2 text-center border w-12"
                  />
                  <button className="px-3 py-1 bg-gray-200">+</button>
                </div>
                <div className="flex justify-between mb-4">
                  <p>Total Cost</p>
                  <p>0.0007 ETH ($1.53)</p>
                </div>
                <button className="w-full py-2 bg-blue-500 text-white rounded-lg">Buy</button>
              </div>
            )}

            {/* Sell Form */}
            {activeTab === 'sell' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Sell Time</h3>
                <div className="flex items-center mb-4">
                  <p className="mr-2">Amount (minutes)</p>
                  <button className="px-3 py-1 bg-gray-200">-</button>
                  <input
                    type="number"
                    defaultValue={1}
                    className="mx-2 text-center border w-12"
                  />
                  <button className="px-3 py-1 bg-gray-200">+</button>
                </div>
                <div className="flex justify-between mb-4">
                  <p>Total Earned</p>
                  <p>0.0007 ETH ($1.53)</p>
                </div>
                <button className="w-full py-2 bg-green-500 text-white rounded-lg">Sell</button>
              </div>
            )}
          </div>

          {/* Price Chart Section */}
          <div className="p-6 bg-gray-100 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Price Chart</h3>
            {/* Placeholder for the price chart */}
            <div className="h-64 bg-white border rounded-lg flex items-center justify-center">
              {/* You can import and render a real chart here */}
              <p>Price Chart Placeholder</p>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-lg mt-8">
          <div className="flex space-x-6 mb-4">
            <button className="text-lg font-semibold">Activity</button>
            <button className="text-lg font-semibold text-gray-500">Top Holders</button>
          </div>
          
          {/* Activity Table (dummy data, replace with dynamic) */}
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Cost</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>@user1</td>
                <td>Purchase</td>
                <td>1 minute</td>
                <td>$1.53</td>
                <td>Just Now</td>
              </tr>
              {/* Repeat rows or fetch actual data */}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default TraderPage;

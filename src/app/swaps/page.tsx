"use client";

import React, { useState } from 'react';
import SwapForm from '../componants/SwapForm';
import FollowSwapsForm from '../componants/FollowSwapsForm';

const SwapsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'followSwaps' | 'swapDirect'>('swapDirect');

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#edf2f7' }}>
      <div className="max-w-4xl w-full mx-auto p-6">
        {/* Center the tab switcher */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            className={`px-6 py-3 rounded-full transition-colors duration-300 ${
              activeTab === 'followSwaps' 
                ? 'bg-purple-600 text-white shadow-lg transform scale-105' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
            onClick={() => setActiveTab('followSwaps')}
          >
            Follow Swaps
          </button>
          <button
            className={`px-6 py-3 rounded-full transition-colors duration-300 ${
              activeTab === 'swapDirect' 
                ? 'bg-purple-600 text-white shadow-lg transform scale-105' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
            onClick={() => setActiveTab('swapDirect')}
          >
            Swap Direct
          </button>
        </div>
        
        {/* Conditionally render the forms based on the active tab */}
        {activeTab === 'followSwaps' && <FollowSwapsForm />}
        {activeTab === 'swapDirect' && <SwapForm />}
      </div>
    </div>
  );
};

export default SwapsPage;


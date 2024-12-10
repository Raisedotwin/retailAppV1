"use client";

import React from "react";

const HowToTrade = () => {
  return (
    <div className="w-full max-w-md">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            How To Trade
          </h2>
          <p className="text-gray-400 text-sm">Learn how to trade perpetuals</p>
        </div>

        {/* Video Container */}
        <div className="relative w-full aspect-video bg-gray-800/50 rounded-xl overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <video 
              controls 
              className="w-full h-full object-cover"
              poster="/api/placeholder/400/320"
            >
              <source src="/path-to-your-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* Exchange Link Button */}
        <button 
          onClick={() => window.open('https://example-exchange.com', '_blank')}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg text-white font-medium transition-all duration-200 shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2"
        >
          <svg 
            className="w-5 h-5" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 3h6v6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Go to Exchange</span>
        </button>

      </div>
    </div>
  );
};

export default HowToTrade;
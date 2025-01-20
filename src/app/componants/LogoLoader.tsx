import React from 'react';
import Image from 'next/image';

const LogoLoader = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 text-center space-y-6">
        {/* Logo container with glow effect */}
        <div className="relative group inline-block">
          {/* Animated gradient background */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur opacity-75 animate-pulse"></div>
          
          {/* Spinning border */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-spin" 
               style={{ clipPath: 'inset(0 0 95% 0)' }}>
          </div>
          
          {/* Logo image */}
          <div className="relative transform transition-all duration-300 animate-bounce"
               style={{ animationDuration: '2s' }}>
            <Image 
              src="/icons/logo.png" 
              alt="Loading..." 
              width={100} 
              height={100}
              className="rounded-full bg-white p-2"
            />
          </div>
        </div>
        
        {/* Loading heading */}
        <h2 className="text-2xl font-bold text-gray-800">Loading Traders</h2>
        
        {/* Loading text */}
        <p className="text-gray-600">
          Please wait while we fetch the latest trader data...
        </p>
        
        {/* Loading indicator */}
        <div className="flex justify-center">
          <div className="h-1 w-32 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default LogoLoader;
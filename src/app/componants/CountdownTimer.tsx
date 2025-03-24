// componants/CountdownTimer.tsx

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  expiryTimestamp: number | string; // UNIX timestamp in seconds
  onExpire?: () => void;
  showProgressBar?: boolean;
  totalDuration?: number; // Total duration in seconds, for progress calculation
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  expiryTimestamp, 
  onExpire, 
  showProgressBar = true,
  totalDuration
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('Calculating...');
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [percentRemaining, setPercentRemaining] = useState<number>(100);

  useEffect(() => {
    // Convert to number and ensure it's in seconds
    const timestampSec = typeof expiryTimestamp === 'string' 
      ? Number(expiryTimestamp) 
      : Number(expiryTimestamp);
    
    // Invalid timestamp
    if (isNaN(timestampSec) || timestampSec <= 0) {
      setTimeRemaining('N/A');
      return;
    }

    // Determine total duration if not provided
    let calculatedTotalDuration = totalDuration;
    if (!calculatedTotalDuration) {
      // Default to 30 days if not specified
      calculatedTotalDuration = 30 * 24 * 60 * 60; // 30 days in seconds
    }

    const calculateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      
      // If expired
      if (timestampSec <= now) { 
        setTimeRemaining('Expired');
        setIsExpired(true);
        setPercentRemaining(0);
        if (onExpire) onExpire();
        return;
      }
      
      // Calculate remaining time
      const remainingSeconds = timestampSec - now;
      
      // Calculate percentage for progress bar
      const percentLeft = Math.min(100, Math.max(0, 
        (remainingSeconds / calculatedTotalDuration) * 100
      ));
      setPercentRemaining(percentLeft);
      
      // Format the display
      const seconds = remainingSeconds;
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      // Format the remaining time
      if (days > 0) {
        setTimeRemaining(`${days}d ${hours % 24}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes % 60}m`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds % 60}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    // Initial calculation
    calculateTimeRemaining();
    
    // Update every second
    const intervalId = setInterval(calculateTimeRemaining, 1000);
    
    // Cleanup
    return () => clearInterval(intervalId);
  }, [expiryTimestamp, onExpire, totalDuration]);

  // Determine color based on time remaining
  const getColorClass = () => {
    if (isExpired) return 'text-red-600';
    if (percentRemaining < 20) return 'text-orange-600';
    if (percentRemaining < 50) return 'text-yellow-600';
    return 'text-violet-700';
  };

  const getProgressBarColor = () => {
    if (isExpired) return 'bg-red-500';
    if (percentRemaining < 20) return 'bg-orange-500';
    if (percentRemaining < 50) return 'bg-yellow-500';
    return 'bg-violet-500';
  };

  return (
    <div className="flex flex-col">
      <span className={`font-bold ${getColorClass()}`}>
        {timeRemaining}
      </span>
      
      {showProgressBar && !isNaN(percentRemaining) && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
          <div 
            className={`h-full ${getProgressBarColor()} transition-all duration-1000 ease-in-out`}
            style={{ width: `${percentRemaining}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default CountdownTimer;
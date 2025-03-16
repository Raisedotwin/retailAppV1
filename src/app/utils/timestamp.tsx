// utils/timestamp.js

// Existing formatBlockTimestamp function
export const formatBlockTimestamp = (timestamp: any) => {
  // Handle invalid or empty timestamps
  if (!timestamp || timestamp === '0') return 'N/A';
  
  const timestampNum = Number(timestamp) * 1000; // Convert to milliseconds
  
  // Check if valid future date
  if (isNaN(timestampNum) || timestampNum <= 0) return 'N/A';
  
  // Get current time
  const now = Date.now();
  
  // If the expiry is in the past
  if (timestampNum < now) {
    return 'Expired';
  }
  
  // Calculate remaining time
  const remainingMs = timestampNum - now;
  
  // Convert to appropriate time unit
  const seconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  // Format the remaining time
  if (days > 0) {
    return `${days}d ${hours % 24}h remaining`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m remaining`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s remaining`;
  } else {
    return `${seconds}s remaining`;
  }
};

/**
 * Calculate the total duration of a curve in seconds
 * @param {string|number} initializationTimestamp - The timestamp when the curve was initialized (in seconds)
 * @param {string|number} expiryTimestamp - The timestamp when the curve will expire (in seconds)
 * @returns {number} - Total duration in seconds
 */
export const calculateCurveDuration = (initializationTimestamp: any, expiryTimestamp: any) => {
  // Convert to numbers
  const initTime = Number(initializationTimestamp);
  const expTime = Number(expiryTimestamp);
  
  // Validate inputs
  if (isNaN(initTime) || isNaN(expTime) || initTime <= 0 || expTime <= 0) {
    // Default to 30 days if we can't calculate
    return 30 * 24 * 60 * 60; 
  }
  
  // Calculate the duration
  const durationSeconds = expTime - initTime;
  
  // If negative or zero, return default
  if (durationSeconds <= 0) {
    return 30 * 24 * 60 * 60;
  }
  
  return durationSeconds;
};

/**
 * Format duration in a human-readable way
 * @param {number} durationSeconds - Duration in seconds
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (durationSeconds: any) => {
  if (isNaN(durationSeconds) || durationSeconds <= 0) {
    return 'N/A';
  }
  
  const days = Math.floor(durationSeconds / (24 * 60 * 60));
  const hours = Math.floor((durationSeconds % (24 * 60 * 60)) / (60 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else {
    const minutes = Math.floor((durationSeconds % (60 * 60)) / 60);
    return `${hours}h ${minutes}m`;
  }
};


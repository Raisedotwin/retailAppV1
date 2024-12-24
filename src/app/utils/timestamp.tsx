export const formatBlockTimestamp = (timestamp: string | number): string => {
    // Convert string to number if it's not already
    const timestampNum = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    
    // Create a new Date object (multiply by 1000 if timestamp is in seconds)
    const date = new Date(timestampNum * 1000);
    
    // Calculate time difference
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    // Return relative time
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    // If older than 30 days, return the date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };
  
  // Optional: Format as full date and time
  export const formatFullTimestamp = (timestamp: string | number): string => {
    const timestampNum = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    const date = new Date(timestampNum * 1000);
    
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
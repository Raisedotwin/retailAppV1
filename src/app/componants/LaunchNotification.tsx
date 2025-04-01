// Launch Notification Component
// Add this to your Chat.tsx component
import React from 'react';

interface LaunchNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  launchLink: string;
  launchName: string;
}

const LaunchNotification: React.FC<LaunchNotificationProps> = ({ 
  isOpen, 
  onClose, 
  launchLink,
  launchName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50">
      <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-purple-500/30 max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-500/20 rounded-full p-4 border border-green-500/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-center text-white mb-4">Pop Up Store Created!</h3>
        
        <p className="text-gray-300 text-center mb-6">
          Congratulations! Your <span className="text-purple-400 font-medium">{launchName}</span> store has been created successfully.
        </p>
        
        <div className="bg-gray-800/70 rounded-xl p-4 mb-6 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">Store page:</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(launchLink);
                alert("Link copied to clipboard!");
              }}
              className="p-1.5 bg-gray-700 rounded-lg hover:bg-gray-600 transition duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
          </div>
          <p className="text-purple-300 font-mono text-sm break-all mt-2">
            {launchLink}
          </p>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => {
              window.open(launchLink, '_blank');
            }}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition duration-200"
          >
            Visit Store Page
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LaunchNotification;
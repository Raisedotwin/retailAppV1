// LoyaltyTokensModal.tsx
import React from 'react';

interface LoyaltyTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenAmount: string;
  tokenName: any;
}

const LoyaltyTokensModal: React.FC<LoyaltyTokensModalProps> = ({ isOpen, onClose, tokenAmount, tokenName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full border border-gray-200 transform transition-all animate-fadeIn">
        <div className="flex flex-col items-center mb-4">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full p-5 mb-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1 text-center">Loyalty Reward Earned!</h3>
          <p className="text-gray-600 text-center mb-1">You've successfully redeemed your item</p>
          <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full my-2"></div>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-lg mb-6 border border-indigo-100 shadow-inner">
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-1">
              {tokenAmount}
            </div>
            <p className="text-sm font-medium text-indigo-500">
              {tokenName} Loyalty Tokens
            </p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
          <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
            Benefits of Loyalty Tokens:
          </h4>
          <ul className="text-sm text-blue-700 space-y-1 pl-6 list-disc">
            <li>Exclusive access to limited edition items</li>
            <li>Discounts on future purchases</li>
            <li>Priority shipping and customer support</li>
            <li>Special community events and experiences</li>
          </ul>
        </div>
  
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg
                    hover:from-indigo-600 hover:to-purple-700 transition-all font-medium shadow-md transform hover:scale-105"
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyTokensModal;
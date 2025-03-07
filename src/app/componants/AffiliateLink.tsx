import React, { useState } from 'react';
import { Tooltip } from '@nextui-org/react';

// You can modify your AffiliateLink component to display affiliate status:

interface AffiliateLinkProps {
  pageLink: string;
  walletAddress: string;
  isAffiliate?: boolean;
  affiliateAddress?: string | null;
}

const AffiliateLink: React.FC<AffiliateLinkProps> = ({ 
  pageLink, 
  walletAddress,
  isAffiliate = false,
  affiliateAddress = null
}) => {
  // Create the affiliate link by appending the user's wallet address
  const affiliateLink = `${pageLink}${pageLink.includes('?') ? '&' : '?'}ref=${walletAddress}`;
  
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* If this page was accessed via an affiliate link, show this notification */}
      {isAffiliate && affiliateAddress && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Affiliate Link Active
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>You're viewing this page through an affiliate link from:</p>
                <p className="mt-1 font-mono text-xs break-all">{affiliateAddress}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold text-gray-800">Your Affiliate Link</h2>
      <p className="text-gray-600">
        Share this link to earn rewards when others make purchases through it.
      </p>
      
      <div className="relative">
        <input
          type="text"
          value={affiliateLink}
          readOnly
          className="w-full p-4 pr-24 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm"
        />
        <button
          onClick={handleCopy}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-700 mb-2">How it works</h3>
        <ul className="list-disc pl-5 text-gray-600 space-y-1">
          <li>Share your unique affiliate link with friends or on social media</li>
          <li>When someone uses your link to make a purchase, you earn a commission</li>
          <li>Commissions are automatically sent to your wallet address</li>
        </ul>
      </div>
    </div>
  );
};

export default AffiliateLink;
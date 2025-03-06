import React, { useState } from 'react';
import { Tooltip } from '@nextui-org/react';

interface AffiliateLinkProps {
  pageLink: string;
  walletAddress: string;
}

const AffiliateLink: React.FC<AffiliateLinkProps> = ({ pageLink, walletAddress }) => {
  const [copied, setCopied] = useState(false);
  
  // Generate the affiliate link by appending the user's wallet address
  const affiliateLink = `${pageLink}&ref=${walletAddress}`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(affiliateLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };
  
  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Your Affiliate Link</h3>
      <p className="text-sm text-gray-600 mb-6">
        Share this link to earn a commission when others trade through your referral.
      </p>
      
      <div className="relative">
        <div className="flex items-center">
          <input
            type="text"
            readOnly
            value={affiliateLink}
            className="w-full p-3 pr-24 bg-white border-2 border-indigo-200 rounded-lg text-sm font-mono overflow-x-auto"
          />
          <Tooltip
            content={copied ? "Copied!" : "Copy to clipboard"}
            placement="top"
            color={copied ? "success" : "primary"}
          >
            <button
              onClick={copyToClipboard}
              className={`absolute right-2 px-4 py-1.5 rounded-md transition-colors ${
                copied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </Tooltip>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-white rounded-lg border border-indigo-100">
        <h4 className="text-md font-semibold text-gray-700 mb-2">Affiliate Program Benefits</h4>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            <span>Earn 5% commission on all trades made through your link</span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            <span>Get paid automatically in ETH to your connected wallet</span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            <span>Track your referral performance in the dashboard</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AffiliateLink;
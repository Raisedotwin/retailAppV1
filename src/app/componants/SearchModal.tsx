import React, { useState, useRef, useEffect } from 'react';
import TraderCard from './TraderCard';
import Image from 'next/image';
import { ethers } from 'ethers';
import { usePrivy, useWallets } from '@privy-io/react-auth';

interface User {
  id: string;
  name: string;
  username: string;
  profile_image_url: string;
  description: string;
}

interface SearchModalProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const SearchModal: React.FC<SearchModalProps> = ({ visible, setVisible }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { wallets } = useWallets();
  const { user } = usePrivy();

  // Contract initialization
  const profileAddr = '0x0106381DaDbcc6b862B4cecdD253fD0E3626738E';
  const profileABI = [
    "function getProfileByName(string memory name) external view returns (address, uint256, string memory, string memory, string memory, address, address, uint256, address)"
  ];

  const categories = [
    { name: 'Trending', icon: '🔥' },
    { name: 'Perps', icon: '📈' },
    { name: 'Marketcap', icon: '💹' },
    { name: 'NFT', icon: '🎨' },
    { name: 'Swaps', icon: '🔄' }
  ];

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);
  };

  const fetchProfile = async () => {
    const cleanedSearchTerm = searchTerm.replace(/^@/, '').trim();
    if (!cleanedSearchTerm) return;
    
    setIsLoading(true);
    try {
      // Get the first wallet (privy wallet)
      const wallet = wallets[0];
      if (!wallet) throw new Error('No wallet connected');

      // Initialize provider and contract
      const provider = await wallet.getEthersProvider();
      const signer: any = await provider.getSigner();
      const profileContract = new ethers.Contract(profileAddr, profileABI, signer);

      try {
        // First try to fetch from smart contract
        const profile = await profileContract.getProfileByName(cleanedSearchTerm);
        
        // If we get here, the profile exists in the contract
        const [userAddress, accountNumber, name, bio, avatarUrl, pool, payouts, createdAt, positions] = profile;
        
        // Format the data to match our User interface
        setResults([{
          id: userAddress,
          name: bio, // bio field contains the display name
          username: name, // name field contains the username
          profile_image_url: avatarUrl,
          description: `Account #${accountNumber.toString()}`
        }]);
      } catch (contractError) {
        // If profile doesn't exist in contract, fallback to Twitter API
        console.log('Profile not found in contract, trying Twitter API');
        const response = await fetch(`/api/twitter/user/${cleanedSearchTerm}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const user: { data: User } = await response.json();
        setResults([user.data]);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setVisible(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setVisible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div
        ref={modalRef}
        className="bg-gradient-to-b from-white to-gray-50 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all"
      >
        {/* Search Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search by username (e.g., @username)"
              className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-transparent rounded-xl focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              value={searchTerm}
              onChange={e => handleSearchTermChange(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && fetchProfile()}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2 px-1">
            <span className="inline-block mr-1">💡</span>
            Enter a username to search both on-chain profiles and Twitter
          </p>
          <p className="text-sm text-gray-500 mt-2 px-1">
            <span className="inline-block mr-1">⚠️</span>
            Searches may be rate limited by  Twitter API
          </p>
        </div>

        {/* Results Area */}
        <div className="max-h-[70vh] overflow-y-auto">
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-3 px-2">Search Results</h3>
              {results.map((result, index) => (
                result?.name && result?.username && result?.id ? (
                  <TraderCard
                    key={index}
                    name={result.name}
                    username={result.username}
                    logo={result.profile_image_url || `https://unavatar.io/twitter/${result.username}`}
                    url={`https://twitter.com/${result.username}`}
                  />
                ) : (
                  <div key={index} className="text-red-500 p-4 text-center bg-red-50 rounded-lg">
                    User data is incomplete
                  </div>
                )
              ))}
            </div>
          )}

          {!isLoading && searchTerm && results.length === 0 && (
            <div className="text-gray-500 text-center py-8">
              No results found for "{searchTerm}"
            </div>
          )}

          {/* Categories Section */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-4 px-2">
              Popular Categories
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-4 rounded-xl bg-white border border-gray-100 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all duration-200"
                >
                  <span className="text-xl">{category.icon}</span>
                  <span className="font-medium text-gray-700">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
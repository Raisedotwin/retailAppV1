import React, { useState, useRef, useEffect } from 'react';
import TraderCard from './TraderCard'; // Import the TraderCard component
import Image from 'next/image'; // For the search icon

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

const SearchModal: React.FC<SearchModalProps> = ({ visible, setVisible }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<User[]>([]); // Type as User array

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/user/${searchTerm}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const user: { data: User } = await response.json();
      setResults([user.data]); // Assuming the API returns a single user, update it as needed
    } catch (error) {
      console.error('Error fetching profile:', error);
      setResults([]);
    }
  };

  const handleSearch = () => {
    fetchProfile();
  };

  // Handle clicks outside the modal to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setVisible(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setVisible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg relative"
      >
        {/* Search Bar with Icon */}
        <div className="flex items-center mb-6 border border-gray-300 rounded-md p-2">
          <input
            type="text"
            placeholder="Search Twitter profile..."
            className="w-full p-2 focus:outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button
            onClick={handleSearch}
            className="ml-2 bg-transparent hover:bg-gray-200 rounded-full p-1"
          >
            <Image
              src="/icons/search-icon.svg"
              alt="Search"
              width={20}
              height={20}
            />
          </button>
        </div>

        {/* Search Results */}
        {results.length > 0 && (
        <div>
          {results.map((result, index) => (
            result?.name && result?.username && result?.id ? ( // Checking if user and necessary fields exist
            <TraderCard
              key={index}
              name={result.name}
              username={result.username}
              logo={`https://unavatar.io/twitter/${result.username}`} // Assuming you are getting a URL for profile image
              url={`https://twitter.com/${result.username}`}
            />
          ) : (
            <div className="text-red-500">
              User data is incomplete
            </div>
          )
          ))}
        </div>
      )}
      
        {results.length === 0 && <div>No results found</div>}

        {/* Default Content */}
        <div>
          <div className="mb-4 text-sm text-gray-500">Creators</div>
          <div className="text-gray-700 hover:bg-gray-100 cursor-pointer p-3 rounded-md">
            Inbox
          </div>
          <div className="text-gray-700 hover:bg-gray-100 cursor-pointer p-3 rounded-md">
            Meetings
          </div>
          <div className="text-gray-700 hover:bg-gray-100 cursor-pointer p-3 rounded-md">
            Portfolio
          </div>
          <div className="text-gray-700 hover:bg-gray-100 cursor-pointer p-3 rounded-md">
            Profile
          </div>
          <div className="text-gray-700 hover:bg-gray-100 cursor-pointer p-3 rounded-md">
            Settings
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;


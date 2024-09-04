import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image'; // For future use of images in the search results

interface User {
  id: string;
  name: string;
  profile_image_url: string;
  description: string;
}

interface SearchModalProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchModal: React.FC<SearchModalProps> = ({ visible, setVisible }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState<User | null>(null); // Updated type
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<User[]>([]); // Type as User array

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/user/${searchTerm}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const user: { data: User } = await response.json(); // Add a type here for the user
      setResults([user.data]);
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
            placeholder="Type a command or search..."
            className="w-full p-2 focus:outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button
            onClick={handleSearch}
            className="ml-2 bg-transparent hover:bg-gray-200 rounded-full p-1"
          >
            <Image
              src="/icons/search-icon.svg" // Use the search icon you uploaded
              alt="Search"
              width={20}
              height={20}
            />
          </button>
        </div>

        {/* Search Results */}
        {results.length > 0 && results.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4 bg-gray-700 text-white rounded-md shadow-md mb-4">
            {/* Image Placeholder */}
            <div className="flex items-center">
              <div className="rounded-full bg-gray-700 w-10 h-10 mr-4 overflow-hidden">
                <Image
                  src={user.profile_image_url || "/icons/user-placeholder.png"} // Placeholder for user image
                  alt={user.name}
                  width={40}
                  height={40}
                />
              </div>
              {/* Search Text */}
              <div>
                <div className="font-bold">{user.name}</div>
                <div className="text-gray-400">{user.description}</div>
              </div>
            </div>
            {/* Right Arrow for Navigation */}
            <div className="text-gray-400 hover:text-white cursor-pointer">
              &rarr;
            </div>
          </div>
        ))}

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


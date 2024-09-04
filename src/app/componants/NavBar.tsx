import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAccount } from '../context/AccountContext';
import { usePrivy } from '@privy-io/react-auth';
import SearchModal from './SearchModal';  // Import the SearchModal

const NavBar: React.FC = () => {
  const { account } = useAccount();
  const { login, logout, user } = usePrivy();

  const [search, setSearch] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null); // Ref to track clicks outside the modal
  const inputRef = useRef<HTMLInputElement>(null); // Ref for the search input

  const loginWithPrivy = async () => {
    try {
      await login();
      console.log('Logged in with Privy:', user);
    } catch (error) {
      console.error('Error logging in with Privy:', error);
    }
  };

  const logoutWithPrivy = async () => {
    try {
      await logout();
      console.log('Logged out with Privy');
    } catch (error) {
      console.error('Error logging out with Privy:', error);
    }
  };

  // Show the modal when the search input is clicked
  const handleInputClick = () => {
    setIsModalVisible(true);
  };

  // Close the modal if a user clicks outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current && 
        !modalRef.current.contains(event.target as Node) && 
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsModalVisible(false);
      }
    }

    // Attach the event listener for detecting outside clicks
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // Cleanup the event listener
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalRef, inputRef]);

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md w-full">
      <div className="flex items-center space-x-8">
        {/* Logo */}
        <Link href="/">
          <div className="text-xl font-bold text-gray-800 cursor-pointer flex items-center">
            <Image 
              src="/icons/logo.png"  // Path to the logo in the public/icons/ directory
              alt="Logo" 
              width={32} 
              height={32} 
              className="mr-2"
            />
            raise.win
          </div>
        </Link>

        {/* Conditionally render tabs based on user authentication */}
        {user && (
          <>
            <Link href="/profile">
              <div className="text-gray-600 hover:text-gray-900 cursor-pointer">Portfolio</div>
            </Link>
            <Link href="/swaps">
              <div className="text-gray-600 hover:text-gray-900 cursor-pointer">Swap</div>
            </Link>
            <div className="flex items-center space-x-2">
              <Link href="/perps">
                <div className="text-gray-600 hover:text-gray-900 cursor-pointer">Perps</div>
              </Link>
              <span className="text-xs text-white bg-blue-500 px-2 py-0.5 rounded-full">
                Soon
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/chat">
                <div className="text-gray-600 hover:text-gray-900 cursor-pointer">Chat</div>
              </Link>
              <span className="text-xs text-white bg-blue-500 px-2 py-0.5 rounded-full">
                Soon
              </span>
            </div>
          </>
        )}
      </div>

      {/* Search Bar and Wallet/Login */}
      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="relative flex items-center border border-gray-300 rounded-md">
          <Image
            src="/icons/search-icon.svg" // Path to the search icon SVG
            alt="Search"
            width={20}
            height={20}
            className="absolute left-3 text-gray-500"
          />
          <input
            ref={inputRef} // Attach ref to search input
            type="text"
            value={search}
            onClick={handleInputClick}  // Show the modal when the input is clicked
            //onChange={(e) => setSearch(e.target.value)}  // Keep the search input working
            placeholder="Search..."
            className="pl-10 pr-8 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
          />
          <span className="absolute right-3 bg-gray-100 text-gray-500 text-xs rounded-md p-1">
            ⌘K
          </span>
        </div>

        {/* Display the SearchModal */}
        {isModalVisible && (
          <div ref={modalRef}> {/* Attach ref to the modal */}
            <SearchModal visible={isModalVisible} setVisible={setIsModalVisible} />
          </div>
        )}

        {user && (
          <>
            <Link href="/settings">
              <Image 
                src="/icons/settings-icon.svg"  // Path to the wallet icon SVG in the public/icons/ directory
                alt="Settings Icon" 
                width={32} 
                height={32} 
                className="cursor-pointer"
              />
            </Link>
            <Link href="/wallet">
              <Image 
                src="/icons/wallet-icons.svg"  // Path to the wallet icon SVG in the public/icons/ directory
                alt="Wallet Icon" 
                width={30} 
                height={30} 
                className="cursor-pointer"
              />
            </Link>
          </>
        )}

        {/* Login/Logout Button */}
        {user ? (
          <button
            onClick={logoutWithPrivy}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={loginWithPrivy}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;


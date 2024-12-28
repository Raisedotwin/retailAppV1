import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAccount } from '../context/AccountContext';
import { usePrivy } from '@privy-io/react-auth';
import SearchModal from './SearchModal';

const NavBar: React.FC = () => {
  const { account } = useAccount();
  const { login, logout, user } = usePrivy();
  
  const [search, setSearch] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false); // State for dropdown visibility
  const modalRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleInputClick = () => {
    setIsModalVisible(true);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md w-full">
      <div className="flex items-center space-x-8">
                {/* Logo with Beta tag */}
          <Link href="/">
          <div className="text-xl font-bold text-gray-800 cursor-pointer flex items-center">
            <Image
              src="/icons/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="mr-2"
            />
            raise.win
            <span className="ml-2 text-xs font-medium text-blue-700 bg-blue-200 px-2 py-0.5 rounded-full">Beta</span>
          </div>
        </Link>

        {/* Conditionally render tabs based on user authentication */}
        {user && (
          <>
            <Link href="/profile">
              <div className="text-gray-600 hover:text-gray-900 cursor-pointer">Profile</div>
            </Link>
            <div className="flex items-center space-x-2">
              <Link href="/holdings">
                <div className="text-gray-600 hover:text-gray-900 cursor-pointer">Leaderboard</div>
              </Link>
            </div>
            <Link href="/swaps">
              <div className="text-gray-600 hover:text-gray-900 cursor-pointer">Swap</div>
            </Link>
            <div className="flex items-center space-x-2">
              <Link href="/perps">
                <div className="text-gray-600 hover:text-gray-900 cursor-pointer">Perps</div>
              </Link>
            </div>
    
            <div className="flex items-center space-x-2">
              <Link href="/chat">
                <div className="text-gray-600 hover:text-gray-900 cursor-pointer">NFT</div>
              </Link>
              <span className="text-xs text-white bg-blue-500 px-2 py-0.5 rounded-full">Soon</span>
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
            ref={inputRef}
            type="text"
            value={search}
            onClick={handleInputClick}
            placeholder="Search..."
            className="pl-10 pr-8 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
          />
          <span className="absolute right-3 bg-gray-100 text-gray-500 text-xs rounded-md p-1">⌘K</span>
        </div>

        {/* Display the SearchModal */}
        {isModalVisible && (
          <div ref={modalRef}>
            <SearchModal visible={isModalVisible} setVisible={setIsModalVisible} />
          </div>
        )}

        {user && (
          <>
            {/* Wallet Icon */}
            <Link href="/wallet">
              <Image
                src="/icons/wallet-icons.svg"  // Path to the wallet icon
                alt="Wallet Icon"
                width={30}
                height={30}
                className="cursor-pointer"
              />
            </Link>

            {/* Settings Icon with Dropdown */}
            <div className="relative">
              <Image
                src="/icons/accounts-icon.svg"  // Path to the settings icon
                alt="Settings Icon"
                width={32}
                height={32}
                className="cursor-pointer"
                onClick={() => setDropdownVisible(!dropdownVisible)} // Toggle dropdown visibility
              />

              {dropdownVisible && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10"
                >
                  <Link href="/settings">
                    <div className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Settings</div>
                  </Link>
                  <Link href="/affiliate">
                    <div className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Affiliate</div>
                  </Link>
                </div>
              )}
            </div>
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

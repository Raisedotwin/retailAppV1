import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAccount } from '../context/AccountContext';
import { usePrivy } from '@privy-io/react-auth';

const NavBar: React.FC = () => {
  const { account } = useAccount();
  const { login, logout, user } = usePrivy();

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
        <input
          type="text"
          placeholder="Search..."
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
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
                width={32} 
                height={32} 
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

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAccount } from '../context/AccountContext';
import { getEmbeddedConnectedWallet, usePrivy, useWallets } from '@privy-io/react-auth';
import SearchModal from './SearchModal';
import { ethers } from 'ethers';
import { EIP155_CHAINS } from '@/data/EIP155Data';

const NavBar: React.FC = () => {
  const { account } = useAccount();
  const { login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  
  const [search, setSearch] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isWhitelistEnabled, setIsWhitelistEnabled] = useState(false);
  const [showWhitelistModal, setShowWhitelistModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get provider and contract setup
  const rpcURL = EIP155_CHAINS["eip155:8453"].rpc;
  const provider = useMemo(() => new ethers.JsonRpcProvider(rpcURL), [rpcURL]);
  
  const whitelistAddr = '0x8eF8153635a09CC4C25BC1397E63cCdCA329E315';
  const whitelist = require("../abi/BETAWhitelist.json");
  const whitelistContract = useMemo(
    () => new ethers.Contract(whitelistAddr, whitelist, provider),
    [provider]
  );

  const checkWhitelistStatus = async (address: string): Promise<boolean> => {
    try {
      const isWhitelisted = await whitelistContract.isWhitelisted(address);
      return isWhitelisted;
    } catch (error) {
      console.error('Error checking whitelist status:', error);
      return false;
    }
  };

  const checkUsernameWhitelist = async (username: string): Promise<boolean> => {
    try {
      const isWhitelisted = await whitelistContract.isUsernameWhitelisted(username);
      return isWhitelisted;
    } catch (error) {
      console.error('Error checking username whitelist status:', error);
      return false;
    }
  };

  const loginWithPrivy = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Error logging in with Privy:', error);
    }
  };

  // Separate useEffect to handle whitelist checking after login
  useEffect(() => {
    const checkWhitelist = async () => {
      if (!user || !isWhitelistEnabled) return;

      try {
        let isWhitelisted = false;
        
        // First check Twitter username if available
        if (user.twitter?.username) {
          isWhitelisted = await checkUsernameWhitelist(user.twitter.username);
        }

        // If not whitelisted by username, check embedded wallet
        if (!isWhitelisted && wallets.length > 0) {
          const embeddedWallet = user?.wallet?.address;
          if (embeddedWallet) {
            isWhitelisted = await checkWhitelistStatus(embeddedWallet);
          }
        }

        // If not whitelisted at all, show modal and logout
        if (!isWhitelisted) {
          setShowWhitelistModal(true);
          await logout();
        }
      } catch (error) {
        console.error('Error checking whitelist status:', error);
      }
    };

    checkWhitelist();
  }, [user, wallets, isWhitelistEnabled]);

  const logoutWithPrivy = async () => {
    try {
      await logout();
      setShowWhitelistModal(false); // Clear modal when logging out
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
    <>
      <nav className="flex items-center justify-between p-4 bg-white shadow-md w-full">
        <div className="flex items-center space-x-8">
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
              <span className="ml-2 text-xs font-medium text-yellow-200 bg-gray-800 px-2 py-0.5 rounded-full">Beta</span>
            </div>
          </Link>

          {user && (
            <>
              <Link href="/profile">
                <div className="text-gray-600 hover:text-gray-900 cursor-pointer">Profile</div>
              </Link>
              <div className="flex items-center space-x-2">
                <Link href="/holdings">
                  <div className="text-gray-600 hover:text-gray-900 cursor-pointer">Creators</div>
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

        <div className="flex items-center space-x-4">
          <div className="relative flex items-center border border-gray-300 rounded-md">
            <Image
              src="/icons/search-icon.svg"
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

          {isModalVisible && (
            <div ref={modalRef}>
              <SearchModal visible={isModalVisible} setVisible={setIsModalVisible} />
            </div>
          )}

          {user && (
            <>
              <Link href="/wallet">
                <Image
                  src="/icons/wallet-icons.svg"
                  alt="Wallet Icon"
                  width={30}
                  height={30}
                  className="cursor-pointer"
                />
              </Link>
            </>
          )}

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
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Whitelist Modal */}
      {showWhitelistModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl shadow-2xl border border-white/10 flex flex-col items-center max-w-md w-full mx-4">
            <div className="bg-white/10 p-4 rounded-full mb-6">
              <Image src="/icons/waitlogo.png" alt="Not Whitelisted" width={80} height={80} className="rounded-full" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Access Denied</h3>
            <p className="text-gray-300 text-center mb-6">
              {user?.twitter?.username 
                ? "Your Twitter account is not whitelisted. Please contact support."
                : "Your wallet address is not whitelisted. Please contact support."}
            </p>
            <button
              onClick={() => setShowWhitelistModal(false)}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
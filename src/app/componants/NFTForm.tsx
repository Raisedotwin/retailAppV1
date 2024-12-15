import React, { useState, useMemo } from 'react';
import { useAccount } from '../context/AccountContext';
import { getEmbeddedConnectedWallet, usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import Image from 'next/image';
import { EIP155_CHAINS } from '@/data/EIP155Data';

interface NFTFormProps {
  balance: string;
  profile: any;
}

const NFTForm: React.FC<NFTFormProps> = ({ balance, profile }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [activeTab, setActiveTab] = useState('buy');
  const [nftAddress, setNftAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [amount, setAmount] = useState('');
  const [nftDetails, setNftDetails] = useState<any>(null);

  const { user } = usePrivy();
  const { wallets } = useWallets();
  const wallet = getEmbeddedConnectedWallet(wallets);
  const nativeAddress = user?.wallet?.address;

  // Constants for contract addresses
  const baseRpcURL = EIP155_CHAINS["eip155:8453"].rpc;
  const provider = useMemo(() => new ethers.JsonRpcProvider(baseRpcURL), [baseRpcURL]);
  const wethAddress = "0x4200000000000000000000000000000000000006";

  const handleNFTLookup = async () => {
    if (!nftAddress || !tokenId) {
      alert('Please enter both NFT address and token ID');
      return;
    }
    
    setModalMessage('Loading NFT details...');
    setIsModalVisible(true);
    
    try {
      // Here you would integrate with OpenSea API to fetch NFT details
      // This is a placeholder for the actual implementation
      const mockNFTDetails = {
        name: 'Sample NFT',
        collection: 'Sample Collection',
        price: '1.5 ETH',
        image: '/placeholder-nft.png'
      };
      
      setNftDetails(mockNFTDetails);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error fetching NFT details:', error);
      setModalMessage('Failed to fetch NFT details');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsModalVisible(false);
    }
  };

  const handleTransaction = async () => {
    if (!nftAddress || !tokenId) {
      alert('Please enter NFT details');
      return;
    }

    setModalMessage(`${activeTab === 'buy' ? 'Buying' : 'Selling'} NFT...`);
    setIsModalVisible(true);

    try {
      // Here you would integrate with Seaport for the actual transaction
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
      setModalMessage('Transaction successful!');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsModalVisible(false);
    } catch (error) {
      console.error('Transaction failed:', error);
      setModalMessage('Transaction failed');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsModalVisible(false);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#edf2f7' }}>
      <div className="max-w-lg mx-auto">
        <div className="bg-black rounded-2xl shadow-xl p-6">
          {/* Header with Balance */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 text-center mb-2">
              NFT Trading
            </h2>
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Available Balance</p>
              <p className="text-2xl font-bold text-white">{balance} WETH</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-2 gap-2 bg-gray-800/30 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('buy')}
              className={`py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'buy' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Buy NFT
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'sell' 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sell NFT
            </button>
          </div>

          {/* NFT Form */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white">NFT Contract Address</span>
              </div>
              <input
                type="text"
                value={nftAddress}
                onChange={(e) => setNftAddress(e.target.value)}
                placeholder="Enter NFT contract address"
                className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white">Token ID</span>
              </div>
              <input
                type="text"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="Enter token ID"
                className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {nftDetails && (
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h3 className="text-white font-medium mb-2">NFT Details</h3>
                <div className="space-y-2">
                  <p className="text-gray-300">Name: {nftDetails.name}</p>
                  <p className="text-gray-300">Collection: {nftDetails.collection}</p>
                  <p className="text-gray-300">Price: {nftDetails.price}</p>
                </div>
              </div>
            )}

            {activeTab === 'buy' && (
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white">Offer Amount (WETH)</span>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount in WETH"
                  className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleNFTLookup}
                className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-200"
              >
                Look Up NFT
              </button>
              
              <button
                onClick={handleTransaction}
                className={`flex-1 py-4 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === 'buy'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                } text-white`}
              >
                {activeTab === 'buy' ? 'Buy NFT' : 'Sell NFT'}
              </button>
            </div>

            <p className="text-gray-400 text-sm text-center">
              {activeTab === 'buy' 
                ? 'NFTs will be purchased using WETH from your balance' 
                : 'NFTs will be sold for WETH'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Processing Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 flex flex-col items-center">
            <Image src="/icons/waitlogo.png" alt="Processing" width={120} height={120} />
            <p className="mt-4 text-gray-700 font-medium">{modalMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTForm;
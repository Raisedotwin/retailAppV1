import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { usePrivy, useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth';

interface ShortPosition {
  user: string;
  tokens: number;
  expiryTime: string;
  tokenAddress: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

interface ShortsProps {
  isEnabled?: boolean;
  tokenAddress?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
        {children}
      </div>
    </div>
  );
};

const TableHeader = () => (
  <div className="mb-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-yellow-400 text-3xl animate-bounce">🚀</span>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
          Shorting Arena
        </h2>
        <span className="text-yellow-400 text-3xl animate-bounce delay-100">💎</span>
      </div>
      <div className="flex items-center gap-2 bg-gray-700/50 px-4 py-2 rounded-lg">
        <span className="text-green-400 text-sm">Live Trading</span>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);

const PositionsTable = ({ positions, onOpenShort }: { 
  positions: ShortPosition[], 
  onOpenShort: (user: string, tokens: number, expiryTime: string, tokenAddress: string) => void 
}) => (
  <div className="bg-gray-800/50 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-700">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-gray-700">
          <th className="p-4 text-gray-400">Degen Address</th>
          <th className="p-4 text-gray-400">Available 🪙</th>
          <th className="p-4 text-gray-400">Expiry Time ⏰</th>
          <th className="p-4 text-gray-400">YOLO</th>
        </tr>
      </thead>
      <tbody>
        {positions.map((position, index) => (
          <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
            <td className="p-4 font-mono text-gray-300">{position.user}</td>
            <td className="p-4">
              <span className="bg-green-400/10 text-green-400 px-3 py-1 rounded-full">
                {position.tokens}
              </span>
            </td>
            <td className="p-4">
              <span className="bg-purple-400/10 text-purple-400 px-3 py-1 rounded-full">
                {position.expiryTime}
              </span>
            </td>
            <td className="p-4">
              <button
                onClick={() => onOpenShort(position.user, position.tokens, position.expiryTime, position.tokenAddress)}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
              >
                🎯 Short It
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Shorts: React.FC<ShortsProps> = ({ isEnabled = true, tokenAddress }) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showAddSharesModal, setShowAddSharesModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [availableShares, setAvailableShares] = useState<number>(0);
  const [expiryTime, setExpiryTime] = useState<string>('');
  const [userShares, setUserShares] = useState<number>(0);
  const [shortAmount, setShortAmount] = useState<number>(0);
  const [shortsContract, setShortsContract] = useState<any>(null);
  const [openShorts, setOpenShorts] = useState<ShortPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = usePrivy();
  const { wallets } = useWallets();
  const shortsContractAddr = '0xE71246b86c63a0ef84e905778106Fd17215F4e60';
  const shortsABI = require('../abi/shorts.json');

  useEffect(() => {
    const initContract = async () => {
      try {
        if (user?.twitter?.username) {
          let embeddedWallet = getEmbeddedConnectedWallet(wallets);
          let privyProvider = await embeddedWallet?.address;
          const wallet = wallets.find((w) => w.address === privyProvider);
          
          if (wallet) {
            const provider = await wallet.getEthersProvider();
            const signer: any = provider.getSigner();
            const contract = new ethers.Contract(shortsContractAddr, shortsABI, signer);
            setShortsContract(contract);

            // Fetch open shorts if we have a token address
            if (tokenAddress) {
              const openShortsResult = await contract.getOpenShortsByToken(tokenAddress);
              const formattedShorts = openShortsResult.map((short: any) => ({
                user: short.user,
                tokens: ethers.formatEther(short.shareAmount),
                expiryTime: new Date(short.expiryTime.toNumber() * 1000).toLocaleString(),
                tokenAddress: short.tokenAddress
              }));
              setOpenShorts(formattedShorts);
            }
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing contract:', error);
        setIsLoading(false);
      }
    };

    initContract();
  }, [user, wallets, tokenAddress]);

  const handleOpenShort = async (user: string, tokens: number, expiryTime: string, tokenAddr: string) => {
    if (!shortsContract || !tokenAddr) return;

    try {
      setShowModal(true);
      setSelectedUser(user);
      setAvailableShares(tokens);
      setExpiryTime(expiryTime);
    } catch (error) {
      console.error('Error preparing short:', error);
    }
  };

  const handleConfirmShort = async () => {
    if (!shortsContract || !tokenAddress) return;

    try {
      const expiryTimeInSeconds = Math.floor(Date.now() / 1000) + (parseInt(expiryTime) * 3600); // Convert hours to seconds
      const amountInWei = ethers.parseEther(shortAmount.toString());

      const tx = await shortsContract.openShort(
        amountInWei,
        expiryTimeInSeconds,
        selectedUser
      );

      await tx.wait();
      setShowModal(false);

      // Refresh open shorts
      const openShortsResult = await shortsContract.getOpenShortsByToken(tokenAddress);
      const formattedShorts = openShortsResult.map((short: any) => ({
        user: short.user,
        tokens: ethers.formatEther(short.shareAmount),
        expiryTime: new Date(short.expiryTime.toNumber() * 1000).toLocaleString(),
        tokenAddress: short.tokenAddress
      }));
      setOpenShorts(formattedShorts);
    } catch (error) {
      console.error('Error opening short:', error);
    }
  };

  const handleAddToPool = async () => {
    if (!shortsContract || !tokenAddress) return;

    try {
      const expiryTimeInSeconds = Math.floor(Date.now() / 1000) + (parseInt(expiryTime) * 3600);
      const amountInWei = ethers.parseEther(userShares.toString());

      // First approve the shorts contract to spend tokens
      const tokenContract = new ethers.Contract(tokenAddress, [
        "function approve(address spender, uint256 amount) public returns (bool)"
      ], shortsContract.signer);

      const approveTx = await tokenContract.approve(shortsContractAddr, amountInWei);
      await approveTx.wait();

      // Then add to the pool
      const tx = await shortsContract.openShort(
        amountInWei,
        expiryTimeInSeconds,
        tokenAddress
      );

      await tx.wait();
      setShowAddSharesModal(false);

      // Refresh open shorts
      const openShortsResult = await shortsContract.getOpenShortsByToken(tokenAddress);
      const formattedShorts = openShortsResult.map((short: any) => ({
        user: short.user,
        tokens: ethers.formatEther(short.shareAmount),
        expiryTime: new Date(short.expiryTime.toNumber() * 1000).toLocaleString(),
        tokenAddress: short.tokenAddress
      }));
      setOpenShorts(formattedShorts);
    } catch (error) {
      console.error('Error adding to pool:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading shorts data...</div>;
  }

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl shadow-xl">
        <TableHeader />
        
        <PositionsTable 
          positions={openShorts} 
          onOpenShort={handleOpenShort}
        />

        {/* Add Tokens Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAddSharesModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg inline-flex items-center gap-2"
          >
            <span className="text-xl">🌊</span>
            Add Tokens to Pool
            <span className="text-xl">💧</span>
          </button>
        </div>

        {/* Short Position Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
          <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent mb-4">
            🎯 Open Short Position
          </h2>
          <div className="space-y-4">
            <p className="text-gray-300">Degen: <span className="font-mono text-gray-100">{selectedUser}</span></p>
            <p className="text-gray-300">Available 🪙: <span className="text-green-400">{availableShares}</span></p>
            <p className="text-gray-300">Expiry Time: <span className="text-purple-400">{expiryTime}</span></p>
            
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Number of Tokens to Short
              </label>
              <input
                type="number"
                min="1"
                max={availableShares}
                value={shortAmount}
                onChange={(e) => setShortAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-gray-100"
              />
            </div>

            <div className="flex justify-between gap-4 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmShort}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105"
              >
                🎯 Confirm Short
              </button>
            </div>
          </div>
        </Modal>

        {/* Add Shares Modal */}
        <Modal isOpen={showAddSharesModal} onClose={() => setShowAddSharesModal(false)}>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            🌊 Add Your Tokens to Pool
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Number of Tokens to Make Available
              </label>
              <input
                type="number"
                min="1"
                value={userShares}
                onChange={(e) => setUserShares(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-gray-100"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Expiry Time
              </label>
              <select
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-gray-100"
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
              >
                <option value="">Select Expiry Time</option>
                <option value="5">5 min</option>
                <option value="10">10 min</option>
                <option value="30">30 min</option>
                <option value="1h">1 hour</option>
                <option value="2h">2 hours</option>
                <option value="3h">3 hours</option>
                <option value="4h">4 hours</option>
                <option value="8h">8 hours</option>
                <option value="12h">12 hours</option>
                <option value="24h">24 hours</option>
                <option value="48h">48 hours</option>
                <option value="72h">72 hours</option>
              </select>
            </div>

            <div className="flex justify-between gap-4 mt-6">
              <button
                onClick={() => setShowAddSharesModal(false)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddToPool}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105">
                🌊 Add to Pool
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Shorts;
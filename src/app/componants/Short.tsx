import React, { useState } from 'react';

interface ShortPosition {
  user: string;
  tokens: number;
  price: number;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
        {children}
      </div>
    </div>
  );
};

const Short: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [availableShares, setAvailableShares] = useState<number>(0);
  const [pricePerShare, setPricePerShare] = useState<number>(0);
  const [showAddSharesModal, setShowAddSharesModal] = useState<boolean>(false);
  const [userShares, setUserShares] = useState<number>(0);
  const [shortAmount, setShortAmount] = useState<number>(0);

  const positions: ShortPosition[] = [
    { user: '0x42b9 ... 3B148', tokens: 100, price: 1.70 },
    { user: '0x82a9 ... 4C229', tokens: 50, price: 1.50 },
    { user: '0x13a2 ... 5D310', tokens: 200, price: 1.80 }
  ];

  const handleOpenShort = (user: string, tokens: number, price: number): void => {
    setSelectedUser(user);
    setAvailableShares(tokens);
    setPricePerShare(price);
    setShowModal(true);
  };

  const handleShortAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value <= availableShares) {
      setShortAmount(value);
    }
  };

  const handleUserSharesChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setUserShares(value);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl shadow-xl">
      {/* Header */}
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

      {/* Table */}
      <div className="bg-gray-800/50 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-700">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-4 text-gray-400">Degen Address</th>
              <th className="p-4 text-gray-400">Available 🪙</th>
              <th className="p-4 text-gray-400">Price per 🪙</th>
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
                  <span className="bg-blue-400/10 text-blue-400 px-3 py-1 rounded-full">
                    ${position.price.toFixed(2)}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleOpenShort(position.user, position.tokens, position.price)}
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
          <p className="text-gray-300">Price per 🪙: <span className="text-blue-400">${pricePerShare.toFixed(2)}</span></p>
          
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Number of Tokens to Short
            </label>
            <input
              type="number"
              min="1"
              max={availableShares}
              value={shortAmount}
              onChange={handleShortAmountChange}
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
            <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105">
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
              onChange={handleUserSharesChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-gray-100"
            />
          </div>
          <p className="text-gray-300">Current Price per Token: <span className="text-blue-400">$1.80</span></p>

          <div className="flex justify-between gap-4 mt-6">
            <button
              onClick={() => setShowAddSharesModal(false)}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105">
              🌊 Add to Pool
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Short;
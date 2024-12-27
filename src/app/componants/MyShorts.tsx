import React, { useState } from 'react';
import { Modal} from './Short';  // Reusing the Modal component

interface ShortPosition {
  id: string;
  amount: number;
  price: number;
  expiryDate: Date;
  isProvider: boolean;
  collateral: number;
  counterpartyAddress: string;
}

const MyShorts: React.FC = () => {
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<ShortPosition | null>(null);

  // Sample data - replace with actual data
  const myPositions: ShortPosition[] = [
    {
      id: '0x1',
      amount: 50,
      price: 1.70,
      expiryDate: new Date('2024-12-31'),
      isProvider: true,
      collateral: 85,
      counterpartyAddress: '0x42b9...3B148'
    },
    {
      id: '0x2',
      amount: 100,
      price: 1.50,
      expiryDate: new Date('2024-12-25'),
      isProvider: false,
      collateral: 150,
      counterpartyAddress: '0x82a9...4C229'
    }
  ];

  const handleClosePosition = (position: ShortPosition) => {
    setSelectedPosition(position);
    setShowCloseModal(true);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl shadow-xl mt-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="text-purple-400 text-3xl">📊</span>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            My Active Shorts
          </h2>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-gray-800/50 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-700">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-4 text-gray-400">Role</th>
              <th className="p-4 text-gray-400">Amount</th>
              <th className="p-4 text-gray-400">Entry Price</th>
              <th className="p-4 text-gray-400">Expiry</th>
              <th className="p-4 text-gray-400">Collateral</th>
              <th className="p-4 text-gray-400">Counterparty</th>
              <th className="p-4 text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {myPositions.map((position) => (
              <tr key={position.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full ${
                    position.isProvider 
                      ? 'bg-blue-400/10 text-blue-400' 
                      : 'bg-purple-400/10 text-purple-400'
                  }`}>
                    {position.isProvider ? '🌊 Provider' : '🎯 Shorter'}
                  </span>
                </td>
                <td className="p-4">
                  <span className="bg-green-400/10 text-green-400 px-3 py-1 rounded-full">
                    {position.amount} 🪙
                  </span>
                </td>
                <td className="p-4">
                  <span className="bg-yellow-400/10 text-yellow-400 px-3 py-1 rounded-full">
                    ${position.price.toFixed(2)}
                  </span>
                </td>
                <td className="p-4 text-gray-300">
                  {position.expiryDate.toLocaleDateString()}
                </td>
                <td className="p-4">
                  <span className="bg-red-400/10 text-red-400 px-3 py-1 rounded-full">
                    ${position.collateral}
                  </span>
                </td>
                <td className="p-4 font-mono text-gray-300">{position.counterpartyAddress}</td>
                <td className="p-4">
                  <button
                    onClick={() => handleClosePosition(position)}
                    className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Close Short
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Close Position Modal */}
      <Modal isOpen={showCloseModal} onClose={() => setShowCloseModal(false)}>
        <h2 className="text-xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-4">
          {selectedPosition?.isProvider ? '🌊 Close Share Provision' : '🎯 Close Short Position'}
        </h2>
        <div className="space-y-4">
          <p className="text-gray-300">
            Position Details:
          </p>
          <div className="bg-gray-700/50 p-4 rounded-lg space-y-2">
            <p className="text-gray-300">Amount: <span className="text-green-400">{selectedPosition?.amount} 🪙</span></p>
            <p className="text-gray-300">Entry Price: <span className="text-yellow-400">${selectedPosition?.price.toFixed(2)}</span></p>
            <p className="text-gray-300">Collateral: <span className="text-red-400">${selectedPosition?.collateral}</span></p>
            <p className="text-gray-300">Expiry: <span className="text-blue-400">{selectedPosition?.expiryDate.toLocaleDateString()}</span></p>
          </div>

          <div className="bg-yellow-400/10 text-yellow-400 p-4 rounded-lg">
            {selectedPosition?.isProvider
              ? "You're closing your share provision before the expiry date. Make sure you understand the implications."
              : "You're closing your short position before the expiry date. Make sure you understand the implications."}
          </div>

          <div className="flex justify-between gap-4 mt-6">
            <button
              onClick={() => setShowCloseModal(false)}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105">
              Confirm Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyShorts;
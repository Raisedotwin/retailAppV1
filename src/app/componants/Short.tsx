import React, { useState } from 'react';

const Short = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [availableShares, setAvailableShares] = useState(0);
  const [pricePerShare, setPricePerShare] = useState(0);
  const [showAddSharesModal, setShowAddSharesModal] = useState(false);
  const [userShares, setUserShares] = useState(0);

  const handleOpenShort = (user: any, shares: any, price: any) => {
    setSelectedUser(user);
    setAvailableShares(shares);
    setPricePerShare(price);
    setShowModal(true);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <h2 className="text-xl text-gray-700">Shorting Arena</h2>
      </div>

      <div className="bg-gray-50 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="p-4 text-gray-600">User</th>
              <th className="p-4 text-gray-600">Available Tokens</th>
              <th className="p-4 text-gray-600">Price per Token</th>
              <th className="p-4 text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {[
              { user: '0x42b9 ... 3B148', tokens: 100, price: 1.70 },
              { user: '0x82a9 ... 4C229', tokens: 50, price: 1.50 },
              { user: '0x13a2 ... 5D310', tokens: 200, price: 1.80 }
            ].map((row, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="p-4 font-mono text-gray-700">{row.user}</td>
                <td className="p-4 text-green-600">{row.tokens}</td>
                <td className="p-4 text-blue-600">${row.price.toFixed(2)}</td>
                <td className="p-4">
                  <button
                    onClick={() => handleOpenShort(row.user, row.tokens, row.price)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                  >
                    Short Position
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={() => setShowAddSharesModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors inline-flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Your Tokens to Pool
        </button>
      </div>

      {/* Short Position Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Open Short Position</h2>
            <div className="space-y-4">
              <p className="text-gray-600">User: <span className="font-mono text-gray-700">{selectedUser}</span></p>
              <p className="text-gray-600">Available Tokens: <span className="text-green-600">{availableShares}</span></p>
              <p className="text-gray-600">Price per Token: <span className="text-blue-600">${pricePerShare.toFixed(2)}</span></p>
              
              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Number of Tokens to Short
                </label>
                <input
                  type="number"
                  min="1"
                  max={availableShares}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-700"
                />
              </div>

              <div className="flex justify-between gap-4 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                  Confirm Short
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Shares Modal */}
      {showAddSharesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Add Your Tokens for Shorting</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Number of Tokens to Make Available
                </label>
                <input
                  type="number"
                  min="1"
                  value={userShares}
                  onChange={(e) => setUserShares(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-700"
                />
              </div>
              <p className="text-gray-600">Current Price per Token: <span className="text-blue-600">$1.80</span></p>

              <div className="flex justify-between gap-4 mt-6">
                <button
                  onClick={() => setShowAddSharesModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Short;
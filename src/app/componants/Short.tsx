import React, { useState } from 'react';

const Short: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [availableShares, setAvailableShares] = useState(0);
  const [pricePerShare, setPricePerShare] = useState(0);
  const [showAddSharesModal, setShowAddSharesModal] = useState(false);
  const [userShares, setUserShares] = useState(0);
  const [sharePrice, setSharePrice] = useState(0);

  // Function to open the modal for shorting shares
  const handleOpenShort = (user: string, shares: number, price: number) => {
    setSelectedUser(user);
    setAvailableShares(shares);
    setPricePerShare(price);
    setShowModal(true);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Function to open the modal for adding shares to short
  const handleOpenAddSharesModal = () => {
    setShowAddSharesModal(true);
  };

  // Function to close the "add shares" modal
  const handleCloseAddSharesModal = () => {
    setShowAddSharesModal(false);
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg mt-8">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th>User</th>
            <th>Available Shares</th>
            <th>Price per Share</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>0x42b9 ... 3B148</td>
            <td>100</td>
            <td>$1.70</td>
            <td>
              <button
                onClick={() => handleOpenShort('0x42b9 ... 3B148', 100, 1.70)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Open Short
              </button>
            </td>
          </tr>
          <tr>
            <td>0x82a9 ... 4C229</td>
            <td>50</td>
            <td>$1.50</td>
            <td>
              <button
                onClick={() => handleOpenShort('0x82a9 ... 4C229', 50, 1.50)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Open Short
              </button>
            </td>
          </tr>
          <tr>
            <td>0x13a2 ... 5D310</td>
            <td>200</td>
            <td>$1.80</td>
            <td>
              <button
                onClick={() => handleOpenShort('0x13a2 ... 5D310', 200, 1.80)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Open Short
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Button to open modal for adding shares to short */}
      <div className="mt-6 text-center">
        <button
          onClick={handleOpenAddSharesModal}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Add Your Shares as Open to Short
        </button>
      </div>

      {/* Modal for opening a short position */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Open Short Position</h2>
            <p className="mb-2">User: {selectedUser}</p>
            <p className="mb-2">Available Shares: {availableShares}</p>
            <p className="mb-4">Price per Share: ${pricePerShare.toFixed(2)}</p>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Number of Shares to Short
              </label>
              <input
                type="number"
                min="1"
                max={availableShares}
                className="border border-gray-300 rounded py-2 px-4 w-full"
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleCloseModal}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Confirm Short
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for adding user's shares as open to short */}
      {showAddSharesModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Add Your Shares for Shorting</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Number of Shares to Make Available
              </label>
              <input
                type="number"
                min="1"
                className="border border-gray-300 rounded py-2 px-4 w-full"
                value={userShares}
                onChange={(e) => setUserShares(parseInt(e.target.value))}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Current Price per Share: $1.80
              </label>
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleCloseAddSharesModal}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Short;

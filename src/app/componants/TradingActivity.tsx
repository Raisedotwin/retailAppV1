import React from 'react';

const TradingActivity: React.FC = () => {
  const activities = [
    {
      address: '0x9401a ... b74e3fd98631',
      type: 'Purchase',
      amount: 10,
      price: 1.53,
      time: 'Just Now',
    },
    {
      address: '0x23ee239 ... 00e2C6810f',
      type: 'Sell',
      amount: 15,
      price: 1.80,
      time: '5 min',
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl shadow-xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📈</span>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Trading Activity
            </h2>
            <span className="text-2xl">📊</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-700/50 px-4 py-2 rounded-lg">
            <span className="text-green-400 text-sm">Live Feed</span>
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
              <th className="p-4 text-gray-400">Type</th>
              <th className="p-4 text-gray-400">Amount 🪙</th>
              <th className="p-4 text-gray-400">Price</th>
              <th className="p-4 text-gray-400">Time</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity, index) => (
              <tr 
                key={index} 
                className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
              >
                <td className="p-4 font-mono text-gray-300">
                  {activity.address}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    activity.type === 'Purchase' 
                      ? 'bg-green-400/10 text-green-400' 
                      : 'bg-red-400/10 text-red-400'
                  }`}>
                    {activity.type}
                  </span>
                </td>
                <td className="p-4">
                  <span className="bg-blue-400/10 text-blue-400 px-3 py-1 rounded-full">
                    {activity.amount}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-gray-300">
                    ${activity.price.toFixed(2)}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-gray-400 text-sm">
                    {activity.time}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Optional: View More Button */}
      <div className="mt-4 text-center">
        <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg inline-flex items-center gap-2">
          <span>View All Trades</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default TradingActivity;
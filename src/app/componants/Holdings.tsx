import React from 'react';
import NextLink from 'next/link';

interface HoldingsEntry {
  token: number;
  name: string;
  username: string;
  balance: string;
  link: string;
}

interface HoldingsProps {
  data: HoldingsEntry[];
}

const Holdings: React.FC<HoldingsProps> = ({ data }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    <div className="p-6 border-b border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800">Active Traders</h2>
      <p className="text-gray-500 mt-1">Browse and discover top performing traders</p>
    </div>
    
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Rank</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Username</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Market Cap</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Profile</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((entry, index) => (
            <tr 
              key={index} 
              className="hover:bg-blue-50 transition-colors duration-150"
            >
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <span className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    ${index < 3 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
                  `}>
                    {entry.token}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">{entry.name}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-gray-600">@{entry.username}</div>
              </td>
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(Number(entry.balance))}
                </div>
              </td>
              <td className="px-6 py-4">
                <NextLink 
                  href={entry.link} 
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors duration-150"
                >
                  View Profile
                </NextLink>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    {data.length === 0 && (
      <div className="text-center py-12">
        <p className="text-gray-500">No active traders found</p>
      </div>
    )}
  </div>
);

export default Holdings;

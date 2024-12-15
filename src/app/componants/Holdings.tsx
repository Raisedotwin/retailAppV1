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
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg overflow-hidden border border-gray-200">
    <div className="p-6 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2">
        <span className="text-2xl">📈</span>
        <h2 className="text-2xl font-bold text-emerald-600 animate-pulse">
          Active Traders
        </h2>
      </div>
      <p className="text-gray-600 mt-1">Browse and discover top performing traders</p>
    </div>
    
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Rank</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Name</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Username</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Market Cap</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Profile</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((entry, index) => (
            <tr 
              key={index} 
              className="hover:bg-gray-50/80 transition-colors duration-150"
            >
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <span className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    ${index === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-200' :
                      index === 1 ? 'bg-gray-200 text-gray-700 ring-2 ring-gray-300' :
                      index === 2 ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-200' :
                      'bg-gray-200 text-gray-700'}
                    transform transition-transform hover:scale-110
                  `}>
                    {entry.token}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900 hover:text-emerald-600 transition-colors">
                  {entry.name}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-gray-700 hover:text-emerald-600 transition-colors">
                  @{entry.username}
                </div>
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
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-all duration-150 hover:shadow-md"
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
        <p className="text-gray-600">No active traders found</p>
      </div>
    )}
  </div>
);

export default Holdings;
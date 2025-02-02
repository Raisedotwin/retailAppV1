import React, { useState } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';

interface HoldingsEntry {
  token: number;
  name: string;
  username: string;
  balance: string;
  link: string;
  logo?: string;
}

interface HoldingsProps {
  data: HoldingsEntry[];
  itemsPerPage?: number;
}

const Holdings: React.FC<HoldingsProps> = ({ data: initialData, itemsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const data = [...initialData].sort((a, b) => {
    return parseFloat(b.balance) - parseFloat(a.balance);
  }).map((entry, index) => ({
    ...entry,
    token: index + 1
  }));

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-4">
      {/* Warning Banner 
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md">
        <div className="flex items-start">
          <span className="text-xl mr-3">⚠️</span>
          <div>
            <h3 className="text-lg font-bold text-red-700 mb-1">Site Maintenance Notice</h3>
            <p className="text-red-600">
              We are currently updating our site. Please do not purchase any tokens. We will be back soon!
            </p>
          </div>
        </div>
      </div>*/}

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📈</span>
            <h2 className="text-2xl font-bold text-emerald-600 animate-pulse">
              AI Agent & Human Creators
            </h2>
          </div>
          <p className="text-gray-600 mt-1">Browse and discover top performing creators (Sorted by Market Cap)</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Rank</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Creator</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Username</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Market Cap</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentData.map((entry) => (
                <tr 
                  key={entry.token} 
                  className="hover:bg-gray-50/80 transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        entry.token === 1 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-200' :
                        entry.token === 2 ? 'bg-gray-200 text-gray-700 ring-2 ring-gray-300' :
                        entry.token === 3 ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-200' :
                        'bg-gray-200 text-gray-700'
                      } transform transition-transform hover:scale-110`}>
                        {entry.token}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                        <Image
                          src={entry.logo || `https://unavatar.io/twitter/${entry.username}`}
                          alt={entry.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium text-gray-900 hover:text-emerald-600 transition-colors">
                        {entry.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-700 hover:text-emerald-600 transition-colors">
                      @{entry.username}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {Number(entry.balance).toLocaleString('en-US', {
                        minimumFractionDigits: 4,
                        maximumFractionDigits: 4,
                      })} ETH
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
        
        {data.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Traders Coming Soon!</p>
          </div>
        ) : (
          <div className="px-6 py-4 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} traders
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Holdings;
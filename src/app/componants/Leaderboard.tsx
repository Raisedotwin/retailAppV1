import React, { useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  wallet: string;
  rewards: number;
  apy: number;
  daysStaked: number;
}

interface LeaderboardProps {
  data: LeaderboardEntry[];
}

const ChevronLeftIcon = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const Leaderboard: React.FC<LeaderboardProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 12;
  const totalPages = Math.ceil(data.length / entriesPerPage);

  // Get current entries
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = data.slice(indexOfFirstEntry, indexOfLastEntry);

  // Change page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Positions</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-4 font-semibold text-gray-600">Position</th>
              <th className="p-4 font-semibold text-gray-600">Token</th>
              <th className="p-4 font-semibold text-gray-600">Amount</th>
              <th className="p-4 font-semibold text-gray-600">Cost Basis</th>
              <th className="p-4 font-semibold text-gray-600">Days</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.map((entry, index) => (
              <tr 
                key={index} 
                className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="p-4 text-gray-800">{entry.rank}</td>
                <td className="p-4 text-gray-800">{entry.wallet}</td>
                <td className="p-4 text-gray-800">{entry.rewards}</td>
                <td className="p-4 text-gray-800">{entry.apy}%</td>
                <td className="p-4 text-gray-800">{entry.daysStaked}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-700">
            Showing{' '}
            <span className="font-medium">{indexOfFirstEntry + 1}</span>
            {' '}-{' '}
            <span className="font-medium">
              {Math.min(indexOfLastEntry, data.length)}
            </span>
            {' '}of{' '}
            <span className="font-medium">{data.length}</span>
            {' '}entries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeftIcon />
          </button>

          {getPageNumbers().map((number) => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentPage === number
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
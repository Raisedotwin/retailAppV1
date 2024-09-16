// components/BrowseCategories.tsx
import React from 'react';

const TopHolders: React.FC = () => {
  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg mt-8">
    <table className="w-full text-left">
      <thead>
        <tr>
          <th>User</th>
          <th>Rank</th>
          <th>Amount</th>
          <th>Cost Basis</th>
          <th>Last Sale</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>0x42b9 ... 3B148</td>
          <td>1</td>
          <td>10000</td>
          <td>100 ETH</td>
          <td>2 Month</td>
        </tr>
      </tbody>
    </table>
  </div>
  );
};

export default TopHolders;
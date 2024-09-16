// components/BrowseCategories.tsx
import React from 'react';

const TokenActivity: React.FC = () => {
  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg mt-8">
    <table className="w-full text-left">
      <thead>
        <tr>
          <th>User</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Cost</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>0x42b9 ... 3B148</td>
          <td>Purchase</td>
          <td>10</td>
          <td>$1.70</td>
          <td>Just Now</td>
        </tr>
      </tbody>
      <tbody>
        <tr>
          <td>0x42b9 ... 3B148</td>
          <td>Sell</td>
          <td>1</td>
          <td>$1.20</td>
          <td>Just Now</td>
        </tr>
      </tbody>
    </table>
  </div>
  );
};

export default TokenActivity;
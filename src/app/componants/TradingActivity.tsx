// components/BrowseCategories.tsx
import React from 'react';

const TradingActivity: React.FC = () => {
  return (
      <div className="bg-gray-100 p-6 rounded-lg shadow-lg mt-8">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>Token</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Price</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>0x9401a ... b74e3fd98631</td>
                <td>Purchase</td>
                <td>10</td>
                <td>$1.53</td>
                <td>Just Now</td>
              </tr>
            </tbody>
            <tbody>
              <tr>
                <td>0x23ee239 ... 00e2C6810f</td>
                <td>Sell</td>
                <td>15</td>
                <td>$1.80</td>
                <td>5 min</td>
              </tr>
            </tbody>
          </table>
        </div>
  );
};

export default TradingActivity;
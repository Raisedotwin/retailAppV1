// components/LatestActivity.tsx
import React from 'react';

const LatestActivity: React.FC = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4">Latest Activity</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">User</th>
            <th className="py-2">Type</th>
            <th className="py-2">Creator</th>
            <th className="py-2">Amount</th>
            <th className="py-2">Cost</th>
            <th className="py-2">Time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2">User Name</td>
            <td className="py-2 text-red-500">Sell</td>
            <td className="py-2">Creator Name</td>
            <td className="py-2">$179</td>
            <td className="py-2">0.073 ETH</td>
            <td className="py-2">4 hours ago</td>
          </tr>
          {/* Add more activity rows as needed */}
        </tbody>
      </table>
    </section>
  );
};

export default LatestActivity;

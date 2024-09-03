import React from 'react';

interface HoldingsEntry {
  rank: number; //string
  wallet: string; 
  rewards: number; // or string, depending on your data structure
  apy: number;
  daysStaked: number;
}

interface HoldingsProps {
  data: any[];
}

const Holdings: React.FC<HoldingsProps> = ({ data }) => (
  <div className="table-container">
    <h2 className="text-2xl font-bold mb-4">Holdings</h2>
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-200 text-left">
          <th className="p-3">Name</th>
          <th className="p-3">Wallet</th>
          <th className="p-3">Rewards Earned</th>
          <th className="p-3">Average APY</th>
          <th className="p-3">Days Staked</th>
        </tr>
      </thead>
      <tbody>
        {data.map((entry, index) => (
          <tr key={index} className="border-b">
            <td className="p-3">{entry.rank}</td>
            <td className="p-3">{entry.wallet}</td>
            <td className="p-3">{entry.rewards}</td>
            <td className="p-3">{entry.apy}%</td>
            <td className="p-3">{entry.daysStaked}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Holdings;


import React from 'react';

interface LeaderboardEntry {
  rank: number;
  wallet: string;
  rewards: number; // or string, depending on your data structure
  apy: number;
  daysStaked: number;
}

interface LeaderboardProps {
  data: any[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ data }) => (
  <div className="table-container">
    <h2 className="text-2xl font-bold mb-4">Positions</h2>
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-200 text-left">
          <th className="p-3">Position</th>
          <th className="p-3">Token</th>
          <th className="p-3">Amount</th>
          <th className="p-3">Cost Basis</th>
          <th className="p-3">Days</th>
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

export default Leaderboard;

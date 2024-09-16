import React from 'react';
import NextLink from 'next/link'; // Import NextLink

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
          <th className="p-3">Token</th>
          <th className="p-3">Name</th>
          <th className="p-3">Username</th>
          <th className="p-3">Balance</th>
          <th className="p-3">Link</th>
        </tr>
      </thead>
      <tbody>
        {data.map((entry, index) => (
          <tr key={index} className="border-b">
            <td className="p-3">{entry.token}</td>
            <td className="p-3">{entry.name}</td>
            <td className="p-3">{entry.username}</td>
            <td className="p-3">{entry.balance}</td>
            <NextLink href={entry.link} passHref>
            <td className="p-3">
              <a className="text-blue-500 underline">View Profile</a>
            </td>
          </NextLink>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Holdings;


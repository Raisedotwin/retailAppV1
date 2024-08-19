import React from 'react';
import Dashboard from '../componants/Dashboard';

const DashboardPage = () => {
  const data = [
    // Example data
    { rank: 1, wallet: 'STAKINGDOGTOKEN', rewards: '1,125', apy: '8.5', daysStaked: 121 },
    { rank: 2, wallet: 'DOG-TO-THE-MOON', rewards: '1,021', apy: '12.5', daysStaked: 119 },
    // More data here
  ];

  const pageStyle = {
    backgroundColor: '#edf2f7',
    minHeight: '100vh',
    padding: '20px',
  };

  return (
    <div style={pageStyle}>
      <Dashboard data={data} />
    </div>
  );
};

export default DashboardPage;


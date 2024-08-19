import React from 'react';
import Holdings from '../componants/Holdings';

const HoldingsPage = () => {
  const data = [
    // Example data
    { rank: 1, wallet: 'bc1p7...p5ym0', rewards: '1,125', apy: '12.5', daysStaked: 121 },
    { rank: 2, wallet: 'bc1p7...p5ym0', rewards: '1,021', apy: '12.5', daysStaked: 119 },
    // More data here
  ];

  const pageStyle = {
    backgroundColor: '#edf2f7',
    minHeight: '100vh',
    padding: '20px',
  };

  return (
    <div style={pageStyle}>
      <Holdings data={data} />
    </div>
  );
};

export default HoldingsPage;

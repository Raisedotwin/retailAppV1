import Leaderboard from '../componants/Leaderboard';

const Leaderboards = () => {
  const data = [
    // Example data
    { rank: 1, wallet: 'bc1p7...p5ym0', rewards: '1,125', apy: '12.5', daysStaked: 121 },
    { rank: 2, wallet: 'bc1p7...p5ym0', rewards: '1,021', apy: '12.5', daysStaked: 119 },
    // More data here
  ];

  return (
    <div>
      <Leaderboard data={data} />
    </div>
  );
};

export default Leaderboards;

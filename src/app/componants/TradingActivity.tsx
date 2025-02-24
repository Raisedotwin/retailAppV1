import React, { useState } from 'react';

interface TradingActivityProps {
  isEnabled?: boolean;
}

const ComingSoonOverlay = () => (
  <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-10 rounded-2xl flex flex-col items-center justify-center gap-4">
    <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
      Trading Activity Coming Soon
    </div>
    <div className="text-gray-400 text-lg">
      Track all trading activities in real-time! 📊
    </div>
    <div className="flex gap-2 mt-2">
      <span className="animate-bounce delay-0">📈</span>
      <span className="animate-bounce delay-100">💹</span>
      <span className="animate-bounce delay-200">📊</span>
    </div>
  </div>
);

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-200">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const TableHeader = () => (
  <div className="mb-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl">📈</span>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Admin Panel
        </h2>
        <span className="text-2xl">📊</span>
      </div>
      <div className="flex items-center gap-2 bg-gray-700/50 px-4 py-2 rounded-lg">
        <span className="text-green-400 text-sm">Live Feed</span>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);

const LiquiditySection = () => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const totalLiquidity = 150000; // This would normally come from props or an API

  const handleWithdraw = () => {
    // Handle withdrawal logic
    console.log('Withdrawing:', withdrawAmount);
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xl text-gray-300">Total Liquidity</div>
        <div className="text-2xl font-bold text-green-400">${totalLiquidity.toLocaleString()}</div>
      </div>
      <div className="flex gap-4">
        <input 
          type="number"
          placeholder="Enter amount to withdraw"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={handleWithdraw}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all transform hover:scale-105"
        >
          Withdraw
        </button>
      </div>
    </div>
  );
};

const EarlyWithdrawSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    // Handle early withdrawal request submission
    console.log('Early withdrawal reason:', reason);
    setIsModalOpen(false);
    setReason('');
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-6 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-200 hover:bg-gray-600/50 transition-colors"
      >
        Request Early Withdrawal
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Request Early Withdrawal"
      >
        <textarea
          placeholder="Please provide a reason for early withdrawal..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32 mb-4"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all transform hover:scale-105"
          >
            Submit Request
          </button>
        </div>
      </Modal>
    </>
  );
};

const TradingActivity: React.FC<TradingActivityProps> = ({ isEnabled = true }) => {
  return (
    <div className="relative">
      {!isEnabled && <ComingSoonOverlay />}
      
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl shadow-xl">
        <TableHeader />
        <LiquiditySection />
        <div className="mb-6 flex justify-end">
          <EarlyWithdrawSection />
        </div>
      </div>
    </div>
  );
};

export default TradingActivity;
'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from '../context/AccountContext';
import { ethers } from 'ethers';

interface WithdrawalRequest {
  id: string;
  user: string;
  amount: number;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const AdminPage: React.FC = () => {
  const { account } = useAccount();
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [protocolBalance, setProtocolBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);

  const PROTOCOL_WALLET = '0x607c2c89dDD1ef322b5eD79F2178Ca517Fb8fc03';

  useEffect(() => {
    const fetchProtocolBalance = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        const balance = await provider.getBalance(PROTOCOL_WALLET);
        const formattedBalance = ethers.formatEther(balance);
        setProtocolBalance(formattedBalance);
      } catch (error) {
        console.error('Error fetching protocol balance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProtocolBalance();
  }, []);

  // Dummy withdrawal requests data
  const withdrawalRequests: WithdrawalRequest[] = [
    {
      id: '1',
      user: '0x1234...5678',
      amount: 1000,
      timestamp: '2025-02-04T10:00:00Z',
      status: 'pending'
    },
    {
      id: '2',
      user: '0x8765...4321',
      amount: 2500,
      timestamp: '2025-02-04T09:30:00Z',
      status: 'pending'
    },
    {
      id: '3',
      user: '0x9876...1234',
      amount: 750,
      timestamp: '2025-02-04T09:00:00Z',
      status: 'pending'
    },
  ];

  const handleApproveRequest = (request: WithdrawalRequest) => {
    // Add smart contract interaction here
    console.log(`Approving request ${request.id}`);
    setIsModalOpen(false);
  };

  const openModal = (request: WithdrawalRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Background effects container */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-purple-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob top-0 left-0" />
          <div className="absolute w-96 h-96 bg-blue-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 top-0 right-0" />
          <div className="absolute w-96 h-96 bg-pink-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 bottom-0 left-1/2 transform -translate-x-1/2" />
        </div>
      </div>

      {/* Main content */}
      <div className="min-h-screen pt-12 px-6 pb-6">
        <div className="max-w-7xl w-full mx-auto p-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            {/* Total Revenue Box */}
            <div className="mb-8 p-6 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 shadow-md">
              <h2 className="text-xl font-semibold text-white mb-2">Protocol Balance</h2>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-white">
                  {isLoading ? 'Loading...' : `${Number(protocolBalance).toFixed(4)} ETH`}
                </p>
                <p className="text-sm text-white/80">
                  ({PROTOCOL_WALLET.slice(0, 6)}...{PROTOCOL_WALLET.slice(-4)})
                </p>
              </div>
            </div>

            {/* Withdrawal Requests Section */}
            <h2 className="text-2xl font-bold mb-6">Withdrawal Requests</h2>
            <div className="space-y-4">
              {withdrawalRequests.map((request) => (
                <div 
                  key={request.id}
                  className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => openModal(request)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">User: {request.user}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(request.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${request.amount.toLocaleString()}</p>
                      <p className="text-sm text-yellow-600">Pending</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedRequest && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Withdrawal Request Details</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div>
              <p className="text-sm text-gray-500">User Address</p>
              <p className="font-medium">{selectedRequest.user}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-medium">${selectedRequest.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Timestamp</p>
              <p className="font-medium">
                {new Date(selectedRequest.timestamp).toLocaleString()}
              </p>
            </div>
            <button 
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              onClick={() => handleApproveRequest(selectedRequest)}
            >
              Approve Request
            </button>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdminPage;
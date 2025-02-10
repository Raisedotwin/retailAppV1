'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAccount } from '../context/AccountContext';
import { ethers } from 'ethers';
import { EIP155_CHAINS } from '@/data/EIP155Data';
import { usePrivy, useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth';

interface WithdrawalRequest {
  id: string;
  user: string;
  amount: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
  txLink: string;
  raiseWallet: string;
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalStep, setApprovalStep] = useState<string>('');
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);

  const { wallets } = useWallets();
  let wallet = wallets[0];
  const { user } = usePrivy();

  let rpcURL = EIP155_CHAINS["eip155:8453"].rpc;
  const provider = useMemo(() => new ethers.JsonRpcProvider(rpcURL), [rpcURL]);

  const PROTOCOL_WALLET = '0x607c2c89dDD1ef322b5eD79F2178Ca517Fb8fc03';
  const tokenPoolABI = require("../abi/traderPool");

  // Create a wallet instance from the private key
  const adminWallet = useMemo(() => {
        return new ethers.Wallet('cac636e07dd1ec983b66c5693b97ac5150d9a0cc5db8dd39ddb58b2e142cb192', provider);
  }, [provider]);
  

  // Get the appropriate wallet and signer
  const getWallet = async () => {
    if (user?.twitter?.username) {
      const embeddedWallet = getEmbeddedConnectedWallet(wallets);
      const privyProvider = await embeddedWallet?.address;
      return wallets.find(w => w.address === privyProvider) || wallet;
    }
    return wallet;
  };

  const getSigner = async () => {
    const currentWallet = await getWallet();
    if (!currentWallet) throw new Error("No wallet available");
    
    try {
      await currentWallet.switchChain(8453);
      const provider = await currentWallet.getEthersProvider();
      return provider.getSigner();
    } catch (error) {
      console.error("Failed to get signer:", error);
      throw error;
    }
  };
  
  const withdrawAddr = '0x7a1Df7F34f8D8a27364BEa1708a6df902d225Bba';
  const withdrawABI = require("../abi/withdraw");

  const withdrawContract = useMemo(() => {
    return new ethers.Contract(withdrawAddr, withdrawABI, provider);
  }, [withdrawAddr, withdrawABI, provider]);

  const fetchWithdrawalRequests = async () => {
    try {
      const [users, amounts, txLinks, raiseWallets, timestamps] = await withdrawContract.getPendingWithdrawals();
      
      const requests: WithdrawalRequest[] = users.map((user: string, index: number) => ({
        id: `${index}-${user}`,
        user: user,
        amount: ethers.formatEther(amounts[index]),
        timestamp: new Date(Number(timestamps[index]) * 1000).toISOString(),
        status: 'pending',
        txLink: txLinks[index],
        raiseWallet: raiseWallets[index]
      }));

      setWithdrawalRequests(requests);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
    }
  };

  useEffect(() => {
    const fetchProtocolBalance = async () => {
      try {
        const balance = await provider.getBalance(PROTOCOL_WALLET);
        const formattedBalance = ethers.formatEther(balance);
        setProtocolBalance(formattedBalance);
      } catch (error) {
        console.error('Error fetching protocol balance:', error);
      }
    };

    Promise.all([fetchProtocolBalance(), fetchWithdrawalRequests()])
      .finally(() => setIsLoading(false));
  }, [provider, PROTOCOL_WALLET, withdrawContract]);

  const handleApproveRequest = async (request: WithdrawalRequest) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setIsApproving(true);
    setApprovalStep('Approving withdraw contract as module...');

    try {
      // Get signer for transactions
      const signer: any = await getSigner();
      
      // Create contract instances with signer
      const traderPoolContract = new ethers.Contract(
        request.raiseWallet,
        tokenPoolABI,
        adminWallet
      );

      const withdrawContractWithSigner = new ethers.Contract(
        withdrawAddr,
        withdrawABI,
        signer
      );

      // Approve withdraw contract as a module
      const approveTx = await traderPoolContract.setModuleApproval(withdrawAddr, true);
      await approveTx.wait();

      setApprovalStep('Processing withdrawal request...');

      // Now approve the withdrawal request
      const tx = await withdrawContractWithSigner.approveWithdrawal(request.user);
      await tx.wait();

      // Refresh the withdrawal requests list
      await fetchWithdrawalRequests();

      setApprovalStep('Completed successfully!');
    } catch (error) {
      console.error('Error in approval process:', error);
      setApprovalStep('Error: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
      setIsApproving(false);
      setIsModalOpen(false);
      setApprovalStep('');
    }
  };

  const handleDenyRequest = async (request: WithdrawalRequest) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      const signer: any = await getSigner();
      const withdrawContractWithSigner = new ethers.Contract(
        withdrawAddr,
        withdrawABI,
        signer
      );
      
      const tx = await withdrawContractWithSigner.denyWithdrawal(request.user);
      await tx.wait();
      await fetchWithdrawalRequests();
    } catch (error) {
      console.error('Error denying withdrawal:', error);
    } finally {
      setIsProcessing(false);
      setIsModalOpen(false);
    }
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
            {/* Protocol Balance Box */}
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
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Withdrawal Requests</h2>
                <div className="flex gap-4">
                  <button
                    onClick={() => fetchWithdrawalRequests()}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Refresh Requests
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : withdrawalRequests.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow text-center">
                  <p className="text-gray-500">No pending withdrawal requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {withdrawalRequests.map((request) => (
                    <div 
                      key={request.id}
                      className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => openModal(request)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">
                            User: {request.user.slice(0, 6)}...{request.user.slice(-4)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(request.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{Number(request.amount).toFixed(4)} ETH</p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => !isProcessing && setIsModalOpen(false)}>
        {selectedRequest && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Withdrawal Request Details</h3>
              <button
                onClick={() => !isProcessing && setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                disabled={isProcessing}
              >
                ✕
              </button>
            </div>

            {/* Request Details */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">User Address</p>
                <p className="font-medium text-gray-900">{selectedRequest.user}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-medium text-gray-900">{Number(selectedRequest.amount).toFixed(4)} ETH</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Timestamp</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedRequest.timestamp).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Transaction Link</p>
                <a 
                  href={selectedRequest.txLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600"
                >
                  View Transaction
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-500">Raise Wallet</p>
                <p className="font-medium text-gray-900 break-all">{selectedRequest.raiseWallet}</p>
              </div>
            </div>

            {/* Processing Status */}
            {isProcessing && (
              <div className="py-2">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <p className="text-sm font-medium text-blue-600">
                    {isApproving ? approvalStep : 'Processing request...'}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => handleDenyRequest(selectedRequest)}
                disabled={isProcessing}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Deny Request'}
              </button>
              <button 
                onClick={() => handleApproveRequest(selectedRequest)}
                disabled={isProcessing}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Approve Request'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdminPage;
"use client";

import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useAccount } from '../context/AccountContext';

interface DashboardProps {
  data: {
    rank: number;
    wallet: string;
    rewards: string;
    apy: number;
    daysStaked: number;
    holders: number;
  }[];
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const { account } = useAccount();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isViewHoldersModalOpen, setIsViewHoldersModalOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [adjustApy, setAdjustApy] = useState<string>('');
  const [runesBalance, setRunesBalance] = useState<any>(null);

  const openDepositModal = (vault: string) => {
    setSelectedVault(vault);
    setIsDepositModalOpen(true);
  };

  const closeDepositModal = () => {
    setIsDepositModalOpen(false);
    setDepositAmount('');
  };

  const openAdjustModal = (vault: string) => {
    setSelectedVault(vault);
    setIsAdjustModalOpen(true);
  };

  const closeAdjustModal = () => {
    setIsAdjustModalOpen(false);
    setAdjustApy('');
  };

  const openViewHoldersModal = async (vault: string) => {
    setSelectedVault(vault);
    setIsViewHoldersModalOpen(true);
    try {
      const response = await fetch(`/api/getRunesBalance?address=${vault}&runeid=YOUR_RUNE_ID`);
      const data = await response.json();
      setRunesBalance(data);
    } catch (error) {
      console.error('Failed to fetch runes balance:', error);
    }
  };

  const closeViewHoldersModal = () => {
    setIsViewHoldersModalOpen(false);
  };

  const handleDepositSend = () => {
    console.log(`Depositing ${depositAmount} to ${selectedVault}`);
    closeDepositModal();
  };

  const handleAdjustSend = () => {
    console.log(`Adjusting APY to ${adjustApy}% for ${selectedVault}`);
    closeAdjustModal();
  };

  return (
    <div className="table-container">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-3">ID</th>
            <th className="p-3">Vault</th>
            <th className="p-3">Rewards Earned</th>
            <th className="p-3">Average APY</th>
            <th className="p-3">Holders</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, index) => (
            <tr key={index} className="border-b">
              <td className="p-3">{entry.rank}</td>
              <td className="p-3">{entry.wallet}</td>
              <td className="p-3">{entry.rewards}</td>
              <td className="p-3">
                {entry.apy}%
                <button
                  onClick={() => openAdjustModal(entry.wallet)}
                  className="ml-2 bg-gradient-to-r from-orange-400 to-purple-500 text-white px-2 py-1 rounded"
                >
                  Adjust
                </button>
              </td>
              <td className="p-3">
                {entry.holders} holders
                <button
                  onClick={() => openViewHoldersModal(entry.wallet)}
                  className="ml-2 bg-gradient-to-r from-orange-400 to-purple-500 text-white px-2 py-1 rounded"
                >
                  View
                </button>
              </td>
              <td className="p-3">
                <button
                  onClick={() => openDepositModal(entry.wallet)}
                  className="bg-gradient-to-r from-orange-400 to-purple-500 text-white px-4 py-2 rounded"
                >
                  Deposit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Deposit Modal */}
      <Transition appear show={isDepositModalOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={closeDepositModal}>
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-50" />
            </Transition.Child>

            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as="div"
              className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                Deposit to Vault
              </Dialog.Title>
              <div className="mt-2">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="border p-3 w-full rounded"
                />
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-400 to-purple-500 border border-transparent rounded-md hover:bg-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                  onClick={handleDepositSend}
                >
                  Send
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-400 to-purple-500 border border-transparent rounded-md hover:bg-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ml-2"
                  onClick={closeDepositModal}
                >
                  Close
                </button>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Adjust APY Modal */}
      <Transition appear show={isAdjustModalOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={closeAdjustModal}>
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-50" />
            </Transition.Child>

            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as="div"
              className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                Adjust APY for Vault
              </Dialog.Title>
              <div className="mt-2">
                <input
                  type="number"
                  value={adjustApy}
                  onChange={(e) => setAdjustApy(e.target.value)}
                  placeholder="Enter new APY"
                  className="border p-3 w-full rounded"
                />
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-400 to-purple-500 border border-transparent rounded-md hover:bg-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                  onClick={handleAdjustSend}
                >
                  Send
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-400 to-purple-500 border border-transparent rounded-md hover:bg-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ml-2"
                  onClick={closeAdjustModal}
                >
                  Close
                </button>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* View Holders Modal */}
      <Transition appear show={isViewHoldersModalOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={closeViewHoldersModal}>
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-50" />
            </Transition.Child>

            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as="div"
              className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                Holders for Vault
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">Details about the holders can be displayed here.</p>
                <p className="text-sm text-gray-500 mt-2">Current Holders: {account}</p>
                {runesBalance && (
                  <div className="mt-4">
                    <p>Amount: {runesBalance.data.amount}</p>
                    <p>Rune ID: {runesBalance.data.runeid}</p>
                    <p>Symbol: {runesBalance.data.symbol}</p>
                    {/* Add more details as needed */}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-400 to-purple-500 border border-transparent rounded-md hover:bg-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                  onClick={closeViewHoldersModal}
                >
                  Close
                </button>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Dashboard;

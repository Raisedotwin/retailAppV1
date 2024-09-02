"use client";

import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Wallet from 'sats-connect';
import { useAccount } from '../context/AccountContext';

// Fetch the runes from the backend

const StakeForm: React.FC = () => {
  const { account } = useAccount();
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('UNCOMMONDOODS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mintCost, setMintCost] = useState<number | null>(null);
  const [stake, setStake] = useState(true); // State to track staking status

  const estimateMintCost = async () => {
    if (!account) {
      alert('Please connect your wallet first.');
      return;
    }
  
    try {
      const response = await Wallet.request('runes_estimateMint', {
        destinationAddress: account ?? '', // Use an empty string or handle the null case
        feeRate: 0,
        repeats: 1,
        runeName: token,
      });
  
      if (response.status === 'success') {
        setMintCost(response.result.totalCost);
      } else {
        console.error(response.error);
        alert('Error Fetching Estimate. See console for details.');
      }
    } catch (err: any) {
      console.error('Error estimating cost', err.message);
      alert(err.message);
    }
  };
  
  const handleMint = async () => {
    if (!account) {
      alert('Please connect your wallet first.');
      return;
    }
  
    try {
      const response = await Wallet.request('runes_mint', {
        destinationAddress: account ?? '',
        feeRate: 1,
        repeats: 2,
        runeName: token,
        refundAddress: account ?? '',
      });
  
      console.log('Mint response:', response);
      console.log('Mint response status:', account);
      console.log('Mint response result:', token);
  
      if (response.status === 'success') {
        console.log("Fund Transaction ID:", response.result.fundTransactionId);
        console.log("Order ID:", response.result.orderId);
        console.log("Funding Address:", response.result.fundingAddress);
        setIsModalOpen(true);
        setStake(true); // Set stake to true after successful minting
      } else {
        console.error(response.error);
        alert('Error minting rune. See console for details.');
      }
    } catch (err: any) {
      console.error('Error minting rune', err.message);
      alert(err.message);
    }
  };
  

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();

    if (stake && token === 'STAKINGDOGTOKEN') {
      alert('Already staked');
      return;
    }

    if (!account) {
      alert('Please connect your wallet first.');
      return;
    }

    await estimateMintCost();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="py-10 px-10 bg-black rounded-lg shadow-md max-w-2xl mx-auto h-80">
      <form onSubmit={handleStake} className="h-full flex flex-col justify-between space-y-4">
        <div>
          <div className="mb-4">
            <label className="block text-gray-300 text-m font-bold mb-2">Stake</label>
            <select
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="block appearance-none w-full bg-gray-700 border border-gray-600 text-gray-300 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-gray-600 focus:border-indigo-500"
            >
              <option value="UNCOMMONDOODS">UNCOMMONDOODS</option>
              <option value="DOG-TO-THE-MOON">DOG-TO-THE-MOON</option>
              <option value="STAKINGDOGTOKEN">STAKINGDOGTOKEN</option>
              <option value="RUNIVERSE-TOKEN">RUNIVERSE-TOKEN</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 text-m font-bold mb-2">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="border p-3 w-full rounded bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r from-orange-400 to-purple-500 text-white py-2 px-4 rounded w-full shadow-md hover:from-orange-500 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
        >
          {stake && token === 'STAKINGDOGTOKEN' ? 'Already staked' : `Stake ${token}`}
        </button>
      </form>

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={closeModal}>
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
              className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-900 shadow-xl rounded-lg"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="flex justify-between items-center">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-300">
                  Transaction Details
                </Dialog.Title>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  &times;
                </button>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-300">Token: {token}</p>
                <p className="text-sm text-gray-300">Amount: {amount}</p>
                {mintCost && <p className="text-sm text-gray-300">Estimated Mint Cost: {mintCost} sats</p>}
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-400 to-purple-500 border border-transparent rounded-md shadow-md hover:from-orange-500 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                  onClick={handleMint}
                >
                  Confirm Mint
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-400 to-pink-500 border border-transparent rounded-md shadow-md hover:from-red-500 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 ml-2"
                  onClick={closeModal}
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

export default StakeForm;

"use client";

import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

const StakeForm = () => {
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('DOG-TO-THE-MOON');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStake = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 bg-beige rounded-lg shadow-md max-w-md mx-auto">
      <form onSubmit={handleStake}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Stake</label>
          <select
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          >
            <option value="DOG-TO-THE-MOON">DOG-TO-THE-MOON</option>
            <option value="RUNIVERSE-TOKEN">RUNIVERSE-TOKEN</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="border p-3 w-full rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r from-orange-400 to-purple-500 text-white py-2 px-4 rounded w-full"
        >
          Stake {token}
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
              as="div"  // Change Fragment to div
              className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="flex justify-between items-center">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Transaction Details
                </Dialog.Title>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  &times;
                </button>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">Token: {token}</p>
                <p className="text-sm text-gray-500">Amount: {amount}</p>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-400 to-purple-500 border border-transparent rounded-md hover:bg-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
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

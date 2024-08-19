"use client";

import React, { useState } from 'react';
import Wallet from 'sats-connect';
import { useAccount } from '../context/AccountContext';

const CreateVaultForm: React.FC = () => {
  const { account } = useAccount();
  const [vaultName, setVaultName] = useState('');
  const [description, setDescription] = useState('');
  const [initialDeposit, setInitialDeposit] = useState('');
  const [tokenToStake, setTokenToStake] = useState('');

  console.log("CreateVaultForm account:", account);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      alert('Please connect your wallet first.');
      return;
    }

    try {
      const response = await Wallet.request('runes_etch', {
        runeName: vaultName,
        premine: initialDeposit,
        isMintable: true,
        destinationAddress: account,
        refundAddress: account,
        feeRate: 1,
        network: 'Testnet' as any
      });

      if (response.status === 'success') {
        console.log("Fund Transaction ID:", response.result.fundTransactionId);
        console.log("Order ID:", response.result.orderId);
        console.log("Funding Address:", response.result.fundingAddress);
      } else {
        console.error(response.error);
        alert('Error etching rune. See console for details.');
      }
    } catch (err: any) {
      console.error('Error etching rune', err.message);
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#edf2f7' }}>
      <form onSubmit={handleSubmit} className="p-10 bg-black rounded-lg shadow-md max-w-lg mx-auto">
        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2">Token To Stake</label>
          <input
            type="text"
            value={tokenToStake}
            onChange={(e) => setTokenToStake(e.target.value)}
            placeholder="Token To Stake"
            className="bg-gray-800 border border-gray-700 text-white p-3 w-full rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2">Vault Name</label>
          <input
            type="text"
            value={vaultName}
            onChange={(e) => setVaultName(e.target.value)}
            placeholder="Vault Name"
            className="bg-gray-800 border border-gray-700 text-white p-3 w-full rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="bg-gray-800 border border-gray-700 text-white p-3 w-full rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2">Pre Mine</label>
          <input
            type="number"
            value={initialDeposit}
            onChange={(e) => setInitialDeposit(e.target.value)}
            placeholder="Initial Deposit"
            className="bg-gray-800 border border-gray-700 text-white p-3 w-full rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r from-orange-400 to-purple-500 text-white py-2 px-4 rounded w-full shadow-md"
        >
          Create Vault
        </button>
      </form>
    </div>
  );
};

export default CreateVaultForm;



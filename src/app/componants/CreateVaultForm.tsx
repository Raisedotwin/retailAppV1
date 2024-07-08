"use client";

import React, { useState } from 'react';

const CreateVaultForm = () => {
  const [vaultName, setVaultName] = useState('');
  const [description, setDescription] = useState('');
  const [initialDeposit, setInitialDeposit] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Creating vault:', {
      vaultName,
      description,
      initialDeposit,
    });
    // Add your form submission logic here
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Vault Name</label>
        <input
          type="text"
          value={vaultName}
          onChange={(e) => setVaultName(e.target.value)}
          placeholder="Vault Name"
          className="border p-3 w-full rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="border p-3 w-full rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Initial Deposit</label>
        <input
          type="number"
          value={initialDeposit}
          onChange={(e) => setInitialDeposit(e.target.value)}
          placeholder="Initial Deposit"
          className="border p-3 w-full rounded"
        />
      </div>
      <button
        type="submit"
        className="bg-gradient-to-r from-orange-400 to-purple-500 text-white py-2 px-4 rounded w-full"
      >
        Create Vault
      </button>
    </form>
  );
};

export default CreateVaultForm;

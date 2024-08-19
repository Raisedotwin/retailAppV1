"use client";

import React from 'react';
import CreateVaultForm from '../componants/CreateVaultForm';

const CreatePage: React.FC = () => (
  <div className="min-h-screen p-6" style={{ backgroundColor: '#edf2f7' }}>
    <div className="max-w-4xl w-full mx-auto p-6">
      <CreateVaultForm />
    </div>
  </div>
);

export default CreatePage;

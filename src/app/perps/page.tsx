"use client";

import React from 'react';
import PerpsForm from '../componants/PerpsForm';


const PerpsPage: React.FC = () => (
  <div className="min-h-screen p-6" style={{ backgroundColor: '#edf2f7' }}>
    <div className="max-w-4xl w-full mx-auto p-6">
        <PerpsForm />
    </div>
  </div>
);

export default PerpsPage;

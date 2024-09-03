// components/BrowseCategories.tsx
import React from 'react';

const Categories: React.FC = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4">Browse Categories</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-200 p-6 rounded-lg text-center">
          <p className="font-semibold">Founders</p>
          <p className="text-gray-500">Get advice from proven entrepreneurs</p>
        </div>
        <div className="bg-gray-200 p-6 rounded-lg text-center">
          <p className="font-semibold">Investors</p>
          <p className="text-gray-500">Pitch your product or get advice on raising</p>
        </div>
        <div className="bg-gray-200 p-6 rounded-lg text-center">
          <p className="font-semibold">Tax/Legal</p>
          <p className="text-gray-500">Navigating complexities to secure peace of mind</p>
        </div>
        {/* Add more categories as needed */}
      </div>
    </section>
  );
};

export default Categories;

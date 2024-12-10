import React from 'react';

const BrowseCategories: React.FC = () => {
  return (
    <section className="mb-12">
      {/* Title */}
      <h2 className="text-2xl font-bold mb-6 text-center">How It Works: Video Tutorials</h2>

      {/* Video Tutorials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Video Slot 1 */}
        <div className="bg-gray-200 p-4 rounded-lg shadow-lg">
          <video
            controls
            className="rounded-lg w-full"
            src="/path-to-video-1.mp4"
            poster="/path-to-thumbnail-1.jpg"
          />
          <h3 className="mt-4 text-lg font-semibold text-center">Step 1: Fundraise</h3>
        </div>

        {/* Video Slot 2 */}
        <div className="bg-gray-200 p-4 rounded-lg shadow-lg">
          <video
            controls
            className="rounded-lg w-full"
            src="/path-to-video-2.mp4"
            poster="/path-to-thumbnail-2.jpg"
          />
          <h3 className="mt-4 text-lg font-semibold text-center">Step 2: Trading</h3>
        </div>

        {/* Video Slot 3 */}
        <div className="bg-gray-200 p-4 rounded-lg shadow-lg">
          <video
            controls
            className="rounded-lg w-full"
            src="/path-to-video-3.mp4"
            poster="/path-to-thumbnail-3.jpg"
          />
          <h3 className="mt-4 text-lg font-semibold text-center">Step 3: Fund Expiration</h3>
        </div>
      </div>
    </section>
  );
};

export default BrowseCategories;

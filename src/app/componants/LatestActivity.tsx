import React from 'react';

const LatestActivity: React.FC = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-center mb-6">Community Links</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Twitter Link */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-lg text-center">
          <div className="flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-8 h-8 text-blue-500"
            >
              <path d="M24 4.557a9.93 9.93 0 01-2.828.775 4.932 4.932 0 002.165-2.725 9.864 9.864 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482A13.956 13.956 0 011.671 3.149a4.928 4.928 0 001.524 6.573 4.902 4.902 0 01-2.228-.616v.062a4.922 4.922 0 003.946 4.827 4.903 4.903 0 01-2.224.084 4.924 4.924 0 004.6 3.419 9.868 9.868 0 01-6.102 2.104c-.395 0-.787-.023-1.175-.067a13.945 13.945 0 007.548 2.211c9.057 0 14.01-7.496 14.01-13.986 0-.213-.005-.426-.014-.637A10.025 10.025 0 0024 4.557z" />
            </svg>
          </div>
          <a
            href="https://x.com/raisedotwin"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-blue-600 hover:underline"
          >
            Follow us on Twitter
          </a>
        </div>

        {/* YouTube Link */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-lg text-center">
          <div className="flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-8 h-8 text-red-500"
            >
              <path d="M23.498 6.186a2.84 2.84 0 00-1.996-2.016C19.42 3.513 12 3.513 12 3.513s-7.42 0-9.502.657A2.84 2.84 0 00.502 6.186C0 8.268 0 12 0 12s0 3.732.502 5.814a2.84 2.84 0 001.996 2.016c2.082.656 9.502.656 9.502.656s7.42 0 9.502-.657a2.84 2.84 0 001.996-2.016C24 15.732 24 12 24 12s0-3.732-.502-5.814zM9.546 15.568V8.432L15.818 12l-6.272 3.568z" />
            </svg>
          </div>
          <a
            href="https://www.youtube.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-red-600 hover:underline"
          >
            Subscribe to our YouTube
          </a>
        </div>

        {/* Telegram Link */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-lg text-center">
          <div className="flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-8 h-8 text-blue-400"
            >
              <path d="M9.222 13.92L8.946 18.2c.49 0 .71-.215.97-.471l2.33-2.21 4.831 3.524c.886.492 1.515.233 1.73-.823l3.13-14.62c.316-1.45-.486-2.022-1.43-1.668L2.116 9.56C.741 10.01.752 10.793 1.9 11.165l4.381 1.367L17.065 5.96c.53-.243 1.01-.105.615.345z" />
            </svg>
          </div>
          <a
            href="https://t.me/raisedotwin"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-blue-600 hover:underline"
          >
            Join our Telegram
          </a>
        </div>
      </div>
    </section>
  );
};

export default LatestActivity;

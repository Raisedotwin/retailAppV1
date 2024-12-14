import React from 'react';

const CommunityLinks = () => {
  const socialLinks = [
    {
      name: 'Twitter',
      url: 'https://x.com/raisedotwin',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M24 4.557a9.93 9.93 0 01-2.828.775 4.932 4.932 0 002.165-2.725 9.864 9.864 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482A13.956 13.956 0 011.671 3.149a4.928 4.928 0 001.524 6.573 4.902 4.902 0 01-2.228-.616v.062a4.922 4.922 0 003.946 4.827 4.903 4.903 0 01-2.224.084 4.924 4.924 0 004.6 3.419 9.868 9.868 0 01-6.102 2.104c-.395 0-.787-.023-1.175-.067a13.945 13.945 0 007.548 2.211c9.057 0 14.01-7.496 14.01-13.986 0-.213-.005-.426-.014-.637A10.025 10.025 0 0024 4.557z" />
        </svg>
      ),
      color: 'from-blue-400 to-blue-600',
      hoverColor: 'group-hover:from-blue-500 group-hover:to-blue-700',
      label: 'Follow us on Twitter',
      stats: '10K+ Followers'
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M23.498 6.186a2.84 2.84 0 00-1.996-2.016C19.42 3.513 12 3.513 12 3.513s-7.42 0-9.502.657A2.84 2.84 0 00.502 6.186C0 8.268 0 12 0 12s0 3.732.502 5.814a2.84 2.84 0 001.996 2.016c2.082.656 9.502.656 9.502.656s7.42 0 9.502-.657a2.84 2.84 0 001.996-2.016C24 15.732 24 12 24 12s0-3.732-.502-5.814zM9.546 15.568V8.432L15.818 12l-6.272 3.568z" />
        </svg>
      ),
      color: 'from-red-400 to-red-600',
      hoverColor: 'group-hover:from-red-500 group-hover:to-red-700',
      label: 'Subscribe to YouTube',
      stats: '5K+ Subscribers'
    },
    {
      name: 'Telegram',
      url: 'https://t.me/raisedotwin',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M9.222 13.92L8.946 18.2c.49 0 .71-.215.97-.471l2.33-2.21 4.831 3.524c.886.492 1.515.233 1.73-.823l3.13-14.62c.316-1.45-.486-2.022-1.43-1.668L2.116 9.56C.741 10.01.752 10.793 1.9 11.165l4.381 1.367L17.065 5.96c.53-.243 1.01-.105.615.345z" />
        </svg>
      ),
      color: 'from-blue-400 to-cyan-500',
      hoverColor: 'group-hover:from-blue-500 group-hover:to-cyan-600',
      label: 'Join Telegram',
      stats: '15K+ Members'
    }
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
        <p className="text-gray-600">Connect with us and stay updated on the latest developments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${social.color} ${social.hoverColor} opacity-10 transition-opacity duration-300 group-hover:opacity-20`} />
              
              <div className="relative p-8">
                {/* Icon and Label */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${social.color} flex items-center justify-center text-white transform transition-transform duration-300 group-hover:scale-110`}>
                    {social.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{social.label}</h3>
                    <p className="text-sm text-gray-600">{social.stats}</p>
                  </div>
                </div>

                {/* Join Button */}
                <div className="mt-6 text-center">
                  <span className={`inline-block px-6 py-2 rounded-full bg-gradient-to-r ${social.color} text-white text-sm font-medium transition-all duration-300 transform group-hover:scale-105`}>
                    Join Now
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default CommunityLinks;

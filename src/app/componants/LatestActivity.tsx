import React from 'react';

interface FloatingIconProps {
  children: React.ReactNode;
  delay?: string;
}

const FloatingIcon: React.FC<FloatingIconProps> = ({ children, delay = "0" }) => (
  <div className="relative">
    <div className="absolute inset-0 bg-white/50 rounded-full blur-xl"></div>
    <div 
      className="relative animate-float"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  </div>
);

const CommunityLinks: React.FC = () => {
  const socialLinks = [
    {
      name: 'X',
      url: 'https://x.com/raisedotwin',
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: 'from-gray-700 to-gray-900',
      hoverColor: 'group-hover:from-gray-800 group-hover:to-black',
      label: 'Follow us on X',
      stats: '10K+ Followers',
      bgDecoration: '✨'
    },
    {
      name: 'Telegram',
      url: 'https://t.me/raisedotwin',
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
          <path d="M9.222 13.92L8.946 18.2c.49 0 .71-.215.97-.471l2.33-2.21 4.831 3.524c.886.492 1.515.233 1.73-.823l3.13-14.62c.316-1.45-.486-2.022-1.43-1.668L2.116 9.56C.741 10.01.752 10.793 1.9 11.165l4.381 1.367L17.065 5.96c.53-.243 1.01-.105.615.345z" />
        </svg>
      ),
      color: 'from-blue-400 to-cyan-500',
      hoverColor: 'group-hover:from-blue-500 group-hover:to-cyan-600',
      label: 'Join Telegram',
      stats: '15K+ Members',
      bgDecoration: '💬'
    },
    {
      name: 'Docs',
      url: 'https://docs.google.com/document/d/1OH1hj-01vZyqifnXKdaqFqg8WARIBXEhnXe7A81uN5w/edit?tab=t.6bncxdjw1hly',
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1.99 6H7V7h10.01v2zm0 4H7v-2h10.01v2zm-3 4H7v-2h7.01v2z" />
        </svg>
      ),
      color: 'from-indigo-400 to-purple-500',
      hoverColor: 'group-hover:from-indigo-500 group-hover:to-purple-600',
      label: 'Read the Docs',
      stats: '500+ Pages',
      bgDecoration: '📚'
    },
  ];
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-block">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Join Our Community
          </h2>
          <div className="flex justify-center gap-2 mt-2">
            <span className="animate-bounce text-2xl" style={{ animationDelay: '0.1s' }}>🚀</span>
            <span className="animate-bounce text-2xl" style={{ animationDelay: '0.2s' }}>🌟</span>
            <span className="animate-bounce text-2xl" style={{ animationDelay: '0.3s' }}>✨</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {socialLinks.map((social, index) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              {/* Animated background decoration */}
              <div className="absolute top-4 right-4 text-4xl opacity-20 animate-pulse">
                {social.bgDecoration}
              </div>
              
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${social.color} ${social.hoverColor} opacity-5 transition-opacity duration-300 group-hover:opacity-10`} />
              
              <div className="relative p-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <FloatingIcon >
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${social.color} flex items-center justify-center text-white transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                      {social.icon}
                    </div>
                  </FloatingIcon>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{social.label}</h3>
                    <p className="text-sm text-gray-600 font-medium">{social.stats}</p>
                  </div>
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
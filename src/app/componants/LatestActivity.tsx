import React from 'react';

interface FloatingIconProps {
  children: React.ReactNode;
  delay?: string;
}

const FloatingIcon: React.FC<FloatingIconProps> = ({ children, delay = "0" }) => (
  <div className="relative">
    <div className="absolute inset-0 bg-indigo-50/50 rounded-xl blur-lg"></div>
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
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: 'bg-gray-900',
      label: 'Follow us on X',
      stats: '10K+ Followers',
      bgDecoration: '✨'
    },
    {
      name: 'Telegram',
      url: 'https://t.me/raisedotwin',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M9.222 13.92L8.946 18.2c.49 0 .71-.215.97-.471l2.33-2.21 4.831 3.524c.886.492 1.515.233 1.73-.823l3.13-14.62c.316-1.45-.486-2.022-1.43-1.668L2.116 9.56C.741 10.01.752 10.793 1.9 11.165l4.381 1.367L17.065 5.96c.53-.243 1.01-.105.615.345z" />
        </svg>
      ),
      color: 'bg-indigo-600',
      label: 'Join Telegram',
      stats: '15K+ Members',
      bgDecoration: '💬'
    },
    {
      name: 'Docs',
      url: 'https://docs.google.com/document/d/1OH1hj-01vZyqifnXKdaqFqg8WARIBXEhnXe7A81uN5w/edit?tab=t.6bncxdjw1hly',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1.99 6H7V7h10.01v2zm0 4H7v-2h10.01v2zm-3 4H7v-2h7.01v2z" />
        </svg>
      ),
      color: 'bg-indigo-600',
      label: 'Read the Docs',
      stats: '500+ Pages',
      bgDecoration: '📚'
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-semibold text-gray-900">
          Join Our Community
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <div className="relative overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-100">
              {/* Background decoration */}
              <div className="absolute top-3 right-3 text-2xl opacity-10">
                {social.bgDecoration}
              </div>
              
              <div className="relative p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <FloatingIcon>
                    <div className={`w-14 h-14 rounded-lg ${social.color} flex items-center justify-center text-white transform transition-all duration-300 group-hover:scale-105`}>
                      {social.icon}
                    </div>
                  </FloatingIcon>
                  
                  <div className="space-y-1">
                    <h3 className="text-base font-medium text-gray-900">{social.label}</h3>
                    <p className="text-sm text-gray-600">{social.stats}</p>
                  </div>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default CommunityLinks;
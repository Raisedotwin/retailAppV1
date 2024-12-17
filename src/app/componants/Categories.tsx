import React from 'react';

interface VideoCardProps {
  title: string;
  videoSrc: string;
  thumbnailSrc: string;
  icon: React.ReactNode;
  gradient: string;
  stepNumber: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ title, videoSrc, thumbnailSrc, icon, gradient, stepNumber }) => (
  <div className="group relative">
    {/* Background gradient blur */}
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 rounded-2xl blur-xl group-hover:opacity-20 transition-opacity duration-300`}></div>
    
    {/* Card content */}
    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Step number */}
      <div className="absolute -top-3 -right-3 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
        <span className={`text-lg font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {stepNumber}
        </span>
      </div>

      {/* Video container */}
      <div className="relative rounded-xl overflow-hidden mb-6 shadow-md group-hover:shadow-lg transition-shadow">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
        <video
          controls
          className="w-full rounded-xl transform transition-transform duration-300 group-hover:scale-[1.02]"
          src={videoSrc}
          poster={thumbnailSrc}
        />
      </div>

      {/* Title section */}
      <div className="flex items-center gap-3 justify-center">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center text-white`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
          {title}
        </h3>
      </div>
    </div>
  </div>
);

const BrowseCategories: React.FC = () => {
  const videos = [
    {
      title: "Fundraise",
      videoSrc: "/path-to-video-1.mp4",
      thumbnailSrc: "/path-to-thumbnail-1.jpg",
      gradient: "from-blue-400 to-purple-500",
      stepNumber: "01",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Trading",
      videoSrc: "/path-to-video-2.mp4",
      thumbnailSrc: "/path-to-thumbnail-2.jpg",
      gradient: "from-purple-400 to-pink-500",
      stepNumber: "02",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      title: "Buybacks",
      videoSrc: "/path-to-video-3.mp4",
      thumbnailSrc: "/path-to-thumbnail-3.jpg",
      gradient: "from-pink-400 to-rose-500",
      stepNumber: "03",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      {/* Title */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Video Walkthroughs
        </h2>
        <div className="flex justify-center gap-2">
          <span className="animate-bounce text-2xl" style={{ animationDelay: '0.1s' }}>🎥</span>
          <span className="animate-bounce text-2xl" style={{ animationDelay: '0.2s' }}>📱</span>
          <span className="animate-bounce text-2xl" style={{ animationDelay: '0.3s' }}>💡</span>
        </div>
      </div>

      {/* Video grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {videos.map((video, index) => (
          <VideoCard
            key={index}
            {...video}
          />
        ))}
      </div>
    </section>
  );
};

export default BrowseCategories;
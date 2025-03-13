/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'unavatar.io',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'abs.twimg.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        pathname: '**',
      }
    ],
  },
};

export default nextConfig;
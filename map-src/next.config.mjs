/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/map',
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
    ],
  },
};

export default nextConfig;

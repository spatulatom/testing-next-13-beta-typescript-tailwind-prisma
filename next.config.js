/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  // Turbopack is now default in Next.js 16+
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  reactCompiler: true,
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

module.exports = nextConfig;

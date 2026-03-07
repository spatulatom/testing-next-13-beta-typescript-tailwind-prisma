/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
    experimental: {
    // Enable filesystem caching for `next dev`- till the default is switched 
    // to `true` in a future release
    turbopackFileSystemCacheForDev: true,
    // Enable filesystem caching for `next build`
    // turbopackFileSystemCacheForBuild: true,
  },
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

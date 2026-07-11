/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@repo/ui'],

  experimental: {
    // Tree-shake heavy libraries imported by many modules.
    optimizePackageImports: ['@clerk/nextjs'],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  compress: true,
};

export default nextConfig;

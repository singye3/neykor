// next.config.js or next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true, // Or your existing config
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'ik.imagekit.io',
          port: '', // Default port (443 for https)
          pathname: '/neykor/**',
        },
      ],
    },
  };
  
  module.exports = nextConfig; // If using CommonJS (usually .js file)
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['lh3.googleusercontent.com'], // Add other domains as needed for profile pictures
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    // ... other config options
  };
  
  module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Mobile-first optimization

  // Image optimization settings
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [320, 375, 414, 768, 1024],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // PWA and performance optimizations
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'x-content-type-options',
            value: 'nosniff',
          },
          {
            key: 'x-frame-options',
            value: 'DENY',
          },
          {
            key: 'x-xss-protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },

  // Compression for better mobile performance
  compress: true,

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig 
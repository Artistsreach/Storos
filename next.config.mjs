/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true, // Recommended for development
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com', // For Shopify images
      },
      {
        // For data URIs, which might be used for AI-generated or uploaded images temporarily
        // Note: This is a broad pattern. For production, you might want more specific handling
        // or to upload these images to a proper storage service.
        protocol: 'data', 
        hostname: '', // Hostname is not applicable for data URIs
        pathname: '**', // Allows any path for data URIs
      }
    ],
  },
};

export default nextConfig;

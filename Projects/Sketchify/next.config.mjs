/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.convex.cloud', // Allow images from any Convex deployment
            },
        ],
    },
};

export default nextConfig;
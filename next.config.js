/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true, // Set this to true for better error handling and optimization.
  
  // Remove console logs only in production and only for client-side code.
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" && !process.env.NEXT_PRIVATE_SERVER, // Ensure server-side logs are not removed
  },

  experimental: {
    serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "/**",
      },
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'aniwatchtv.to',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media2.giphy.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Additional options can go here as needed
  // For example, you might want to configure custom headers, redirects, etc.
  // async redirects() {
  //   return [
  //     {
  //       source: '/old-url',
  //       destination: '/new-url',
  //       permanent: true,
  //     },
  //   ];
  // },
}

module.exports = nextConfig;

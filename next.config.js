/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
  },
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
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
    ],
},
}

module.exports = nextConfig

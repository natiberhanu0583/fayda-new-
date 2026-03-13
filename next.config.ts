/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.affiliate.pro.et',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'faydaprint.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/remote-images/:path*',
        destination: 'https://api.affiliate.pro.et/images/:path*',
      },
    ]
  },
}

export default nextConfig
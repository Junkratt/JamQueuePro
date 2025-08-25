/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    esmExternals: false,
  },
  // Disable static optimization completely
  trailingSlash: false,
  generateEtags: false,
  poweredByHeader: false,
}

module.exports = nextConfig

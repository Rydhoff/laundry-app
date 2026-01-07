import type { NextConfig } from 'next'

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
})

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ⬇️ PAKSA WEBPACK (MATIKAN TURBOPACK)
  turbopack: {},
}

export default withPWA(nextConfig)

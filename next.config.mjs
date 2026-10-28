// next.config.mjs
// Updated configuration with ESLint disabled for deployment

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
  },
  // Security headers on every response. No iframes of the site are used
  // (incl. by the Studio), so framing is restricted to the site itself.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
        ],
      },
    ]
  },
  // Article tiles link to /insights/<slug> (for new tabs, sharing and search
  // engines); articles actually open as an overlay on the homepage. /contact
  // was an old copy of the homepage.
  async redirects() {
    return [
      { source: '/insights/:slug', destination: '/?article=:slug', permanent: false },
      { source: '/insights', destination: '/?insights=all', permanent: false },
      { source: '/contact', destination: '/', permanent: true },
    ]
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
}

export default nextConfig
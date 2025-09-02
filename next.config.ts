// next.config.ts
import type { NextConfig } from 'next';

function makeCSP() {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      {
        protocol: 'https',
        hostname: 'covrlthxywrlxpogrlef.supabase.co',
        pathname: '/storage/v1/object/public/avatars/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 3600, // ↑ cache del optimizador (seguro con versión)
    deviceSizes: [360, 414, 640, 768, 1024],
    imageSizes: [32, 48, 64, 96, 160, 256],
  },
  async headers() {
    const csp = makeCSP();
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ];
  },
  experimental: {
    ppr: 'incremental',
    viewTransition: true,
  },
};

export default nextConfig;

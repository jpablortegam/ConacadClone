// next.config.ts
import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

function makeCSP() {
  // Añade aquí dominios extra en connect/img si los necesitas
  return [
    "default-src 'self'",
    // Scripts: en dev necesitas 'unsafe-eval' por el overlay de React
    `script-src 'self' ${isProd ? '' : "'unsafe-eval'"} 'unsafe-inline'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // "upgrade-insecure-requests" // <- opcional en prod si todo es https
  ]
    .filter(Boolean)
    .join('; ');
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // usa el host exacto de tu proyecto Supabase:
      // ...(process.env.NEXT_PUBLIC_SUPABASE_URL
      //   ? [{ protocol: 'https', hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname }]
      //   : []),
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400,
  },
  async headers() {
    const csp = makeCSP();
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' }, // obsoleto, pero inofensivo
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;

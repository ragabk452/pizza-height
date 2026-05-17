import type { NextConfig } from 'next';

const withBundleAnalyzer =
  process.env.ANALYZE === 'true'
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@next/bundle-analyzer')({ enabled: true })
    : (config: NextConfig) => config;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,

  // NOTE: every <img> in this app is a plain HTML tag (not next/image),
  // so `images.remotePatterns` would be dead config. Add it back together
  // with the next/image migration when that lands.

  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'sonner'],
  },

  async headers() {
    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
      },
    ];
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default withBundleAnalyzer(nextConfig);

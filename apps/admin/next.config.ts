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

  // NOTE: admin uses plain <img> tags (read-only menu thumbnail etc).
  // Add `images.remotePatterns` only when migrating to next/image.

  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'sonner'],
  },

  async headers() {
    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
    ];
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default withBundleAnalyzer(nextConfig);

// Fail-fast in production if the security-critical secrets aren't set.
// `DATABASE_URL` is consulted by Prisma directly, but we mirror it here so
// the error surfaces at boot rather than the first query.
function requireInProd(
  name: string,
  value: string | undefined,
  dev: string,
): string {
  if (value && value.length > 0) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      `Missing required env var "${name}" (NODE_ENV=production).`,
    );
  }
  return dev;
}

export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  corsOrigins: (
    process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:3001'
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  database: {
    url: requireInProd('DATABASE_URL', process.env.DATABASE_URL, ''),
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },
  jwt: {
    secret: requireInProd(
      'JWT_SECRET',
      process.env.JWT_SECRET,
      'dev-only-jwt-secret',
    ),
    accessExpiry: process.env.JWT_ACCESS_EXPIRY ?? '15m',
    refreshSecret: requireInProd(
      'JWT_REFRESH_SECRET',
      process.env.JWT_REFRESH_SECRET,
      'dev-only-jwt-refresh-secret',
    ),
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY ?? '7d',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  // Paymob sandbox. Leave any value blank to fall back to the in-process
  // MockPaymobClient (which still exercises the full session→iframe→webhook
  // flow against the web app's /payment/mock page).
  paymob: {
    apiKey: process.env.PAYMOB_API_KEY,
    integrationId: process.env.PAYMOB_INTEGRATION_ID,
    iframeId: process.env.PAYMOB_IFRAME_ID,
    hmacSecret: process.env.PAYMOB_HMAC_SECRET,
    // Where the mock iframe URL points. Defaults to the dev web app.
    mockBaseUrl: process.env.PAYMOB_MOCK_BASE_URL ?? 'http://localhost:3000',
  },
  throttle: {
    ttl: 60_000, // 1 minute
    limit: 100, // 100 requests per minute
  },
});

export type AppConfig = ReturnType<typeof import('./configuration').default>;

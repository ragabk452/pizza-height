/**
 * The public origin where this site is served.
 *
 * Read once at module load. In production the env var MUST be set —
 * otherwise sitemap, robots, canonical URLs, OG tags, and JSON-LD `@id`s
 * all silently bake the wrong domain and search engines drop the result
 * with a canonical-mismatch warning. We surface the misconfiguration
 * loudly at boot rather than letting it leak into prod traffic.
 *
 * In dev we fall back to localhost:3000 for convenience.
 */
function resolve(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_APP_URL is required in production — sitemap.xml, robots.txt, ' +
        'canonical URLs, OG tags, and JSON-LD @id all depend on it. ' +
        'Set it in Vercel project Environment Variables (Production scope).',
    );
  }

  return 'http://localhost:3000';
}

export const SITE_URL = resolve();

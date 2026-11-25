import 'dotenv/config';

export interface SitecoreConfig {
  url: string;
  user: string;
  password: string;
  env: string;
}

const REQUIRED = ['SITECORE_URL', 'SITECORE_USER', 'SITECORE_PASSWORD'] as const;

/**
 * Keeps only scheme and host. Code appends its own paths (for example /sitecore/login), so any path
 * left in SITECORE_URL would be doubled and Sitecore would reroute to an unauthorized page.
 */
function siteOrigin(raw: string): string {
  try {
    return new URL(raw.trim()).origin;
  } catch {
    throw new Error(
      'SITECORE_URL is not a valid URL. Use the site address only, for example https://host.example.com',
    );
  }
}

/** Loads Sitecore settings from .env. Reports missing variable NAMES only, never values. */
export function getSitecoreConfig(): SitecoreConfig {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(
      `Missing env variables: ${missing.join(', ')}. ` +
        'Use names without spaces (dotenv cannot parse "Current User Id").',
    );
  }
  const env = (process.env.SITECORE_ENV ?? 'int').toLowerCase();
  if (env === 'prod') throw new Error('Authoring automation is blocked on production.');
  return {
    url: siteOrigin(process.env.SITECORE_URL!),
    user: process.env.SITECORE_USER!,
    password: process.env.SITECORE_PASSWORD!,
    env,
  };
}

import 'dotenv/config';

/**
 * Read-only Confluence connectivity check. Prints status only, never credentials.
 * Env: CONFLUENCE_URL (e.g. https://yourco.atlassian.net/wiki or https://confluence.yourco.com),
 *      CONFLUENCE_API_TOKEN, CONFLUENCE_SPACE (space key),
 *      CONFLUENCE_EMAIL (Cloud: basic auth email+token; omit for Data Center PAT bearer auth).
 */
(async () => {
  const need = ['CONFLUENCE_URL', 'CONFLUENCE_API_TOKEN', 'CONFLUENCE_SPACE'];
  const missing = need.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`Missing env variables: ${missing.join(', ')}`);
    process.exit(1);
  }
  const base = process.env.CONFLUENCE_URL!.replace(/\/+$/, '');
  const token = process.env.CONFLUENCE_API_TOKEN!;
  const email = process.env.CONFLUENCE_EMAIL;
  const space = process.env.CONFLUENCE_SPACE!;
  const auth = email ? `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}` : `Bearer ${token}`;

  const res = await fetch(`${base}/rest/api/space/${encodeURIComponent(space)}`, {
    headers: { Authorization: auth, Accept: 'application/json' },
    redirect: 'manual',
  });
  console.log(`Host: ${new URL(base).host} | auth: ${email ? 'basic' : 'bearer'} | HTTP ${res.status}`);
  const loc = res.headers.get('location');
  if (loc) {
    const u = new URL(loc, base);
    console.log(`Redirects to: ${u.host}${u.pathname}`);
  }
  if (res.ok) {
    const j = (await res.json()) as { key?: string; name?: string };
    console.log(`CONFLUENCE OK. Space "${j.key}" (${j.name}) is readable.`);
  } else {
    const hint: Record<number, string> = {
      301: 'Redirect: check CONFLUENCE_URL (Cloud usually needs /wiki at the end).',
      302: 'Redirect (often SSO/Cloudflare gate): check CONFLUENCE_URL.',
      401: 'Unauthorized: token/email wrong or expired.',
      403: 'Forbidden: token valid but no access to this space.',
      404: 'Not found: wrong space key or missing /wiki in CONFLUENCE_URL.',
    };
    console.error(`CONFLUENCE FAILED. ${hint[res.status] ?? 'Unexpected response.'}`);
    process.exitCode = 1;
  }
})();

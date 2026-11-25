import { required } from '../integrations/config';

// Usage: npm run check:figma
// Calls Figma's /v1/me with FIGMA_TOKEN. Prints only the result, never the token.
async function main(): Promise<void> {
  const res = await fetch('https://api.figma.com/v1/me', {
    headers: { 'X-Figma-Token': required('FIGMA_TOKEN') },
  });
  if (res.ok) {
    const me = (await res.json()) as { handle?: string };
    console.log(`Figma connection OK (user: ${me.handle ?? 'unknown'})`);
    return;
  }
  const hint = res.status === 403 ? 'token invalid, expired or missing scopes' : res.statusText;
  console.error(`Figma connection FAILED: ${res.status} ${hint}`);
  process.exit(1);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

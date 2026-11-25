import 'dotenv/config';
import { chromium, Page } from '@playwright/test';
import * as fs from 'fs';
import * as readline from 'readline';

const STATE = '.auth/servicenow.json';
const TIMEOUT_MS = 5 * 60_000;

/**
 * Headed browser: YOU log in to ServiceNow (SSO/MFA included); this script never sees or stores credentials.
 * It waits until you land on the instance, then saves the browser session to .auth/servicenow.json (git-ignored).
 * Env: SERVICENOW_URL (e.g. https://loreal.service-now.com). Pass --yes to skip the confirmation prompt.
 */
(async () => {
  const raw = (process.env.SERVICENOW_URL ?? '').trim().replace(/\/+$/, '');
  if (!raw || raw.includes('<')) {
    console.error('Set SERVICENOW_URL in .env to your instance, e.g. https://loreal.service-now.com');
    process.exit(1);
  }
  const base = new URL(raw);
  fs.mkdirSync('.auth', { recursive: true });

  if (!process.argv.includes('--yes')) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise<string>((res) =>
      rl.question(`Open a FRESH browser for ServiceNow (${base.host}) and log in manually? [y/N] `, res),
    );
    rl.close();
    if (!/^y(es)?$/i.test(answer.trim())) {
      console.log('Cancelled. No browser opened, existing session left untouched.');
      return;
    }
  }
  if (fs.existsSync(STATE)) {
    fs.rmSync(STATE);
    console.log('Previous saved session deleted.');
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext(); // no storageState => clean cookies
  const page = await context.newPage();
  await page.goto(`${base.origin}/`);
  console.log('Browser opened. Complete the ServiceNow login now (up to 5 minutes)...');

  // Logged in = back on the instance host, past the login/SSO pages, inside the app UI.
  const insideApp = (p: Page): boolean => {
    const u = new URL(p.url());
    if (u.host !== base.host) return false; // still on the SSO provider
    const path = u.pathname.toLowerCase();
    if (path.includes('login') || path.includes('logout') || path.includes('/auth')) return false;
    return /^\/(now\/|nav_to\.do|home|sp(\/|$))/.test(path);
  };

  const deadline = Date.now() + TIMEOUT_MS;
  let ok = false;
  while (Date.now() < deadline) {
    await page.waitForTimeout(1500);
    if (insideApp(page)) {
      ok = true;
      break;
    }
  }

  if (ok) {
    await context.storageState({ path: STATE });
    console.log(`LOGIN OK. Landed on: ${new URL(page.url()).pathname}. Session saved to ${STATE}.`);
    console.log('Sessions expire; re-run this script when ServiceNow asks you to log in again.');
  } else {
    await page.screenshot({ path: '.auth/servicenow-login-failure.png' }).catch(() => {});
    console.error('LOGIN NOT COMPLETED within 5 minutes. Screenshot: .auth/servicenow-login-failure.png');
    process.exitCode = 1;
  }
  await browser.close();
})();

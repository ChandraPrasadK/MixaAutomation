import { chromium, BrowserContext, Page } from '@playwright/test';
import * as fs from 'fs';
import * as readline from 'readline';
import { getSitecoreConfig } from '../utils/sitecoreEnv';

const STATE = '.auth/sitecore.json';
const TIMEOUT_MS = 5 * 60_000;

/** True when the Sitecore shell opens for this session instead of redirecting to the login page. */
async function isSitecoreAuthenticated(context: BrowserContext, baseUrl: string): Promise<boolean> {
  const check = await context.newPage();
  try {
    await check.goto(`${baseUrl}/sitecore/shell/default.aspx`, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    const onLogin = new URL(check.url()).pathname.toLowerCase().includes('/sitecore/login');
    const passwordShown = await check
      .locator('input[type="password"]')
      .first()
      .isVisible()
      .catch(() => false);
    return !onLogin && !passwordShown;
  } catch {
    return false;
  } finally {
    await check.close();
  }
}

/** Headed browser: YOU complete Cloudflare Access / SSO; script handles the Sitecore form and saves the session. */
(async () => {
  const cfg = getSitecoreConfig();
  const host = new URL(cfg.url).host;
  fs.mkdirSync('.auth', { recursive: true });

  // Always a fresh login: ask first, discard any previous session, never reuse it.
  if (!process.argv.includes('--yes')) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise<string>((res) =>
      rl.question(`Open a FRESH browser for Sitecore (${cfg.env}, ${host}) and log in manually? [y/N] `, res),
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
  await page.goto(`${cfg.url}/sitecore/login`);
  console.log('Browser opened. Complete the Cloudflare Access / SSO login now (up to 5 minutes)...');

  const onHost = (p: Page) => new URL(p.url()).host === host;
  const deadline = Date.now() + TIMEOUT_MS;
  let filled = false;
  let ok = false;

  while (Date.now() < deadline) {
    await page.waitForTimeout(1500);
    if (!onHost(page)) continue; // still on Cloudflare / Azure AD
    const pwd = page.locator('input[type="password"]').first();
    if (await pwd.isVisible().catch(() => false)) {
      if (filled) continue; // already submitted; wait for navigation
      await page.locator('#UserName, input[name="UserName"], input[type="text"]').first().fill(cfg.user);
      await pwd.fill(cfg.password);
      await page.locator('#LoginButton, input[type="submit"], button[type="submit"]').first().click();
      filled = true;
      console.log('Sitecore form submitted.');
      continue;
    }
    if (!new URL(page.url()).pathname.toLowerCase().includes('/sitecore/login')) {
      // Not on the login form does not prove we are logged in (Cloudflare may just have let us through).
      // Confirm by opening the Content Editor in a second tab: it must load without a login redirect.
      if (await isSitecoreAuthenticated(context, cfg.url)) {
        ok = true;
        break;
      }
    }
  }

  if (ok) {
    await context.storageState({ path: STATE });
    console.log(
      `LOGIN OK. Landed on: ${new URL(page.url()).pathname}. Session saved to ${STATE} (valid ~1 day).`,
    );
  } else {
    await page.screenshot({ path: '.auth/login-failure.png' }).catch(() => {});
    console.error('LOGIN NOT COMPLETED within 5 minutes. Screenshot: .auth/login-failure.png');
    process.exitCode = 1;
  }
  await browser.close();
})();

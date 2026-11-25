import { chromium } from '@playwright/test';
import * as fs from 'fs';
import { getSitecoreConfig } from '../utils/sitecoreEnv';
import { SitecoreLoginPage } from '../pages/sitecore/SitecoreLoginPage';

(async () => {
  const cfg = getSitecoreConfig();
  console.log(`Checking Sitecore login on env="${cfg.env}" host=${new URL(cfg.url).host}`);
  const browser = await chromium.launch();
  const context = await browser.newContext({ ignoreHTTPSErrors: false });
  const page = await context.newPage();
  fs.mkdirSync('.auth', { recursive: true });
  try {
    await new SitecoreLoginPage(page).login(cfg);
    await context.storageState({ path: '.auth/sitecore.json' });
    console.log(`LOGIN OK. Landed on: ${new URL(page.url()).pathname}. Session saved to .auth/sitecore.json`);
  } catch (e) {
    await page.screenshot({ path: '.auth/login-failure.png' }).catch(() => {});
    console.error(
      `LOGIN FAILED: ${(e as Error).message.split('\n')[0]}. Screenshot: .auth/login-failure.png`,
    );
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

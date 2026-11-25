import { Page, expect } from '@playwright/test';
import { SitecoreConfig } from '@utils/sitecoreEnv';

/** Classic Sitecore XP/XM CM login (/sitecore/login). Selectors may need tuning per version. */
export class SitecoreLoginPage {
  constructor(private readonly page: Page) {}

  private userInput = () =>
    this.page.locator('#UserName, input[name="UserName"], input[type="text"]').first();
  private passwordInput = () =>
    this.page.locator('#Password, input[name="Password"], input[type="password"]').first();
  private submit = () =>
    this.page.locator('#LoginButton, input[type="submit"], button[type="submit"]').first();

  async login(cfg: SitecoreConfig): Promise<void> {
    await this.page.goto(`${cfg.url}/sitecore/login`);
    await this.userInput().fill(cfg.user);
    await this.passwordInput().fill(cfg.password);
    await this.submit().click();
    // Wait for the login form to disappear; if it stays, the login failed.
    await expect(this.passwordInput(), 'Login failed: password field still visible').toBeHidden({
      timeout: 15_000,
    });
  }
}

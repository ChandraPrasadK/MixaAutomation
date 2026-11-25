import { Page } from '@playwright/test';
import { HeaderComponent } from '@components/HeaderComponent';
import { FooterComponent } from '@components/FooterComponent';
import { CookieBannerComponent } from '@components/CookieBannerComponent';

export abstract class BasePage {
  readonly header: HeaderComponent;
  readonly footer: FooterComponent;
  readonly cookieBanner: CookieBannerComponent;

  constructor(protected readonly page: Page) {
    this.header = new HeaderComponent(page.getByRole('banner'));
    this.footer = new FooterComponent(page.getByRole('contentinfo'));
    this.cookieBanner = new CookieBannerComponent(page.locator('#onetrust-banner-sdk').first());
  }

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
    await this.cookieBanner.accept();
  }
}

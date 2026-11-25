import { Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export class HeaderComponent extends BaseComponent {
  readonly logo: Locator = this.root.getByRole('link', { name: /mixa/i }).first();
  readonly navLinks: Locator = this.root.getByRole('navigation').getByRole('link');
  readonly searchButton: Locator = this.root.getByRole('button', { name: /search|recherch/i });

  async openNavItem(name: string | RegExp): Promise<void> {
    await this.navLinks.filter({ hasText: name }).first().click();
  }

  async clickLogo(): Promise<void> {
    await this.logo.click();
  }
}

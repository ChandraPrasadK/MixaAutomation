import { Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export class MarketplaceSelectorComponent extends BaseComponent {
  readonly retailers: Locator = this.root.getByRole('link');

  async selectRetailer(name: string | RegExp): Promise<void> {
    await this.root.getByRole('link', { name }).click();
  }
}

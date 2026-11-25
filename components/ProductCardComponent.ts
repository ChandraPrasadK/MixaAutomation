import { Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export class ProductCardComponent extends BaseComponent {
  readonly title: Locator = this.root.getByRole('heading').first();
  readonly link: Locator = this.root.getByRole('link').first();
  readonly image: Locator = this.root.getByRole('img').first();

  async open(): Promise<void> {
    await this.link.click();
  }
}

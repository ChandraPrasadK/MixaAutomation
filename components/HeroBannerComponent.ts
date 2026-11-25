import { Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export class HeroBannerComponent extends BaseComponent {
  readonly heading: Locator = this.root.getByRole('heading').first();
  readonly cta: Locator = this.root.getByRole('link').first();
}

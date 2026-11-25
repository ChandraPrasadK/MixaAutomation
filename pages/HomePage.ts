import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { HeroBannerComponent } from '@components/HeroBannerComponent';
import { ProductCardComponent } from '@components/ProductCardComponent';

export class HomePage extends BasePage {
  readonly hero: HeroBannerComponent;

  constructor(page: Page) {
    super(page);
    this.hero = new HeroBannerComponent(page.getByTestId('hero-banner').first());
  }

  productCard(index = 0): ProductCardComponent {
    return new ProductCardComponent(this.page.getByTestId('product-card').nth(index));
  }

  async open(): Promise<void> {
    await this.goto('/');
  }
}

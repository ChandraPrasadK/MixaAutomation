import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { FiltersPanelComponent } from '@components/FiltersPanelComponent';
import { ProductCardComponent } from '@components/ProductCardComponent';

export class ProductListingPage extends BasePage {
  readonly filters: FiltersPanelComponent;
  readonly cards: Locator;

  constructor(page: Page) {
    super(page);
    this.filters = new FiltersPanelComponent(page.getByTestId('filters-panel'));
    this.cards = page.getByTestId('product-card');
  }

  productCard(index = 0): ProductCardComponent {
    return new ProductCardComponent(this.cards.nth(index));
  }

  async open(path: string): Promise<void> {
    await this.goto(path);
  }
}

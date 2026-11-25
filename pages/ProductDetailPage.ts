import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ProductGalleryComponent } from '@components/ProductGalleryComponent';
import { AccordionComponent } from '@components/AccordionComponent';
import { RatingsReviewsComponent } from '@components/RatingsReviewsComponent';
import { MarketplaceSelectorComponent } from '@components/MarketplaceSelectorComponent';

export class ProductDetailPage extends BasePage {
  readonly title: Locator;
  readonly gallery: ProductGalleryComponent;
  readonly accordion: AccordionComponent;
  readonly reviews: RatingsReviewsComponent;
  readonly marketplace: MarketplaceSelectorComponent;

  constructor(page: Page) {
    super(page);
    this.title = page.getByRole('heading', { level: 1 });
    this.gallery = new ProductGalleryComponent(page.getByTestId('product-gallery'));
    this.accordion = new AccordionComponent(page.getByTestId('product-accordion'));
    this.reviews = new RatingsReviewsComponent(page.getByTestId('ratings-reviews'));
    this.marketplace = new MarketplaceSelectorComponent(page.getByTestId('marketplace-selector'));
  }

  async open(path: string): Promise<void> {
    await this.goto(path);
  }
}

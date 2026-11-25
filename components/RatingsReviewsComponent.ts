import { Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export class RatingsReviewsComponent extends BaseComponent {
  readonly averageRating: Locator = this.root.getByTestId('average-rating');
  readonly reviews: Locator = this.root.getByTestId('review');
}

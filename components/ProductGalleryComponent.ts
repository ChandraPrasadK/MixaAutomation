import { Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export class ProductGalleryComponent extends BaseComponent {
  readonly images: Locator = this.root.getByRole('img');
  readonly thumbnails: Locator = this.root.getByRole('button');

  async selectThumbnail(index: number): Promise<void> {
    await this.thumbnails.nth(index).click();
  }
}

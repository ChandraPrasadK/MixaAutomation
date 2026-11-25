import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ArticlePage extends BasePage {
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByRole('heading', { level: 1 });
  }

  async open(path: string): Promise<void> {
    await this.goto(path);
  }
}

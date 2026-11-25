import { Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export class FooterComponent extends BaseComponent {
  readonly links: Locator = this.root.getByRole('link');

  linkByName(name: string | RegExp): Locator {
    return this.root.getByRole('link', { name });
  }
}

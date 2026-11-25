import { Locator } from '@playwright/test';

// Components are scoped to a root locator; never search the whole page from here.
export abstract class BaseComponent {
  constructor(protected readonly root: Locator) {}

  get container(): Locator {
    return this.root;
  }
}

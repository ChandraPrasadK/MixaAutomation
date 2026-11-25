import { Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export class AccordionComponent extends BaseComponent {
  readonly headers: Locator = this.root.getByRole('button');

  async toggle(title: string | RegExp): Promise<void> {
    await this.root.getByRole('button', { name: title }).click();
  }

  async isExpanded(title: string | RegExp): Promise<boolean> {
    return (await this.root.getByRole('button', { name: title }).getAttribute('aria-expanded')) === 'true';
  }
}

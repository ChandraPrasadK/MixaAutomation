import { Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export class FiltersPanelComponent extends BaseComponent {
  readonly options: Locator = this.root.getByRole('checkbox');

  async applyFilter(name: string | RegExp): Promise<void> {
    await this.root.getByRole('checkbox', { name }).check();
  }
}

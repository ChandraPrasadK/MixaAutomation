import { Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export class CookieBannerComponent extends BaseComponent {
  readonly acceptButton: Locator = this.root.getByRole('button', { name: /accept|accepter/i });
  readonly rejectButton: Locator = this.root.getByRole('button', { name: /reject|refuser/i });

  async accept(): Promise<void> {
    if (await this.acceptButton.isVisible()) await this.acceptButton.click();
  }
}

import { test, expect } from '@fixtures/testFixtures';
import { Tags } from '@utils/tags';

test.describe('Product listing page', () => {
  // TODO: set the real PLP path once confirmed on the site.
  test.fixme('shows product cards', { tag: [Tags.regression] }, async ({ plpPage }) => {
    await plpPage.open('/products');
    await expect(plpPage.cards.first()).toBeVisible();
  });
});

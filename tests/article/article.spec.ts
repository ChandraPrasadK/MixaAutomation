import { test, expect } from '@fixtures/testFixtures';
import { Tags } from '@utils/tags';

test.describe('Article page', () => {
  // TODO: set a real article path once confirmed on the site.
  test.fixme('shows the article title', { tag: [Tags.regression] }, async ({ articlePage }) => {
    await articlePage.open('/articles');
    await expect(articlePage.title).toBeVisible();
  });
});

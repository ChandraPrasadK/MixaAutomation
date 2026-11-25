import { test, expect } from '@fixtures/testFixtures';
import { Tags } from '@utils/tags';
import { Links } from '@utils/links';
import { products } from '@test-data/testData';

test.describe('Product detail page', () => {
  for (const product of products) {
    test(
      `shows title for ${product.name}`,
      {
        tag: [Tags.smoke, Tags.regression],
        annotation: [...Links.qtest(1001), ...Links.story('STRY0000000')],
      },
      async ({ pdpPage }) => {
        await pdpPage.open(product.path);
        await expect(pdpPage.title).toContainText(product.expectedTitle);
      },
    );
  }
});

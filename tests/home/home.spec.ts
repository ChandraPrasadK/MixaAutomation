import { test, expect } from '@fixtures/testFixtures';
import { expectNoSeriousA11yViolations } from '@utils/assertions';
import { Tags } from '@utils/tags';
import { locales } from '@test-data/testData';

test.describe('Home page', () => {
  test('loads with header and footer', { tag: [Tags.smoke] }, async ({ homePage }) => {
    await homePage.open();
    await expect(homePage.header.container).toBeVisible();
    await expect(homePage.footer.container).toBeVisible();
  });

  test('has no serious accessibility violations', { tag: [Tags.a11y] }, async ({ page, homePage }) => {
    await homePage.open();
    await expectNoSeriousA11yViolations(page);
  });

  for (const l of locales) {
    test(
      `${l.locale} uses the correct language`,
      { tag: [Tags.localization] },
      async ({ page, homePage }) => {
        await page.goto(l.baseUrl);
        await homePage.cookieBanner.accept();
        await expect(page.locator('html')).toHaveAttribute('lang', new RegExp(`^${l.language}`));
      },
    );
  }
});

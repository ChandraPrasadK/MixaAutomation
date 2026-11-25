import { test as base, expect } from '@playwright/test';
import { HomePage } from '@pages/HomePage';
import { ProductListingPage } from '@pages/ProductListingPage';
import { ProductDetailPage } from '@pages/ProductDetailPage';
import { ArticlePage } from '@pages/ArticlePage';

type Fixtures = {
  homePage: HomePage;
  plpPage: ProductListingPage;
  pdpPage: ProductDetailPage;
  articlePage: ArticlePage;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => use(new HomePage(page)),
  plpPage: async ({ page }, use) => use(new ProductListingPage(page)),
  pdpPage: async ({ page }, use) => use(new ProductDetailPage(page)),
  articlePage: async ({ page }, use) => use(new ArticlePage(page)),
});

export { expect };

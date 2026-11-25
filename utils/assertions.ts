import { expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export async function expectNoSeriousA11yViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious, serious.map((v) => `${v.id}: ${v.help}`).join('\n')).toEqual([]);
}

export async function expectPageTitleNotEmpty(page: Page): Promise<void> {
  await expect(page).toHaveTitle(/.+/);
}

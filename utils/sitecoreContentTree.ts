import { Locator } from '@playwright/test';

/**
 * Read-only helpers for the Sitecore Content Editor tree (Sitecore 10.4).
 * Item names are matched exactly. Names are escaped, so characters such as "(" or "." are safe.
 */
export const NODE = 'a.scContentTreeNodeNormal, a.scContentTreeNodeActive';

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function anchorOf(scope: Locator, name: string): Locator {
  return scope
    .locator(NODE)
    .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(name)}\\s*$`) })
    .first();
}

/** The container that holds the children of a node (it follows the node link inside the same element). */
export function kidsOf(anchor: Locator): Locator {
  return anchor.locator('xpath=following-sibling::div[1]');
}

async function expandIfNeeded(anchor: Locator, nextName: string): Promise<Locator> {
  const kids = kidsOf(anchor);
  const next = anchorOf(kids, nextName);
  if (!(await next.isVisible().catch(() => false))) {
    await anchor.locator('xpath=..').locator('img.scContentTreeNodeGlyph').first().click();
    await next.waitFor({ state: 'visible', timeout: 20_000 });
  }
  return kids;
}

/** Expands the tree along the path (item names) and returns the link of the last item. */
export async function expandTo(tree: Locator, path: string[]): Promise<Locator> {
  let scope = tree;
  let last = scope;
  for (let i = 0; i < path.length; i += 1) {
    const anchor = anchorOf(scope, path[i]);
    await anchor.waitFor({ state: 'visible', timeout: 20_000 });
    last = anchor;
    if (i < path.length - 1) scope = await expandIfNeeded(anchor, path[i + 1]);
  }
  return last;
}

/** Names of the direct children of a node (expands it when needed). */
export async function childNames(anchor: Locator): Promise<string[]> {
  const kids = kidsOf(anchor);
  if ((await kids.locator(NODE).count()) === 0) {
    const glyph = anchor.locator('xpath=..').locator('img.scContentTreeNodeGlyph').first();
    const src = (await glyph.getAttribute('src').catch(() => '')) ?? '';
    if (!src.includes('noexpand')) {
      await glyph.click().catch(() => undefined);
      await kids
        .locator(NODE)
        .first()
        .waitFor({ state: 'visible', timeout: 8_000 })
        .catch(() => undefined);
    }
  }
  const names = await kids.locator(NODE).allInnerTexts();
  return names.map((n) => n.trim()).filter(Boolean);
}

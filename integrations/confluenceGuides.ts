import * as fs from 'fs';
import { config, dryRun } from './config';

/**
 * Helpers to find, read, update and create user guide pages in Confluence.
 * Reads are always real (they are safe). Writes only log unless DRY_RUN=false (see CONTRIBUTING.md).
 */

export const GUIDES_SPACE = 'WSFMIXA';
export const GUIDES_PARENT_ID = '984878379'; // "13 - [Mixa] User guides and training materials"
export const GUIDE_TEMPLATE_ID = '993494981'; // "User Guide - Template"

export interface GuidePage {
  id: string;
  title: string;
  version: number;
  spaceKey: string;
  storage: string;
  labels: string[];
}

interface ContentResponse {
  id: string;
  title: string;
  version: { number: number };
  space: { key: string };
  body?: { storage: { value: string } };
  metadata?: { labels?: { results: { name: string }[] } };
}

function authHeader(): string {
  const { email } = config.confluence;
  const token = config.confluence.token();
  return email ? `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}` : `Bearer ${token}`;
}

async function api<T>(method: 'GET' | 'POST' | 'PUT', path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${config.confluence.url()}${path}`, {
    method,
    headers: { Authorization: authHeader(), Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${path.split('?')[0]} failed: HTTP ${res.status}`);
  return (res.status === 204 ? undefined : await res.json()) as T;
}

function toGuidePage(r: ContentResponse): GuidePage {
  return {
    id: r.id,
    title: r.title,
    version: r.version.number,
    spaceKey: r.space.key,
    storage: r.body?.storage.value ?? '',
    labels: (r.metadata?.labels?.results ?? []).map((l) => l.name),
  };
}

export async function getGuidePage(id: string): Promise<GuidePage> {
  const r = await api<ContentResponse>(
    'GET',
    `/rest/api/content/${id}?expand=body.storage,version,space,metadata.labels`,
  );
  return toGuidePage(r);
}

/** Finds guide pages under the guides parent whose title contains the text. Returns id, title and labels. */
export async function findGuidePages(
  text: string,
): Promise<{ id: string; title: string; labels: string[] }[]> {
  const safe = text.replace(/["\\]/g, ' ').trim();
  const cql = encodeURIComponent(
    `space = "${GUIDES_SPACE}" and type = page and ancestor = ${GUIDES_PARENT_ID} and title ~ "${safe}"`,
  );
  const r = await api<{ results: ContentResponse[] }>(
    'GET',
    `/rest/api/content/search?cql=${cql}&limit=25&expand=metadata.labels,version,space`,
  );
  return r.results.map((p) => ({ id: p.id, title: p.title, labels: toGuidePage(p).labels }));
}

/** Replaces text that must occur exactly once. Fails loudly if the page changed shape. */
export function replaceUnique(html: string, from: string, to: string, label: string): string {
  const count = html.split(from).length - 1;
  if (count !== 1) throw new Error(`Expected exactly 1 match for "${label}", found ${count}. Aborting.`);
  return html.replace(from, () => to);
}

/** Builds a row for the "Last update" table (status, author as user mention, date). */
export function lastUpdateRow(userKey: string, isoDate: string, status = 'WIP', colour = 'Yellow'): string {
  return (
    '<tr><td><div class="content-wrapper"><p><ac:structured-macro ac:name="status" ac:schema-version="1">' +
    `<ac:parameter ac:name="colour">${colour}</ac:parameter><ac:parameter ac:name="title">${status}</ac:parameter>` +
    '</ac:structured-macro></p></div></td>' +
    `<td><div class="content-wrapper"><p><ac:link><ri:user ri:userkey="${userKey}" /></ac:link></p></div></td>` +
    `<td><div class="content-wrapper"><p><time datetime="${isoDate}" /></p></div></td></tr>`
  );
}

export async function getCurrentUser(): Promise<{ displayName: string; userKey: string }> {
  return api<{ displayName: string; userKey: string }>('GET', '/rest/api/user/current');
}

/** Updates a page body. Refuses to overwrite if the page changed since it was read. */
export async function updateGuidePage(page: GuidePage, newStorage: string, message: string): Promise<void> {
  if (dryRun) {
    console.log(`[dry-run] would update "${page.title}" to version ${page.version + 1} (${message})`);
    return;
  }
  const latest = await getGuidePage(page.id);
  if (latest.version !== page.version) {
    throw new Error(
      `"${page.title}" changed (v${page.version} -> v${latest.version}). Re-read and merge first.`,
    );
  }
  await api('PUT', `/rest/api/content/${page.id}`, {
    version: { number: page.version + 1, message },
    title: page.title,
    type: 'page',
    body: { storage: { value: newStorage, representation: 'storage' } },
  });
}

/** Creates a guide under the guides parent. Refuses to create when the title already exists. */
export async function createGuidePage(title: string, storage: string): Promise<string | undefined> {
  const existing = await findGuidePages(title);
  if (existing.some((p) => p.title.toLowerCase() === title.toLowerCase())) {
    throw new Error(`A guide titled "${title}" already exists. Update it instead.`);
  }
  if (dryRun) {
    console.log(`[dry-run] would create guide "${title}" under ${GUIDES_PARENT_ID}`);
    return undefined;
  }
  const created = await api<{ id: string }>('POST', '/rest/api/content', {
    type: 'page',
    title,
    space: { key: GUIDES_SPACE },
    ancestors: [{ id: GUIDES_PARENT_ID }],
    body: { storage: { value: storage, representation: 'storage' } },
  });
  return created.id;
}

export async function attachFile(pageId: string, name: string, filePath: string): Promise<void> {
  if (dryRun) {
    console.log(`[dry-run] would attach ${name} to page ${pageId}`);
    return;
  }
  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync(filePath)], { type: 'image/png' }), name);
  form.append('minorEdit', 'true');
  const res = await fetch(`${config.confluence.url()}/rest/api/content/${pageId}/child/attachment`, {
    method: 'POST',
    headers: { Authorization: authHeader(), 'X-Atlassian-Token': 'no-check', Accept: 'application/json' },
    body: form,
  });
  if (!res.ok) throw new Error(`Attach ${name} failed: HTTP ${res.status}`);
}

/** Adds labels and keeps the existing ones. */
export async function addLabels(pageId: string, labels: string[]): Promise<void> {
  if (dryRun) {
    console.log(`[dry-run] would add labels ${labels.join(', ')} to page ${pageId}`);
    return;
  }
  await api(
    'POST',
    `/rest/api/content/${pageId}/label`,
    labels.map((name) => ({ prefix: 'global', name })),
  );
}

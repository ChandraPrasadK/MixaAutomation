import { config, dryRun } from './config';
import { request } from './http';

export type Page = { id: string; title: string; text: string };

function htmlToText(html: string): string {
  return html
    .replace(/<\/(p|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function getPage(id: string): Promise<Page> {
  if (dryRun) {
    return { id, title: 'Sample: PDP specification', text: 'The gallery must support keyboard navigation.' };
  }
  const { email } = config.confluence;
  const token = config.confluence.token();
  const auth = email ? `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}` : `Bearer ${token}`;
  const data = await request<{ title: string; body: { storage: { value: string } } }>(
    'GET',
    `${config.confluence.url()}/rest/api/content/${id}?expand=body.storage`,
    { Authorization: auth },
  );
  return { id, title: data.title, text: htmlToText(data.body.storage.value) };
}

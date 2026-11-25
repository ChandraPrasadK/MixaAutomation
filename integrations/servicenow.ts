import { config, dryRun } from './config';
import { request } from './http';

export type Ticket = {
  number: string;
  title: string;
  description: string;
  acceptanceCriteria: string;
};

type SnRecord = Record<string, string>;

export async function getTicket(number: string): Promise<Ticket> {
  if (dryRun) {
    return {
      number,
      title: 'Sample: PDP shows product gallery',
      description: 'As a visitor I can see the product gallery on the product page.',
      acceptanceCriteria: 'Gallery shows at least one image. Selecting a thumbnail changes the main image.',
    };
  }
  const { table } = config.serviceNow;
  const url = config.serviceNow.url();
  const token = config.serviceNow.token();
  const query = encodeURIComponent(`number=${number}`);
  const data = await request<{ result: SnRecord[] }>(
    'GET',
    `${url}/api/now/table/${table}?sysparm_query=${query}&sysparm_limit=1`,
    { Authorization: `Bearer ${token}` },
  );
  const r = data.result[0];
  if (!r) throw new Error(`Ticket ${number} not found in table ${table}`);
  return {
    number: r.number,
    title: r.short_description ?? '',
    description: r.description ?? '',
    // Field name varies per instance; confirm with the ServiceNow owner.
    acceptanceCriteria: r.acceptance_criteria ?? '',
  };
}

import { mkdirSync, writeFileSync } from 'fs';
import { getTicket } from '../integrations/servicenow';
import { getPage } from '../integrations/confluence';
import { dryRun } from '../integrations/config';

// Usage: npm run fetch:requirement -- <TICKET_NUMBER> [CONFLUENCE_PAGE_ID]
async function main(): Promise<void> {
  const [number, pageId] = process.argv.slice(2);
  if (!number) throw new Error('Usage: npm run fetch:requirement -- <TICKET_NUMBER> [CONFLUENCE_PAGE_ID]');

  const ticket = await getTicket(number);
  const page = pageId ? await getPage(pageId) : undefined;

  const md = [
    `# ${ticket.number}: ${ticket.title}`,
    '',
    '## Description',
    ticket.description,
    '',
    '## Acceptance criteria',
    ticket.acceptanceCriteria,
    ...(page ? ['', `## Confluence: ${page.title}`, page.text] : []),
    '',
  ].join('\n');

  mkdirSync('requirements', { recursive: true });
  const file = `requirements/${ticket.number}.md`;
  writeFileSync(file, md);
  console.log(`${dryRun ? '[dry-run] ' : ''}Saved ${file}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

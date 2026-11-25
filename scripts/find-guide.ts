import { findGuidePages, GUIDES_PARENT_ID, GUIDES_SPACE } from '../integrations/confluenceGuides';

// Usage: npm run guide:find -- "Footer"
// Read-only. Lists user guide pages under the guides parent whose title contains the text.
async function main(): Promise<void> {
  const text = process.argv.slice(2).join(' ').trim();
  if (!text) {
    console.error('Usage: npm run guide:find -- "<part of the guide name>"');
    process.exit(1);
  }
  const pages = await findGuidePages(text);
  console.log(`Guides in ${GUIDES_SPACE} under page ${GUIDES_PARENT_ID} matching "${text}": ${pages.length}`);
  for (const p of pages) {
    console.log(`${p.id} | ${p.title} | labels: ${p.labels.join(', ') || '-'}`);
  }
  if (pages.length === 0) console.log('No existing guide found. Create one from the template.');
}

main().catch((e: Error) => {
  console.error(e.message);
  process.exit(1);
});

import { readFileSync } from 'fs';
import { createTestCase, TestCase } from '../integrations/qtest';

// Usage: npm run push:testcases -- test-cases/<TICKET_NUMBER>.json
// The JSON file is a reviewed array of test cases (see test-cases/SAMPLE.json).
async function main(): Promise<void> {
  const file = process.argv[2];
  if (!file) throw new Error('Usage: npm run push:testcases -- test-cases/<TICKET_NUMBER>.json');
  const cases: TestCase[] = JSON.parse(readFileSync(file, 'utf8'));
  for (const tc of cases) await createTestCase(tc);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

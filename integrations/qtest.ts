import { config, dryRun } from './config';
import { request } from './http';

export type TestCase = {
  name: string;
  description: string;
  steps: { description: string; expected: string }[];
};

// Check the endpoint and payload against your qTest version's API docs before the first real run.
export type RunStatus = 'PASSED' | 'FAILED' | 'SKIPPED';

export type RunResult = {
  testCaseId: number;
  name: string;
  status: RunStatus;
  start: Date;
  end: Date;
  note: string;
};

// Creates a test run under a test cycle and submits one automation log.
// Endpoints follow qTest Manager API v3; verify status handling (name vs id) against your instance.
export async function submitResult(cycleId: string, r: RunResult): Promise<void> {
  if (dryRun) {
    console.log(`[dry-run] would submit qTest result: TC ${r.testCaseId} -> ${r.status} (${r.name})`);
    return;
  }
  const base = `${config.qtest.url()}/api/v3/projects/${config.qtest.projectId()}`;
  const headers = { Authorization: `Bearer ${config.qtest.token()}` };
  const run = await request<{ id: number }>(
    'POST',
    `${base}/test-runs?parentId=${cycleId}&parentType=test-cycle`,
    headers,
    { name: r.name, test_case: { id: r.testCaseId } },
  );
  await request('POST', `${base}/test-runs/${run.id}/auto-test-logs`, headers, {
    status: r.status,
    exe_start_date: r.start.toISOString(),
    exe_end_date: r.end.toISOString(),
    note: r.note,
  });
}

export async function createTestCase(tc: TestCase): Promise<void> {
  const payload = {
    name: tc.name,
    description: tc.description,
    test_steps: tc.steps.map((s, i) => ({ order: i + 1, description: s.description, expected: s.expected })),
  };
  if (dryRun) {
    console.log(`[dry-run] would create qTest test case: ${tc.name} (${tc.steps.length} steps)`);
    return;
  }
  await request(
    'POST',
    `${config.qtest.url()}/api/v3/projects/${config.qtest.projectId()}/test-cases`,
    { Authorization: `Bearer ${config.qtest.token()}` },
    payload,
  );
  console.log(`Created qTest test case: ${tc.name}`);
}

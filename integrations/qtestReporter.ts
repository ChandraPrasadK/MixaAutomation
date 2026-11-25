import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { RunResult, RunStatus, submitResult } from './qtest';

const ann = (t: TestCase, type: string): string[] =>
  t.annotations.filter((a) => a.type === type && a.description).map((a) => a.description as string);

// Pushes the final outcome of every test that has a `qtest` annotation to a qTest cycle.
// Never fails the test run: integration problems are logged as warnings.
export default class QTestReporter implements Reporter {
  private results = new Map<string, RunResult>();

  onTestEnd(test: TestCase, result: TestResult): void {
    const ids = ann(test, 'qtest');
    if (!ids.length) return;
    const status: RunStatus =
      result.status === 'passed' ? 'PASSED' : result.status === 'skipped' ? 'SKIPPED' : 'FAILED';
    const links = [
      ...ann(test, 'story').map((s) => `story=${s}`),
      ...ann(test, 'bug').map((b) => `bug=${b}`),
    ];
    const note = [
      `Project: ${test.parent.project()?.name ?? ''}`,
      links.length ? `Links: ${links.join(', ')}` : '',
      result.error?.message ? `Error: ${result.error.message.split('\n')[0]}` : '',
    ]
      .filter(Boolean)
      .join('\n');
    for (const id of ids) {
      // Later attempts (retries) overwrite earlier ones, so only the final outcome is sent.
      this.results.set(`${test.id}:${id}`, {
        testCaseId: Number(id),
        name: test.title,
        status,
        start: result.startTime,
        end: new Date(result.startTime.getTime() + result.duration),
        note,
      });
    }
  }

  async onEnd(): Promise<void> {
    const cycleId = process.env.QTEST_CYCLE_ID;
    if (!cycleId) {
      if (this.results.size) console.warn('[qtest] QTEST_CYCLE_ID not set; skipping result upload.');
      return;
    }
    for (const r of this.results.values()) {
      if (!Number.isFinite(r.testCaseId)) {
        console.warn(`[qtest] "${r.name}": qtest annotation must be a numeric test case id.`);
        continue;
      }
      try {
        await submitResult(cycleId, r);
      } catch (e) {
        console.warn(`[qtest] upload failed for TC ${r.testCaseId}: ${(e as Error).message}`);
      }
    }
  }
}

// Links a Playwright test to external systems using plain annotations (no BDD).
// Usage:
//   test('shows title', { annotation: [...Links.qtest(1234), ...Links.story('STRY0551109')] }, async () => {});
type Annotation = { type: string; description: string };

export const Links = {
  qtest: (testCaseId: number | string): Annotation[] => [{ type: 'qtest', description: String(testCaseId) }],
  story: (id: string): Annotation[] => [{ type: 'story', description: id }],
  bug: (id: string): Annotation[] => [{ type: 'bug', description: id }],
};

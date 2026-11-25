import 'dotenv/config';

// DRY_RUN defaults to true: reads return mock data, writes are only logged.
export const dryRun = process.env.DRY_RUN !== 'false';

export function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Set it in .env (see .env.example).`);
  return value;
}

export const config = {
  serviceNow: {
    url: () => required('SERVICENOW_URL'),
    token: () => required('SERVICENOW_TOKEN'),
    table: process.env.SERVICENOW_TABLE ?? 'rm_story',
  },
  confluence: {
    url: () => required('CONFLUENCE_URL'),
    token: () => required('CONFLUENCE_TOKEN'),
    email: process.env.CONFLUENCE_EMAIL, // set only for Atlassian Cloud (basic auth)
  },
  qtest: {
    url: () => required('QTEST_URL'),
    token: () => required('QTEST_TOKEN'),
    projectId: () => required('QTEST_PROJECT_ID'),
  },
};

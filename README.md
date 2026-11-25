# Mixa Automation

Playwright + TypeScript framework for the Mixa website (POM + COM architecture). See Architecture.docx.

## Setup
    npm install
    npx playwright install
    copy .env.example .env

## Structure
- `tests/<feature>/` : home, plp, pdp, article (one folder per page)
- `pages/` : page objects, `components/` : reusable component objects
- `fixtures/` : Playwright fixtures, `test-data/` : test data, `utils/` : helpers and tags

## Run
    npm run test:smoke
    npm run test:regression
    npm run test:a11y
    npm run test:localization
    npm test                      (everything)

Each test type is a tag (see `utils/tags.ts`), so one test can belong to several, e.g. smoke and regression.

Reports: npm run report (HTML); npm run allure:generate && npm run allure:open (Allure, requires Java).

## Notes
Locators and routes are placeholders. Validate them against the real site.

## Requirement to test case flow
1. `npm run fetch:requirement -- <TICKET> [CONFLUENCE_PAGE_ID]` saves `requirements/<TICKET>.md` (ServiceNow plus Confluence).
2. Draft test cases from that file into `test-cases/<TICKET>.json` (see SAMPLE.json) and review them.
3. `npm run push:testcases -- test-cases/<TICKET>.json` creates them in qTest.

DRY_RUN=true (default) uses mock data and only logs writes. Put tokens in .env (never commit), then set DRY_RUN=false.

## Quality standards
All contributors, human or AI, follow [CONTRIBUTING.md](CONTRIBUTING.md): mandatory assertions, dynamic waits only, plain ASCII code and comments, Prettier formatting, shared components registered once in `BasePage`, and traceability annotations.

    npm run format        # fix formatting
    npm run check         # typecheck + lint + format check + ASCII check (also runs in CI on every pull request)

## Claude commands
Commands in `.claude/commands/` run skills in `.claude/skills/`:
- `/create-component` : component object and page-level tests from a name, test URL, Figma URL, key and node ids
- `/create-bug` : [BUG] under a ServiceNow story (browser session: `npm run servicenow:login`)
- `/create-testcases` : qTest test cases in the house style
- `/create-author-guide` : update or create a user guide in Confluence (guide link optional; Sitecore session: `npm run sitecore:login`; find an existing guide: `npm run guide:find -- "<name>"`)

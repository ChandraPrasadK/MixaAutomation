# Contributing and QA Standards

These rules apply to everyone who adds or changes code in this framework, including AI agents using the skills in `.claude/`. The rules marked **[enforced]** are checked by `npm run check` and by the Quality Gate workflow on every pull request.

## 1. Before you push

    npm run format       # fix formatting
    npm run check        # typecheck + lint + format check + ASCII check  [enforced in CI]
    npx playwright test <your spec> --project=chromium --project=mobile-chrome

A change is done only when all of these are true (Definition of Done):
- Every test asserts an observable outcome.
- No static waits.
- Formatted, typed, and passes `npm run check`.
- Tagged and traceable (section 4).
- Passes on the target browsers and on the mobile project.
- No secrets, client data or personal data in code, logs, screenshots or reports.
- No copied code: shared logic lives in one place (section 3).

## 2. Code standards

1. **Assertions are mandatory [enforced by ESLint].** Use Playwright web-first assertions (`toBeVisible`, `toHaveText`, `toHaveAttribute`, `toHaveCSS`, `toHaveCount`, `toHaveURL`). A test that only performs actions is not a test. Reusable checks go in `utils/assertions.ts`. Add a message to non-obvious assertions: `expect(locator, 'logo links to the home page')`.
2. **Dynamic waits only [enforced by ESLint].** Never use `page.waitForTimeout`, `setTimeout` or fixed sleeps. Wait for the specific element or state that proves readiness, so the test continues the moment it is ready:
   - web-first assertions (they retry until the timeout)
   - `locator.waitFor({ state: 'visible' })`
   - `page.waitForURL`, `page.waitForResponse`, `page.waitForLoadState('domcontentloaded')`
   - for animations, wait for the end state (for example `aria-expanded="true"`), never for a duration
   Do not raise global timeouts to hide a slow wait.
3. **Plain ASCII only [enforced].** No emojis, smileys, decorative symbols, arrows, checkmarks or curly quotes in code, comments, test names, logs or strings. Exception: a character the site itself renders and a test must match (for example a French accent). Mark that line with `// ascii-ok: <reason>`.
4. **Formatting [enforced].** Prettier with the repo `.prettierrc` and `.editorconfig`. Run `npm run format`.
5. **Types [enforced].** TypeScript strict mode, no `any`, no `@ts-ignore` without a written reason.
6. **Comments.** Short, explain why and not what. No commented-out code.
7. **Names.** Descriptive locator and method names (`openMegaMenu`, `hamburgerButton`). PascalCase classes, camelCase members, one component per file. Use the path aliases (`@components/...`, `@pages/...`, `@utils/...`).
8. **No hardcoded secrets or environment URLs.** Read them from `.env` or `playwright.config.ts`. Never print, log or commit a token, password, cookie or connection string.

## 3. Architecture (POM + COM): write once, reuse everywhere

- `components/` holds reusable parts. `pages/` holds one class per template (Home, PLP, PDP, Article). `tests/<feature>/` holds specs.
- **Shared components** (appear on two or more templates: header, mega menu, footer, cookie banner, breadcrumbs) are created once in `BasePage`. Every page inherits them. Never instantiate a shared component inside a single page class.
- **Child components** belong to their parent (`header.megaMenu`), not to `BasePage`.
- **Page-specific components** are created only in that page class.
- **Shared helpers** live in the component or in `utils/`. Never copy a function into a second class.
- **Search before you write.** Look in `components/`, `pages/` and `utils/` first, and extend what exists.
- **Shared-component tests are written once** in `tests/common/` and looped over the page fixtures. Do not copy a test per page.
- **Tests are independent.** No shared state, no required order, safe to run in parallel.

## 4. Locators, tags and traceability

Locator priority, most stable first:
1. `getByTestId`
2. `getByRole` with an accessible name
3. `getByLabel`, `getByText`, `getByAltText`
4. A short CSS selector on a stable class or id (last resort)

Avoid long XPath, `nth-child` chains and generated class names. If the site has no stable hook, ask the developers for a `data-testid`.

Every test carries:
- a tag from `utils/tags.ts` (`smoke`, `regression`, `a11y`, `localization`)
- traceability annotations, which the qTest reporter reads:

      test('logo links to home STRY0914979', {
        tag: [Tags.smoke],
        annotation: [
          { type: 'story', description: 'STRY0914979' },
          { type: 'qtest', description: '<numeric qTest test case id>' },
        ],
      }, async ({ homePage }) => { ... });

## 5. Reliability

- Retries are for CI only. A flaky test is quarantined and fixed, never left to retry.
- Reuse saved sessions (`npm run sitecore:login`, `npm run servicenow:login`) instead of logging in inside tests.
- Keep traces, screenshots and videos on failure (already configured).

## 6. Integrations and safety

- `DRY_RUN=true` is the default: reads return mock data and writes are only logged. Switch to `false` yourself, deliberately.
- Anything written to ServiceNow, qTest or Confluence is shown as a draft and needs explicit confirmation first.
- Sitecore automation is blocked on production.
- `.env`, `.auth/` (saved sessions), `bugs/` and `author-guides/` are git-ignored. Treat them as sensitive.
- If a secret is ever shared, rotate it.

## 7. Environment variables (names only; never commit values)

| Group | Variables |
|---|---|
| Site | `ENV`, `BASE_URL`, `LOCALE` |
| Mode | `DRY_RUN` |
| Figma | `FIGMA_TOKEN` (personal access token, read-only scopes) |
| ServiceNow | `SERVICENOW_URL` (instance base URL), `SERVICENOW_TABLE` (default `rm_story`), `SERVICENOW_TOKEN` (optional; the browser session is the default) |
| Confluence | `CONFLUENCE_URL` (base URL, no page path), `CONFLUENCE_TOKEN` and `CONFLUENCE_API_TOKEN` (same personal access token), `CONFLUENCE_SPACE` (space key, not name); set `CONFLUENCE_EMAIL` only for Atlassian Cloud |
| qTest | `QTEST_URL` (base URL, no page path), `QTEST_TOKEN` (the Bearer Token value only, without the word "bearer"), `QTEST_PROJECT_ID` (number), `QTEST_CYCLE_ID` (to upload run results) |
| Sitecore | `SITECORE_URL` (site address only; any path is ignored), `SITECORE_USER`, `SITECORE_PASSWORD`, `SITECORE_ENV` |

Use names without spaces. Keep one definition per variable.

## 8. Pull requests

- Small, focused changes with a clear description and the story ID.
- `npm run check` passes. The Quality Gate workflow must be green.
- Reviewer checklist: assertions present, no static waits, no repeated code, correct place (shared vs page), locators stable, traceability annotations set, no secrets or client data.
- Keep dependencies current. Dependabot opens weekly update pull requests.
- TypeScript is pinned to 6.0.3 because typescript-eslint does not support TypeScript 7 yet. Upgrade TypeScript only when typescript-eslint supports it, and run `npm run check` after.

## 9. Using the Claude skills

Commands in `.claude/commands/` call skills in `.claude/skills/`. Each skill follows this document. If a skill and this document disagree, this document wins; fix the skill.

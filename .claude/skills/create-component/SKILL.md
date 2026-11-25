---
name: create-component
description: Build a Playwright component object plus page-level tests for a Mixa website component. Use when the user gives a page URL, a story ID, a component name and a Figma link and wants the component inspected in the DOM, UX values captured from Figma, and tests written.
---

# Create component and page-level tests

Follows this repo's POM + COM architecture (see `README.md`, `components/BaseComponent.ts`, `pages/HomePage.ts`, `fixtures/testFixtures.ts`).

## Required input format (all five are mandatory)
The user supplies one block in this format:

```
Component Name : <PascalCase, e.g. HeaderNavigation>
Test URL       : <full page URL used to inspect the DOM>
Figma URL      : <full Figma link that contains the design details>
Figma Key      : <the file key from the Figma URL, the part after /design/ or /file/>
Figma Node IDs : <one or more node ids, e.g. 1218-667, 1218-700>
```

- **Figma Key is the file key, not an access token.** If the value looks like a token (starts with `figd_`), do not use or repeat it; tell the user to remove it and keep the token in `.env`.
- Cross-check: the Figma Key must match the key inside the Figma URL. If it doesn't, stop and ask.
- Node IDs may use `-` or `:` (`1218-667` = `1218:667`). Accept a list and capture UX values for **each** node (e.g. desktop, mobile, hover, mega-menu states).
- Any field missing or empty: ask for it. Do not guess a URL, key or node id.

**Optional but recommended:** `Story ID : <ServiceNow number>`. When given, read the story and use its acceptance criteria to drive the test list (read through the saved ServiceNow session, `npm run servicenow:login` if it has expired). When absent, derive tests from the DOM and the Figma states only, and say so.

`FIGMA_TOKEN` is read from `.env`. Never print, log or echo it. If it is missing, ask the user to add it; do not ask them to paste it.

## Steps
1. **Preflight.** Run `npm run check:figma`. If it fails, stop and report; do not continue with guessed design values.
2. **Story context (if a Story ID was given).** Read the story's acceptance criteria; they drive the test list. `npm run fetch:requirement -- <STORY_ID>` writes `requirements/<STORY_ID>.md`, but with `DRY_RUN=true` it returns mock data, so say so and prefer reading the real story through the saved ServiceNow session. Skip this step if no Story ID was given.
3. **DOM inspection.** Open the page with Playwright (a throwaway script in the scratchpad, not in `tests/`). Accept the cookie banner first. Locate the component root and record:
   - the best stable root locator: `getByTestId` > role/label > a scoped CSS selector. Avoid long XPath and nth-chains.
   - inner elements (heading, CTA, image, etc.) as locators relative to the root
   - the real `outerHTML` structure, roles, and `aria-*` attributes
   - computed styles of key elements (color, font-size, font-weight, line-height, padding, gap, border-radius, width/height)
   Report what you found before writing code.
4. **Figma UX values.** Convert each node id (`12-34` -> `12:34`). Call `GET https://api.figma.com/v1/files/<Figma Key>/nodes?ids=<id1,id2,...>` with the `X-Figma-Token` header, reading the token from the environment inside the script. Extract fills (to rgb), typography (family, size, weight, line-height, letter-spacing), auto-layout padding and gap, corner radius, sizes, for each node and its children. Build a table per node: **property | Figma | DOM actual | match?**. Note that Figma px and rendered CSS can differ by rounding; use a stated tolerance, not a silent one.
5. **Write the component** `components/<Name>Component.ts`: extends `BaseComponent`, locators as `readonly` fields scoped to `this.root` (never `page`). Match `HeroBannerComponent.ts`.
6. **Wire it in, following "Reuse across pages" below.** Decide first whether the component is shared or page-specific, then register it in `BasePage` or in one page object. If a page object doesn't exist, create it from `BasePage` and register a fixture in `fixtures/testFixtures.ts`. Use the path aliases (`@components/...`, `@pages/...`).
7. **Write tests** using `@fixtures/testFixtures`, tagged with `Tags` from `@utils/tags`. Shared components are tested once, across pages (see below). Page-specific components go in `tests/<feature>/<feature>.spec.ts`. Cover:
   - visible and renders expected content
   - one test per acceptance criterion (name it with the story ID)
   - UX values from the Figma table via `toHaveCSS`
   - `expectNoSeriousA11yViolations` tagged `Tags.a11y`

   Every test also gets traceability annotations (`story` with the ServiceNow number when known, `qtest` with the numeric test case id when known) as shown in `CONTRIBUTING.md` section 4. Do not invent a qTest id; leave it out and say so.
8. **Verify.** In order: `npm run format`; `npm run check` (typecheck, Prettier check and the ASCII check); search the files you wrote for `waitForTimeout` and `setTimeout` (expect no matches); run `npx playwright test <new spec>` on `chromium` and `mobile-chrome`. Report any check you could not run.

## Coding standards (apply to every file you write or change)
The full, authoritative rules are in `CONTRIBUTING.md` at the repo root. Read it first. If it and this section disagree, `CONTRIBUTING.md` wins. Key points:

1. **Assertions are mandatory.** Every test asserts an observable outcome with Playwright `expect` (web-first assertions such as `toBeVisible`, `toHaveText`, `toHaveAttribute`, `toHaveCSS`, `toHaveCount`, `toHaveURL`). A test that only performs actions is not finished. Put reusable checks in `utils/assertions.ts` and call them. Give custom messages to non-obvious assertions: `expect(locator, 'logo links to the home page')`.
2. **Dynamic waits only. No static waits.** Never use `page.waitForTimeout`, `setTimeout` or fixed sleeps. Wait for the condition instead, so the test continues the moment the element is ready:
   - `await expect(locator).toBeVisible()` or another web-first assertion (it retries until the timeout)
   - `await locator.waitFor({ state: 'visible' })` when no assertion fits
   - `await page.waitForURL(...)`, `page.waitForResponse(...)`, `page.waitForLoadState('domcontentloaded')` when the trigger is navigation or a request
   - for transitions, wait for the end state (for example `toHaveAttribute('aria-expanded', 'true')`, or a CSS value) and not for a time
   Never raise global timeouts to hide a slow wait. Wait for the specific element or state that proves the page is ready, and nothing longer.
3. **Formatting.** Format every file you create or change with Prettier before finishing: `npx prettier --write <files>`, using the repo's `.prettierrc`. Do not reformat files you did not touch.
4. **Plain ASCII only.** No emojis, smileys, decorative symbols, arrows, checkmarks, curly quotes or special characters in code, comments, test names, log messages or strings. This applies to comments as well. Use plain words and ASCII punctuation. The only exception is a character the site itself renders and the test must match exactly (for example an accent in a French label); keep that to the minimum needed, and in a comment explain why.
5. **Comments.** Keep them short and useful. Explain why, not what. No commented-out code left behind.
6. **Names.** Clear, descriptive locator and method names (`openMegaMenu`, `hamburgerButton`), PascalCase classes, camelCase members, one component per file.
7. **No hardcoded secrets or environment URLs** in code. Read them from `.env` or Playwright config.

## Reuse across pages (COM + POM): never repeat code
The framework has two layers: **components** (`components/`, reusable parts) and **pages** (`pages/`, one per template: Home, PLP, PDP, Article). A component is written once and used by every page that shows it.

1. **Classify the component before writing code.** Shared = it appears on two or more page templates (header, mega menu, footer, cookie banner, breadcrumbs, newsletter, and so on). Page-specific = it appears on one template only (for example the hero banner on Home). If unsure which pages show it, check the live pages or ask the user. Do not guess.
2. **Shared components go in `BasePage`.** Add the component class under `components/`, then create it **once** in the `BasePage` constructor, exactly as `header`, `footer` and `cookieBanner` are today. Every page extends `BasePage`, so Home, PLP, PDP and Article all get it with no extra code. Never instantiate a shared component inside an individual page class.
3. **Child components belong to their parent.** If a component only exists inside another (the mega menu opens from the header), expose it from the parent, e.g. `header.megaMenu`. Tests then read `page.header.megaMenu`. Do not also register it in `BasePage`.
4. **Page-specific components** are created in that one page class only (see `HomePage.hero`).
5. **Shared helpers and functions.** Behaviour used by more than one component (hover, open and close a menu, wait for a transition, scroll lock check, viewport switch) goes in the component itself, or in `utils/` when it is not tied to one component. Never copy the same function into a second class.
6. **Search before you write.** Grep `components/`, `pages/` and `utils/` for existing locators and helpers for the same element. Extend what exists. Never create a second class for something already covered (extend `HeaderComponent`; do not create `NewHeaderComponent`).
7. **Shared-component tests are written once and run on every page.** Put them in `tests/common/<component>.spec.ts` and loop over the page fixtures (home, plp, pdp, article) instead of copying the test per page. Page-only behaviour stays in that page's folder.
8. **Report the placement.** In your final summary state, for each component: shared or page-specific, where it is registered, and which pages inherit it.

## Rules
- Do not edit existing files beyond registering the component (in `BasePage` or its page object) and its fixtures, and extending an existing component class as described above. Ask before overwriting or removing anything.
- If a test fails because the site differs from Figma, **report it as a finding** (offer `/create-bug`). Do not loosen the assertion to make it pass.
- Locators in this repo are partly placeholders; say clearly which locators you verified on the live page.
- Report at the end: files created/changed, which tests passed, which Figma mismatches were found.

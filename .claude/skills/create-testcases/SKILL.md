---
name: create-testcases
description: Write qTest test cases for a story in the house style. Use when the user wants test cases created, or asks to read the existing Sprint 1 / WSF Mixa test cases in qTest and write new ones in the same format.
---

# Create test cases in the qTest format

## Required inputs (ask for any that are missing)
1. Story / requirement ID (ServiceNow number), and optionally a Confluence page ID
2. Where the existing cases live in qTest (module or cycle name for **Sprint 1** under the **WSF Mixa** project). If unsure, discover it from the module tree and confirm with the user.

qTest values come from `.env` (`QTEST_URL`, `QTEST_TOKEN`, `QTEST_PROJECT_ID`). Never print the token. The API header is `Authorization: Bearer <token>` (see `integrations/qtest.ts`).

## Steps
1. **Read the existing cases (read-only).** Use qTest Manager API v3: list modules (`/api/v3/projects/<id>/modules`), then fetch the test cases under Sprint 1, paging through all results. Verify endpoint and field names against the qTest API docs for this instance; do not assume. Do not modify anything in qTest in this step.
2. **Learn the style.** Summarize, with 2-3 real examples: naming pattern, description/precondition style, number and granularity of steps, how expected results are written, properties (priority, type, etc.), module structure. Show this to the user and let them correct it.
3. **Get the requirement.** `npm run fetch:requirement -- <STORY_ID> [PAGE_ID]`, then read `requirements/<STORY_ID>.md`.
4. **Draft cases** in `test-cases/<STORY_ID>.json`, in the format of `test-cases/SAMPLE.json`:
   `[{ "name", "description", "steps": [{ "description", "expected" }] }]`.
   Cover each acceptance criterion with positive, negative and boundary cases, plus accessibility, localization and responsive cases where relevant. Add a traceability table (criterion -> test case) in your reply.
5. **Avoid duplicates.** Compare names and intent with the existing Sprint 1 cases; flag overlaps instead of re-creating them.
6. **Review gate.** Show the drafts and wait for approval. Edit on request.
7. **Push.** `DRY_RUN=true` is the default: run `npm run push:testcases -- test-cases/<STORY_ID>.json` and show the dry-run output. Only after the user confirms, and only after they set `DRY_RUN=false` themselves, run it for real.

## Rules
- Follow `CONTRIBUTING.md` (plain ASCII text, no emojis or decorative characters in test case names, descriptions or steps).
- Once cases exist in qTest, automated tests link to them with the `qtest` annotation holding the numeric test case id (see `CONTRIBUTING.md` section 4). Never invent an id.
- `createTestCase` in `integrations/qtest.ts` sends only name, description and steps. If the house style needs precondition, priority, type or module placement, tell the user and propose extending the payload. Do not silently drop those fields.
- Be explicit when a case rests on an assumption about the site's behavior.
- Never invent expected results that the requirement doesn't support; mark them "to confirm".

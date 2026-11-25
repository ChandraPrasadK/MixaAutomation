---
name: create-author-guide
description: Update or create a Mixa user guide (author guide) in Confluence, with screenshots from the Mixa Sitecore site. Use when the user wants a guide for a component, whether or not a guide page already exists and whether or not they give a link.
---

# Update or create a user guide in Confluence

Follow `CONTRIBUTING.md` for any code. Write guides in plain, professional text with no emojis or decorative symbols (ASCII only).

## Where guides live (fixed facts)
- Space `WSFMIXA`. Parent page: **"13 - [Mixa] User guides and training materials"** (id `984878379`).
- Title convention: `WIP_User Guide - <Name>` (keep "WIP" until the user says otherwise).
- Template: **"User Guide - Template"** (id `993494981`). Never start from a blank page.
- Labels: the category label of the siblings (`ug-navigation`, `ug-page`, `ug-content`, `ug-basics`, `ug-product`) plus `ug-<short-name>` (for example `ug-footer`). Add, never remove.
- Spec link source: the sprint table page (for sprint 1: "Mixa Sprint#1 - 02/11/2026-20/11/2026", id `982977798`). For other sprints ask for the sprint page.
- Screenshots come from the **Mixa Sitecore on INT** and the **INT front-end** (`SITECORE_URL` origin). Never from the 3CE baseline site. Sitecore automation is blocked on production.
- Helpers: `integrations/confluenceGuides.ts` (find, read, update, create, attach, label) and `utils/sitecoreContentTree.ts` (read-only Content Editor tree). Writes honour `DRY_RUN` (default true; the user sets `false` deliberately). Reads are always real.

## Prerequisites (check first, stop and ask if missing)
1. Confluence: `npx tsx scripts/check-confluence.ts` prints `CONFLUENCE OK`, and the account can edit the guide page.
2. Sitecore session: `.auth/sitecore.json` exists and works. If not, the user runs `npm run sitecore:login` and logs in themselves. Do not type credentials for them. Confirm the session by opening the Content Editor: if you see "sitecore\Anonymous" or the login page, the session is not valid.
3. ServiceNow session is optional (`npm run servicenow:login`), only to read the story.

## Inputs (all optional except the component)
Ask for the **component or guide name**. Everything else can be found; only ask when you cannot:
- **Guide link or id** (may be missing).
- **Spec page(s)** (may be missing: use the sprint table row for the feature).
- **Sitecore path** (may be missing: see "Finding the Sitecore path").
- **Site URL** for front-end screenshots (default: the INT origin from `.env`).
- **Story or demand id** (optional).

## Step 0: decide update or create
1. Link or id given: read it and use **update** mode.
2. No link: run `npm run guide:find -- "<name>"`.
   - One match: show it to the user and confirm, then **update** it.
   - Several: list them and ask which.
   - None: tell the user no guide exists and **create** it from the template. A component that was just built or has no guide is the normal "create" case.
3. Never create a page whose title already exists (the helper refuses).

## Finding the Sitecore path
Content for components lives under `Content > Loreal > Brand Sites > MIXA > MASTER > DMI`. The live INT site reads **DMI** (the DEV node is not what the site shows; item names such as "NewBest" are internal and the visible label is in the Label field).
- Shared items are under `DMI > Data`. Header and footer are under `Data > Navigation` (Header Navigation, Footer Navigation, Social Links). Other components have their own folders under `Data` (for example CTA, Plain HTML, Texts).
- If the user gives a path, open it in the Content Editor and confirm it exists.
- If not, find the component's data item by name in the tree and on the page (Presentation > Details lists the controls and their data sources). If still unsure, ask the user. Never guess a path into a guide.

## How a component is added, linked and rendered (verified in Sitecore 10.4.2 on Mixa INT)
Write this into the guide only for the parts that apply, and only what you verified.
1. **Global components (header, footer, cookie banner)** are part of the layout and are not added per page. Authors maintain their data items under `Data > Navigation` (and related folders). Say so in the guide.
2. **Page-level components** are added from the Content Editor: select the page item, ribbon **Presentation** > **Details** (Layout Details, layout `MIXALayout`, Shared and Final layout tabs) > **Edit** (Device Editor) > **Controls** tab > **Add**. In "Select a Rendering" choose the rendering and the **placeholder** (for example `home-content` on the Home page), tick "Open the Properties dialog box immediately" to set the **data source**, then OK, Save, and publish. Controls can be reordered with Move Up and Move Down and removed with Remove.
3. **Linking a page from a field** (menu item, banner, CTA): use the toolbar above the Link field: Insert link (internal page), Insert media link, Insert external link, Insert anchor, Insert email, Insert JavaScript. Choose "Insert link" for a page of the site.
4. **Creating a page**: right-click the parent item > Insert > the allowed page template (the Home item offers "Simple Page" and "Error Page").
The Sitecore Launchpad also offers an **Experience Editor** tile; how the team uses it is not verified. Not verified yet, so mark as "to confirm" and ask the user instead of writing it: the list of renderings available in the picker, Experience Editor behaviour, and workflow or approval steps.
Never click **OK**, **Save** or **Upgrade** while only exploring. The Content Editor shows a "You must upgrade the content" banner; leave it alone.

## Mode A: update an existing guide (six steps from the user's manager)
1. **Introduction**: add the feature, a short explanation of what it does, and a Mixa screenshot (desktop and mobile when relevant). Take facts from the spec and the live site.
2. **Right-hand panel (Specs reference)**: replace the spec link with the one from the sprint table row. Remove any 3CE link. Add secondary specs (for example the banner spec).
3. **Last update**: add a new row (status WIP, author = current Confluence user, date = today). Keep older rows as history.
4. **Walkthrough**: step-by-step actions, verified in Sitecore. Fix wrong or stale steps. Add missing sections for fields that exist in Sitecore (for example a banner section).
5. **Screenshots**: replace 3CE baseline screenshots with Mixa ones. List every baseline image that remains and why.
6. **Label**: add `ug-<short-name>`; keep existing labels.

## Mode B: create a new guide
Build the body from the template page's storage format (`GUIDE_TEMPLATE_ID`), then apply the six steps. The template (updated for Mixa on 26 Nov 2026) contains: a **"Template instructions" box at the top (delete it)**, red placeholder text (replace every red placeholder with real content, never leave one behind), a login step with a Mixa Launchpad screenshot (keep it), and a skeleton of feature steps plus an optional "Add the component to a page" section (delete that section for global components such as header and footer). Create the page under the parent with the title convention, then add the labels. Check that no red placeholder text and no "Template instructions" text remain before publishing.

## Procedure
1. Prerequisites, then Step 0.
2. **Read and back up** the target page (`getGuidePage`); save the storage body to `author-guides/<name>/original-v<N>.html` (git-ignored). Read the spec(s) and the sprint table row.
3. **Explore Sitecore read-only** with `utils/sitecoreContentTree.ts` and Playwright using `.auth/sitecore.json`. Open each item, read the real fields (Label, Link, banner fields, checkboxes), and capture screenshots. Check the INT front-end for the real behaviour (hover, open state, mobile).
4. **Capture rules**:
   - Wait for the condition, never a fixed time (for example wait for `aria-expanded="true"`, or for an animated panel to finish sliding in before a screenshot).
   - Hide the cookie consent layer and sticky header **only inside the capture browser** so they do not cover the component. Never change the live site.
   - Crop Sitecore screenshots to the fields. Leave out Link values and paths that contain leftover baseline text such as "3CE" or unrelated demo content.
   - Mobile uses the Pixel 7 profile (scale factor 2). Desktop is 1440 wide.
5. **Compare** the old guide with what Sitecore and the site really do. List what is stale or no longer applies (for example a Transparent Header section when the live header is always solid, or an alt-text step that the spec says is code-level only).
6. **Ask before removing** any old section. Removing is the user's decision. Fix text, replace images and add missing sections without asking.
7. **Dry-run, then apply.** Build the new body with `replaceUnique` (it fails if a target is missing or ambiguous). Attention to the page markup: some spaces are non-breaking (`U+00A0`), image references appear as `<ri:attachment ri:filename="..." />`, and the same filename can appear in several steps, so replace only the intended occurrence. Show the user the list of planned changes, then `attachFile`, `updateGuidePage` (it refuses if the page changed since you read it) and `addLabels`. Never force.
8. **Verify** by re-reading the page: no 3CE text or links, every image reference has an attachment, the Last update row and label are present. Say plainly that you did not view it rendered.
9. **Follow-ups (ask first; they are other pages)**: add the guide link to the spec page's "USER GUIDES" section and to the sprint table's USER GUIDE cell; offer to change the "WIP" title and the sprint status once the guide is complete.

## Report at the end
For each guide: mode (update or create) and why, what changed per step, which Sitecore steps were verified and which are open, which baseline images remain, sections you recommend removing, and any defects found on the live site (raise those through `/create-bug`).

## Lessons from the first nine guides (apply them every time)
- **Scope:** only add or update Mixa pages (space WSFMIXA). Never edit the 3CE space, and do not edit the guides index page (it lists guides with a 3CE ancestor; the owner handles it).
- **Links by title:** a link that only has a page title resolves inside WSFMIXA. Before keeping a link, check that a page with that exact title exists there (`npm run guide:find` or a CQL title query). Replace dead links with the Mixa spec pages that exist, or remove them, and say so in the report.
- **Page markup:** Confluence adds macro ids when a page is saved, so find macros by their title or text, not by the exact opening tag. Some spaces are non-breaking (U+00A0). The same image filename can appear twice (replace only the intended one). `replaceUnique` stops when a target is missing or ambiguous.
- **Sitecore Content Editor (10.4):** the item fields are in the main page, not in an iframe. Quick Info shows `Item name:` and its value on one line. Read field labels and values from the page; wait until the item shown matches the item you clicked before reading or capturing.
- **Components are not always in the Insert list:** read the Insert options of the Data folder (ribbon list) before writing the creation step. If the component is missing (for example CTA), the step is Insert from template with the template path from the item Quick Info.
- **Variants and options can be checkboxes on the item,** not rendering parameters. Open the data item and the control properties to see where a setting lives. The spec may describe fields that do not exist yet; write what Sitecore really has and list the differences for the user.
- **Screenshots:** crop Sitecore shots to the fields; use the left part of wide forms so the text stays readable in a table cell; never include the Item owner row, usernames, embed scripts or leftover test text from other brands (mask or crop). Capture at 2x only after the dialog stops moving. Hide cookie consent only inside the capture browser. Use Quick Info rows instead of a deep content tree, because the tree scrolls sideways.
- **Report content problems you find** (wrong text from another brand, metadata far below the field limits, placeholder test items, missing favicon, missing breadcrumb on a page type, wrong accessible names) so the user can raise them. Do not hide them and do not fix Sitecore content.
- **New guide (Mode B):** build it from the template body with a script that removes the Template instructions box, replaces every red placeholder, adds the real rows, and stops if any red placeholder, instruction text or 3CE text is left. Create the page, attach the images, then add the labels (category label plus ug-short-name). Dry-run first; the user decides when to apply.

## Rules
- Edit only the guide(s) the user named. Never delete a page. Never edit the template or the parent page unless the user explicitly asks for that (it affects every future guide).
- Removing a screenshot means removing it from the page body. Deleting the attachment file is a separate step; list unreferenced attachments and ask first.
- Keep tokens and session files out of output. Treat `.auth/`, `author-guides/` and the backups as sensitive.
- Do one guide at a time. Show the plan, then publish only after the user agrees (or has explicitly told you to go ahead).

---
name: create-bug
description: Create a [BUG] under a ServiceNow story through the browser. Use when the user gives a Demand ID, an Enhancement and a Story and wants a bug created with description, steps to reproduce, expected vs actual and screenshots, assigned to the story's developer.
---

# Create a bug under a ServiceNow story

Works through the **ServiceNow web UI** using a session the user logs into themselves. No API token is used and no credentials are stored.

## Required inputs (ask for any that are missing)
1. Demand ID
2. Enhancement (number)
3. Story (number) the bug goes under
4. Bug content: title, what happened, steps to reproduce, expected result, actual result
5. Environment: page URL, browser, locale/market
6. Screenshot source: an existing file path, or "capture it" (then ask for the URL and the element/area)

## Pre-request
The user must be logged in to ServiceNow first. If `.auth/servicenow.json` is missing or ServiceNow shows a login page, ask the user to run `npm run servicenow:login` (headed browser; they log in manually; the session is saved to the git-ignored `.auth/servicenow.json`). Then drive the UI with Playwright using that saved session. Do not type or store the user's credentials.

## Steps
1. **Open the story.** Navigate Demand -> Enhancement -> Story in the UI. Confirm the story title with the user so the bug goes under the right record.
2. **Read from the story record** (do not guess):
   - the story's **developer / assigned-to** -> the bug is assigned to this person
   - the logged-in user -> this is the **creator** (caller / opened by), the person raising the bug
3. **Discover the form.** Open the bug form from the story's related list (the exact list/button name varies; find it in the UI). Map each field **by its visible label** and report the mapping before filling. Do not assume table or field names. The fields that must be set:
   - **Short description / title:** starts with `[BUG]`
   - **Testing type:** `Testing`
   - **Assigned to:** the story developer (step 2)
   - **Created by / caller:** the logged-in user (step 2)
   - **Description:** the template below
4. **Screenshots.** Use the user's files, or capture them with Playwright into `bugs/<story>/` (create it; keep it out of version control). Mask personal data. Attach them on the bug record and reference them in the description.
5. **Preview and confirm.** Show the full draft (every field value and the attachment list) and **wait for an explicit yes** before saving. Creating a bug notifies people and is not easy to undo.
6. **Create, then verify.** After saving, re-open the record and confirm title, assignee, testing type, parent story and attachments. Report the bug number and link.

## Description template
```
[BUG] <short title>

Description
<what is wrong and where>

Steps to reproduce
1. ...
2. ...

Expected result
<...>

Actual result
<...>

Environment
URL: <...> | Browser: <...> | Locale: <...> | Build/date: <...>

Screenshots
<attached: file names>
```

## Rules
- Follow `CONTRIBUTING.md` (plain ASCII text, no emojis or decorative characters in the bug title or description, no secrets or client data in screenshots).
- One bug per confirmation. Never bulk-create.
- If the developer is blank on the story, or a field label doesn't exist, **stop and ask**; do not pick a default assignee.
- Do not put secrets, session cookies or personal data in the description or screenshots.
- Check for an existing similar bug under the story first and tell the user if one exists.

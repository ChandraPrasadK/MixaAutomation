---
description: Update or create a Mixa user guide in Confluence (guide link is optional)
argument-hint: <component or guide name> [guide link] [spec link(s)] [sitecore path] [site url]
---

Use the `create-author-guide` skill.

Input from the user:

$ARGUMENTS

Only the component or guide name is required. If a guide link is given, update that guide. If not, search for an existing guide first (`npm run guide:find -- "<name>"`) and create a new one from the template only when none exists. Check the Confluence and Sitecore prerequisites before anything else. Do one guide at a time, show the planned changes, and publish only after the user confirms.

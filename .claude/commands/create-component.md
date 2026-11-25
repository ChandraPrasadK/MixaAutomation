---
description: Create a component object and page-level tests from a fixed input block (name, test URL, Figma URL, key, node ids)
argument-hint: Component Name / Test URL / Figma URL / Figma Key / Figma Node IDs (optional: Story ID)
---

Use the `create-component` skill.

Input from the user:

$ARGUMENTS

The input must contain all five mandatory fields: Component Name, Test URL, Figma URL, Figma Key (the file key, never a token) and Figma Node IDs. Story ID is optional. If any mandatory field is missing, list exactly which ones and ask for them before doing anything else. Never ask the user to paste `FIGMA_TOKEN`; it is read from `.env`.

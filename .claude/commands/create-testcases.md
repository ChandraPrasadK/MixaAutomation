---
description: Read existing Sprint 1 / WSF Mixa test cases in qTest, then draft new cases for a story in the same format
argument-hint: <story-id> [confluence-page-id]
---

Use the `create-testcases` skill.

Arguments: $ARGUMENTS

Parse the story ID and the optional Confluence page ID. Start by reading the existing Sprint 1 cases in qTest (read-only) and summarizing their style. Ask the user to confirm that summary before drafting. Do not push anything to qTest without confirmation.

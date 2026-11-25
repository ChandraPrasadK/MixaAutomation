---
description: Create a [BUG] under a ServiceNow story (Demand ID, Enhancement, Story) with steps, expected/actual and screenshots
argument-hint: <demand-id> <enhancement> <story> [short bug summary]
---

Use the `create-bug` skill.

Arguments: $ARGUMENTS

First remind the user that they must be logged in to ServiceNow. Parse the Demand ID, Enhancement and Story from the arguments, and ask for anything missing (bug details, steps, expected vs actual, screenshots). Show the full draft and wait for explicit confirmation before creating the bug.

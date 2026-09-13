# Prompt — SOL Debug / Root Cause

Use with role: `SOL_DEBUGGER`

This is an explicit SOL debugging/repair role, so the planning/review code-read-only restriction does not apply. When assigned by the USER or workflow after a LUNA blocker/failure, SOL may inspect, modify, test, and repair application code within the bounded task recorded in `.titan/STATE.md`. Establish the root cause before making a major fix and preserve the existing safety, verification, and review requirements.

```text
Investigate this bug before attempting any major fix.

Do not blindly patch symptoms.

First determine:

1. exact reproduction path;
2. real root cause;
3. relevant data/code flow;
4. relevant files;
5. why existing tests did not prevent the problem;
6. potential regression risk;
7. the smallest safe fix.

Only after the cause is understood:

- if the fix is sufficiently well-defined, create a detailed repair plan
  for LUNA or a weaker GPT model;
- if the fix requires complex reasoning during implementation, keep the
  bounded implementation with SOL, record `SOL_TAKEOVER` and required
  verification, and complete it in the assigned debugging/repair role.

Do not perform a large refactor when the bug can be fixed safely with a
smaller change.
```

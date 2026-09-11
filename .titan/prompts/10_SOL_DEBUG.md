# Prompt — SOL Debug / Root Cause

Use with role: `SOL_DEBUGGER`

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
  implementation with SOL.

Do not perform a large refactor when the bug can be fixed safely with a
smaller change.
```

# Prompt — LUNA Implementation

Use with role: `LUNA_IMPLEMENTER`

Apply WORKFLOW's readiness, state transition, and evidence rules. Start READY or authorized IN_PROGRESS work only. Record required checks as PASS / FAIL / NOT_RUN with actual results; missing required verification prevents completion. IMPLEMENTED means checks passed, not that required SOL review is complete. Preserve the plan for that review and only close it under the plan's closure permission.

```text
Implement the ACTIVE_PLAN from .titan/STATE.md.

Before making changes:

1. read the complete active SOL plan;
2. inspect the relevant existing files named by the plan;
3. verify that the plan matches the real project closely enough;
4. then implement in order.

Rules:

- follow the plan;
- use the existing architecture and project patterns;
- do not expand scope unnecessarily;
- do not perform unrelated refactors;
- do not add a dependency without a clear need;
- do not change locked technical decisions;
- do not remove or weaken tests just to make the suite pass;
- run all relevant tests;
- perform the final checks required by the plan;
- respect every STOP checkpoint.

If you find a material conflict between the plan and the real project:

STOP.

Report:

PLAN ASSUMES:
...

ACTUAL STATE:
...

CONFLICT:
...

CONSEQUENCE:
...

DECISION NEEDED:
...

Do not independently invent a new architecture.

At each STOP or final completion, report:

IMPLEMENTED:
...

CREATED FILES:
...

MODIFIED FILES:
...

TESTS:
...

CHECKS:
...

PROBLEMS / DEVIATIONS:
...

STATUS:
PASS / BLOCKED / PARTIAL
```

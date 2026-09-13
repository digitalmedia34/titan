# Prompt — SOL Implementation Plan for LUNA

Use with role: `SOL_PLANNER`

This is the core daily handoff prompt.

Use `.titan/templates/MODULE_PLAN_TEMPLATE.md`: select STANDARD or eligible SHORT according to WORKFLOW Step B. Fill REVIEW_REQUIRED, REVIEW_REASON, and IMPLEMENTER_MAY_CLOSE. Link acceptance criteria to concrete required verification methods and expected behavior. Read relevant document sections; do not load unrelated project context.

This is application-code-read-only work. Inspect/search code and run existing non-destructive baseline checks as needed, but do not modify application code/tests, implement provisionally, or implement and revert to validate the plan. Update only the required TITAN plan/state/documentation files. Any new implementation or test needed for proof belongs in the plan for LUNA.

```text
The active module/task from docs/MASTER_PLAN.md is now ready.

Inspect the real current state of the project and create a detailed
implementation plan for the LUNA implementation role.

Before writing the plan, inspect all relevant:

- models and migrations;
- controllers;
- request/validation layer;
- services;
- routes;
- views/templates;
- JavaScript/CSS where relevant;
- existing tests;
- docs/PROJECT_SPEC.md;
- docs/ARCHITECTURE.md;
- docs/MASTER_PLAN.md;
- docs/DECISIONS.md;
- docs/STATUS.md.

Do not assume the real project is identical to plans written earlier.
The current code must be verified.

Make the plan detailed enough that the LUNA implementation role mainly
executes instead of:

- guessing what you meant;
- designing architecture independently;
- making important technical decisions;
- inventing parallel solutions;
- overthinking hidden intent.

Where relevant, the plan must clearly contain:

1. goal;
2. current relevant state;
3. locked decisions;
4. what MUST NOT be changed;
5. existing files the implementer must read;
6. exact implementation order;
7. expected new/modified files when reasonably predictable;
8. validation;
9. permissions/security;
10. edge cases;
11. failure behavior;
12. regressions to avoid;
13. required tests;
14. final checks;
15. acceptance criteria.

If the module is large, split it into logical STEPS A/B/C...

Use STOP checkpoints only where they provide real value.

The plan must explicitly tell LUNA to STOP if a material conflict is
found between the plan and the real project instead of changing the
architecture independently.

Be as detailed as necessary, but do not fill the plan with trivial
framework mechanics.

Define WHAT must change, WHERE, WHY, locked constraints and expected
behavior, edge cases, HOW TO VERIFY, and STOP conditions. LUNA writes
the implementation. Do not turn the plan into line-by-line code unless
exact syntax/code is required for correctness, compatibility, security,
or an already-approved interface; state that reason when it applies.

Save the plan under docs/plans/ with a clear name.

Do not implement the task.
```

After creating the plan:

- mark it READY only after current-code inspection, material decisions, and verification requirements are complete; a DRAFT cannot be handed off for execution;
- update `.titan/STATE.md`;
- set `EXPECTED_ROLE: LUNA_IMPLEMENTER`;
- set `ROLE_CAPABILITY: IMPLEMENTATION`;
- set `ACTIVE_PLAN`;
- set the first `NEXT_ACTION`;
- record any first STOP checkpoint.

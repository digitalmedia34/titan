# Prompt — SOL Implementation Plan for LUNA

Use with role: `SOL_PLANNER`

This is the core daily handoff prompt.

Use `.titan/templates/MODULE_PLAN_TEMPLATE.md`: select STANDARD or eligible SHORT according to WORKFLOW Step B. Fill REVIEW_REQUIRED, REVIEW_REASON, and IMPLEMENTER_MAY_CLOSE. Link acceptance criteria to concrete required verification methods and expected behavior. Read relevant document sections; do not load unrelated project context.

```text
The active module/task from docs/MASTER_PLAN.md is now ready.

Inspect the real current state of the project and create a detailed
implementation plan for LUNA or a slightly weaker GPT coding model.

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

Make the plan detailed enough that LUNA or a weaker model mainly
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

Save the plan under docs/plans/ with a clear name.

Do not implement the task.
```

After creating the plan:

- mark it READY only after current-code inspection, material decisions, and verification requirements are complete; a DRAFT cannot be handed off for execution;
- update `.titan/STATE.md`;
- set `EXPECTED_ROLE: LUNA_IMPLEMENTER`;
- set `ACTIVE_PLAN`;
- set the first `NEXT_ACTION`;
- record any first STOP checkpoint.

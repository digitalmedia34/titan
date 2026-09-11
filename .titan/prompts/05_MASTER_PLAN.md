# Prompt — Master Development Plan

Use with role: `SOL_ARCHITECT`

```text
Based on the approved docs/PROJECT_SPEC.md and docs/ARCHITECTURE.md,
create the Master Development Plan.

The goal is not to plan every future coding step in detail.

Define:

1. main phases/modules;
2. dependencies between them;
3. implementation order;
4. what represents completion of each phase;
5. which phases require special SOL review;
6. which phases carry higher technical risk;
7. where integration checkpoints should occur;
8. when final QA should occur;
9. when deployment should occur.

Each phase should include:

- ID;
- name;
- goal;
- dependencies;
- main scope;
- primary acceptance goal;
- risk: LOW / MEDIUM / HIGH;
- review/checkpoint requirement if applicable.

Do not create detailed LUNA tasks for all future phases.

Detailed execution plans for LUNA must be created JUST IN TIME: only
when a phase actually reaches implementation and after inspecting the
current repository state at that time.

Save the result to:

docs/MASTER_PLAN.md
```

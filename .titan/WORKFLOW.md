# TITAN — Workflow

## Phase map

```text
00_INTAKE
↓
01_DISCOVERY
↓
02_FUNCTIONAL_SPEC
↓
03_ARCHITECTURE
↓
04_ARCHITECTURE_REVIEW (optional)
↓
05_MASTER_PLAN
↓
06_IMPLEMENTATION_LOOP
↓
07_INTEGRATION_CHECKPOINTS (when scheduled/needed)
↓
08_FINAL_REVIEW
↓
09_PRE_DEPLOY
↓
10_PRODUCTION_VERIFICATION
↓
11_COMPLETE
```

This is a lifecycle, not a requirement to create bureaucracy.

Skip optional work when it adds no value, but do not skip required reasoning gates merely to start coding faster.

---

## 01_DISCOVERY

**Default role:** `SOL_DISCOVERY`  
**Prompt:** `.titan/prompts/01_DISCOVERY.md`

Purpose:

- understand the real business problem;
- identify users, roles, workflows, lifecycle, rules, edge cases, and MVP;
- challenge assumptions;
- converge instead of brainstorming forever.

Output:

- discovery conclusions;
- open decisions;
- proposed MVP;
- deferred scope.

Gate:

- USER agrees discovery is mature enough to create the functional specification.

Next:

- `02_FUNCTIONAL_SPEC`

---

## 02_FUNCTIONAL_SPEC

**Default role:** `SOL_ARCHITECT`  
**Prompt:** `.titan/prompts/02_FUNCTIONAL_SPEC.md`

Output:

- `docs/PROJECT_SPEC.md`

Rules:

- unresolved points remain `OPEN DECISION`;
- do not silently invent missing business rules.

Gate:

- USER approves PROJECT_SPEC as the business/functional baseline.

Next:

- `03_ARCHITECTURE`

---

## 03_ARCHITECTURE

**Default role:** `SOL_ARCHITECT`  
**Prompt:** `.titan/prompts/03_SOL_ARCHITECTURE.md`

Output:

- `docs/ARCHITECTURE.md`

Goal:

- simplest maintainable architecture that satisfies the approved specification;
- identify data model, lifecycle, permissions, service boundaries, tests, and deployment assumptions.

Decision:

- if unusually complex/risky → `04_ARCHITECTURE_REVIEW`;
- otherwise → `05_MASTER_PLAN` after USER approval.

---

## 04_ARCHITECTURE_REVIEW — OPTIONAL

**Default role:** `ASTRA_CRITICAL_REVIEW`  
**Prompt:** `.titan/prompts/04_ASTRA_CRITICAL_REVIEW.md`

ASTRA does not redesign the system merely because it prefers another style.

ASTRA searches for serious omissions, contradictions, data risks, security problems, and expensive architectural mistakes.

Output:

- critical review findings.

Gate:

- USER + SOL decide which findings are accepted;
- SOL updates architecture/specification only when needed.

Next:

- `05_MASTER_PLAN`

---

## 05_MASTER_PLAN

**Default role:** `SOL_ARCHITECT`  
**Prompt:** `.titan/prompts/05_MASTER_PLAN.md`

Output:

- `docs/MASTER_PLAN.md`

Important:

- strategic roadmap only;
- no detailed LUNA plans for distant future modules;
- identify dependencies, risk, review points, and integration checkpoints.

Gate:

- USER approves the implementation baseline.

Next:

- `06_IMPLEMENTATION_LOOP`

---

# 06_IMPLEMENTATION_LOOP

This is the normal daily development loop.

## Step A — Select the next module

Use `docs/MASTER_PLAN.md` and `docs/STATUS.md`.

State should become approximately:

```text
EXPECTED_ROLE: SOL_PLANNER
ACTIVE_MODULE: PHASE-XX ...
ACTIVE_PLAN: NONE
NEXT_ACTION: Inspect current repository and create a just-in-time implementation plan.
```

## Step B — SOL creates the just-in-time plan

**Prompt:** `.titan/prompts/06_SOL_PLAN_FOR_LUNA.md`

SOL must inspect:

- current repository;
- relevant existing code;
- current approved documents;
- current tests.

Output:

- `docs/plans/<phase_or_task>.md`

The plan must be detailed enough that LUNA mainly executes instead of making important architectural or technical decisions.

After plan creation:

- set `EXPECTED_ROLE: LUNA_IMPLEMENTER`;
- set `ACTIVE_PLAN`;
- set `NEXT_ACTION` to the first step/checkpoint.

The USER performs the actual model switch.

## Step C — LUNA implements

**Prompt:** `.titan/prompts/07_LUNA_IMPLEMENT.md`

LUNA:

- reads the complete active plan;
- inspects the files named by the plan;
- implements in order;
- tests;
- respects STOP points;
- does not improvise architecture.

If a material conflict appears:

- set `PHASE_STATUS: BLOCKED`;
- describe the blocker;
- set `EXPECTED_ROLE: SOL_REVIEWER`;
- stop.

## Step D — STOP checkpoint

When the plan requires STOP:

- LUNA runs the required checks;
- reports actual results;
- sets `PLAN_CHECKPOINT`;
- sets `WAITING_FOR: USER_APPROVAL`;
- does not begin the next step.

If the USER says `Continue`, continue the active plan without re-planning unless something materially changed.

## Step E — Review decision

SOL review is **not automatic after every task**.

Use SOL review when:

- the active plan requires it;
- the module is high risk;
- security/auth/permissions/data integrity are involved;
- large migration/file handling/critical lifecycle is involved;
- the USER requests it;
- LUNA was blocked or materially deviated;
- an integration checkpoint is reached.

Prompt:

- `.titan/prompts/08_SOL_REVIEW.md`

Possible results:

- `PASS`
- `PASS_WITH_NOTES`
- `REPAIR_REQUIRED`
- `SOL_TAKEOVER`

## Step F — Close the module

When acceptance criteria and required review are satisfied:

- update `docs/STATUS.md`;
- update `docs/DECISIONS.md` only if a durable decision was made;
- update `docs/ARCHITECTURE.md` only if approved architecture actually changed;
- clear `ACTIVE_PLAN`;
- select the next module.

---

# 07_INTEGRATION_CHECKPOINTS

**Role:** `SOL_REVIEWER`  
**Prompt:** `.titan/prompts/09_INTEGRATION_CHECKPOINT.md`

Use after a meaningful group of interdependent modules or when the Master Plan calls for it.

Focus:

- modules working together;
- lifecycle/permission consistency;
- data integrity;
- architectural drift;
- technical debt that becomes expensive if postponed.

Do not use this for cosmetic refactor suggestions.

---

# UI/UX SIDE WORKFLOW

Use `.titan/templates/UI_BRIEF.md` and `.titan/prompts/11_LUNA_UI_TASK.md`.

UI work may occur during implementation, but visual intent must be explicit enough.

If USER intent is ambiguous, LUNA should avoid broad redesign based on its own interpretation.

SOL is not required for every UI adjustment.

---

# BUG SIDE WORKFLOW

Known trivial cause:

- LUNA may fix directly when scope and risk are low.

Unknown or cross-cutting cause:

- SOL first uses `.titan/prompts/10_SOL_DEBUG.md`.

Goal:

- establish root cause before repair planning;
- avoid blind iteration.

---

# 08_FINAL_REVIEW

**Role:** `SOL_REVIEWER`  
**Prompt:** `.titan/prompts/13_FINAL_PROJECT_REVIEW.md`

Compare the real implementation to the approved PROJECT_SPEC and architecture.

Separate findings into:

- BLOCKING
- NON_BLOCKING
- FUTURE_IMPROVEMENT

No scope creep.

---

# 09_PRE_DEPLOY

**Role:** `SOL_DEPLOY`  
**Prompt:** `.titan/prompts/12_SOL_PRE_DEPLOY.md`

Plan:

- backup;
- migrations;
- dependencies;
- build;
- environment/secrets;
- storage/permissions;
- caches;
- queue/cron if relevant;
- rollback;
- smoke tests;
- real integrations.

Gate:

- USER approves the actual production deployment.

---

# 10_PRODUCTION_VERIFICATION

Automated tests are not the same as real-environment verification.

Record:

- deployment result;
- smoke tests;
- real integrations that were actually tested;
- anything that was not tested.

Only claim `REAL_ENVIRONMENT_VERIFIED` for checks actually performed.

---

# 11_COMPLETE

The project can be marked complete when:

- MVP/MUST requirements are satisfied;
- required final review passes;
- deployment is verified to the agreed level;
- blockers are resolved or explicitly accepted;
- documentation/state are current.

Do not interpret COMPLETE as “no future improvements exist”.

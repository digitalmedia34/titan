# <PHASE/TASK ID> — Implementation Plan

STATUS: DRAFT
PLAN_SIZE: STANDARD / SHORT
PLANNED_BY: SOL
IMPLEMENTER: LUNA
RISK: LOW / MEDIUM / HIGH
REVIEW_REQUIRED: YES / NO
REVIEW_REASON: ...
IMPLEMENTER_MAY_CLOSE: YES / NO (only if no required review or USER gate remains)

Use one layout below, not both. Replace alternatives and placeholders before READY.
Status lifecycle and handoffs: `.titan/WORKFLOW.md`, Step B and State and handoff contract.

## SHORT layout (LOW-risk local tasks only)

Not for permissions/auth, destructive migrations, key business rules, or architecture changes.

- Goal and acceptance criteria: ...
- Current relevant state and files to read/change: ...
- Locked decisions / do not change: ...
- Ordered steps and any named STOP: ...
- Relevant failure/regression risks: ...
- Required checks and evidence: use the table below.
- Conflict rule: STOP on material conflict and follow the workflow handoff.

## STANDARD layout

## 1. Goal
...

## 2. Current relevant state
...

## 3. Locked decisions
...

## 4. Do not change
...

## 5. Read before implementation
- ...

## 6. Implementation steps

### Step A
...

### STOP?
YES / NO

### Step B
...

## 7. Validation / permissions / security
...

## 8. Edge cases
...

## 9. Failure behavior
...

## 10. Regression protection
...

## 11. Tests
...

## 12. Final checks
...

## 13. Acceptance criteria
- [ ] ...
- [ ] ...

## 14. Conflict rule
If this plan materially conflicts with the real project, STOP and escalate instead of redesigning the system during implementation.

## Verification evidence (both layouts)

SOL fills criterion, method, and expected behavior before READY. LUNA records actual results. Add rows as needed; select checks by risk and affected behavior.

| Acceptance criterion | Required command / manual procedure | Expected behavior | Actual result / evidence | Result |
| --- | --- | --- | --- | --- |
| ... | ... | ... | Not executed yet | NOT_RUN |

Results: PASS / FAIL / NOT_RUN. Required FAIL or NOT_RUN prevents completion; record reason and consequence. Distinguish automated, browser/manual, and production checks. Name any environment prerequisite before execution.

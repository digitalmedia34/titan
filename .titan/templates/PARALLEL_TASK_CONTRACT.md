# TITAN Parallel Task Contract

Copy this template once per worker task. SOL owns preparation and readiness. The assigned LUNA worker owns execution evidence. Do not start until `STATUS` is `READY` and dependencies are satisfied.

## Contract

- Run ID:
- Contract ID:
- Title:
- Status: DRAFT
- Coordinator (SOL):
- Assigned worker (LUNA):
- Branch/worktree:
- Created from commit:
- Depends on: NONE | contract IDs and required checkpoint
- Blocks: NONE | contract IDs

## Objective and boundary

- Outcome:
- Approved scope/source:
- In scope:
- Out of scope:
- Locked decisions:

## File ownership

- OWNS (worker may change):
  -
- READ_ONLY (inspect, do not change):
  -
- Shared files or interfaces touched: NONE | list and explain ownership/dependency

The worker may change only `OWNS`. If the actual change requires another path, STOP and request coordinator review before editing it.

## Execution

- Required context to read:
- Steps:
  1.
- STOP conditions:
  - Material mismatch with approved source or current code.
  - Required change falls outside `OWNS` or locked decisions.
  - Dependency/checkpoint is missing or failed.

## Acceptance and evidence

| Criterion | Verification command/procedure | Expected result | Actual result (worker) | Status: PASS / FAIL / NOT_RUN |
| --- | --- | --- | --- | --- |
| | | | | |

- Handoff commit:
- Files changed:
- Deviations/blockers:
- Evidence/log location:
- Worker recommendation: IMPLEMENTED | BLOCKED
- Coordinator integration/review result:
- Coordinator closure: ACCEPTED | NOT_ACCEPTED

## Readiness decision (SOL)

- Relevant repository inspected at commit:
- Dependencies satisfied or explicitly scheduled:
- Write set is bounded and non-overlapping with concurrent tasks: YES / NO
- Architecture/product decisions resolved within approved scope: YES / NO
- Required checks and STOP conditions concrete: YES / NO
- STATUS: DRAFT | READY
- Prepared by / date:

# Parallel Orchestration Hardening — Implementation Plan

STATUS: WAITING_FOR_REVIEW
PLAN_SIZE: STANDARD
PLANNED_BY: SOL
IMPLEMENTER: LUNA
RISK: HIGH
REVIEW_REQUIRED: YES
REVIEW_REASON: Worker lifecycle, filesystem isolation, permissions, and persistent run state affect data integrity and execution safety.
IMPLEMENTER_MAY_CLOSE: NO

## 1. Goal

Harden TITAN Parallel for supervised repeatable work by fixing cross-platform ownership conflicts, bounding worker lifetimes, defining safe retry and interruption behavior, making persisted state useful for recovery, and enforcing task verification commands.

## 2. Current relevant state

- Merged implementation is based at `1853fcb`.
- `src/parallel/index.js` creates one worktree per task, stores run/task/event rows in SQLite, retries in the same worktree, and validates committed paths.
- `src/parallel/cli.js` exposes only `run`; it does not handle SIGINT or persist enough configuration to resume.
- Provider adapters execute Codex/Copilot CLI processes; the generic process adapter is unsandboxed.
- The three-worker demo uses a mock adapter; provider tests mock child processes.

## 3. Locked decisions

- Keep parallel execution opt-in and preserve the initializer's Node 18 compatibility.
- Never merge worker branches into the coordinator checkout automatically.
- Preserve successful worker commits and branches across cancellation/recovery.
- A retry starts from the task's clean initial commit (including dependency commits), not from failed-attempt partial output.
- Resume is explicit by run ID. A resumed run reuses recorded successful tasks and restarts incomplete tasks from a clean base; it does not replay completed workers.
- Verification commands are explicit task contract data, executed by the coordinator in the task worktree after a worker reports success. Criteria without an executable check remain coordinator review obligations.
- Provider adapters remain under the invoking user's account; document that worktrees do not isolate credentials or external side effects. Do not claim OS-level isolation.

## 4. Do not change

- The serial TITAN workflow, existing role authority, and no-auto-merge boundary.
- Existing provider behavior without a deliberate compatibility note.
- Node package runtime requirement for the initializer.

## 5. Read before implementation

- `src/parallel/index.js`
- `src/parallel/cli.js`
- `src/parallel/index.d.ts`
- `src/adapters/*.js`
- `docs/PARALLEL_CLI.md`
- `test/parallel-core.test.js`, `test/parallel-run.test.js`, `test/adapters.test.js`
- `.titan/WORKFLOW.md`

## 6. Implementation steps

### Step A — Ownership and run identity

- Canonicalize ownership paths consistently for overlap and reservation checks, including case-insensitive comparisons on Windows.
- Validate task IDs against filesystem path semantics and reject ambiguous ownership forms.
- Derive worktree namespaces from repository identity so same-named checkouts do not collide.

### Step B — Bounded worker lifecycle

- Add per-task timeout configuration and a run-level abort controller in the CLI.
- On timeout or SIGINT, stop scheduling, abort active provider processes, persist cancellation status, and preserve inspectable worktrees.
- Ensure timed-out workers are awaited/terminated before returning; do not treat cancellation as a retryable worker failure.
- Reset failed-attempt task worktrees to their recorded task base before retrying.

### Step C — Persistence and resume

- Persist the full validated task contract plus adapter/run configuration and base commit.
- Add explicit status/resume CLI actions.
- Resume only after verifying repository identity and saved branch/worktree state; keep succeeded branches, reset incomplete tasks, and continue with remaining attempt budget.
- Make interrupted `running` rows distinguishable from active processes; record final run state on cancellation/failure.

### Step D — Verification and adapter safety

- Add optional structured `verificationCommands` to contracts, run them after worker completion with timeout and separate logs, and fail the task on a failing check.
- Clearly identify the `process` adapter as trusted-command-only and require an explicit CLI opt-in for it.
- Document provider account/credential and external side-effect limits. Keep no-auto-merge and no-deploy behavior.
- Add an optional real-provider smoke workflow that checks CLI availability/version without consuming model calls; keep actual agent execution opt-in.

### Step E — Docs, declarations, tests

- Update CLI and methodology docs with retry, cancel, resume, verification, and provider boundaries.
- Extend declarations and tests for Windows path overlap, timeouts, cancellation, retries from clean state, resume, verification failures, and explicit process-adapter opt-in.

### STOP?

NO. The user approved these architecture hardening changes. Do not publish, deploy, merge, or release.

## 7. Validation / permissions / security

- Run `npm test`, `git diff --check`, CLI help/argument checks, and the three-worker mock demonstration.
- Verify worker checkout and coordinator checkout remain isolated.
- Verify cancellation leaves no running subprocesses and preserves branches/worktrees for inspection.
- Test adapter invocations with fakes; report real-provider execution as NOT_RUN unless explicitly run with user credentials.

## 8. Edge cases

- Case-only overlapping paths on Windows.
- Task timeout during output, retry, dependency merge, and verification.
- SIGINT before scheduling, while workers run, and during a dependency chain.
- Resume after process crash, partial worker commit, missing branch, dirty worktree, and changed repository identity.
- Multiple repositories with identical directory basenames.
- Verification command exits nonzero or times out.

## 9. Failure behavior

- Unsafe contracts fail validation before creating worktrees.
- A task timeout/cancel is persisted as `timed_out`/`cancelled`; it does not consume another attempt.
- Failed-attempt work is reset before retry; final failed/cancelled worktrees remain available.
- Resume refuses mismatched or ambiguous state rather than guessing.
- Verification failure fails the task and blocks dependents.

## 10. Regression protection

- Existing task JSON remains valid; new verification fields and timeout options are optional.
- Existing `runParallel` API remains callable without new options.
- No worker branch is merged to the coordinator/main branch by the orchestrator.

## 11. Tests

- Unit tests for path normalization/reserved paths and run namespace.
- Integration tests for cancellation, timeout, retry reset, persisted resume, verification commands, and blocked dependencies.
- Adapter tests ensure abort signals and process opt-in behavior are passed as intended.

## 12. Final checks

- Full `npm test`.
- `git diff --check`.
- Three-worker mock demo.
- Review docs and generated CLI usage.
- Confirm branch is based on merged main and working tree is committed.

## 13. Acceptance criteria

- [ ] Path ownership overlap is consistent with host filesystem semantics.
- [ ] Active tasks have bounded runtime and graceful cancellation; pending tasks do not start after cancellation.
- [ ] Retries start from the clean recorded task base and cancellation preserves evidence.
- [ ] Run state has explicit resume semantics and validates repository/branch state.
- [ ] Configured verification commands run and gate success/dependents.
- [ ] Unsandboxed process execution requires explicit opt-in and provider limits are documented.
- [ ] All required automated checks pass; real provider runs are clearly distinguished from mocked tests.

## 14. Conflict rule

If implementation cannot meet resume/cancellation invariants without risky destructive worktree manipulation, stop and report the blocker before proceeding.

## Verification evidence

| Acceptance criterion | Required command / manual procedure | Expected behavior | Actual result / evidence | Result |
| --- | --- | --- | --- | --- |
| Ownership overlap | `npm test` | Case-only overlaps are rejected on Windows | Core tests cover case-insensitive and case-sensitive path rules; full suite passed | PASS |
| Lifecycle | `npm test` | Timeout and cancellation stop workers, preserve evidence, and stop queueing | Integration tests cover timeout, cancellation, pending-task suppression, and worktree preservation; full suite passed | PASS |
| Retry/resume | `npm test` | Retry starts clean; resume reuses only valid successful work | Integration tests prove failed-attempt commit is removed, completed worker is skipped, and bounded retry resumes; full suite passed | PASS |
| Verification | `npm test` | Failed/timeout check fails task and blocks dependents | Integration test runs a failing argv verifier and confirms dependent is blocked; full suite passed | PASS |
| Regression/demo | `npm test`; `node examples/parallel-three-workers.js` | Existing behavior remains sound; three worktrees succeed | `npm test`: 10/10 passed; three mock workers completed in isolated worktrees; `git diff --check` passed | PASS |

Provider CLIs were not invoked against live models. The demo used the existing mock adapter and real Git worktrees.

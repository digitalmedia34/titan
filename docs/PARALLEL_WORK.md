# TITAN Parallel v1.0

TITAN Parallel is an **opt-in way to execute independent implementation tasks concurrently**. It extends the TITAN lifecycle; it does not replace role authority, approval gates, project state, or the SOL-to-LUNA handoff. Existing projects continue using the serial workflow unchanged unless they opt in.

## Operating principles

- **SOL prepares; LUNA executes.** SOL inspects the current repository and creates a READY contract for every worker. Codex and Copilot are environments, not TITAN roles.
- **The USER owns decisions.** The coordinator can schedule work within approved scope. Strategic gates, scope changes, and decisions reserved by `AGENTS.md` remain with the USER unless authority was explicitly delegated and recorded.
- **STOP on conflict.** When reality materially conflicts with a contract, the worker stops and reports the mismatch. The coordinator routes it to SOL or the USER; nobody silently invents a new requirement or architecture.
- **Parallelism requires independence.** Tasks must have separate write ownership and must not depend on each other's unfinished outputs. Declare dependencies and schedule them after prerequisites.
- **Integration is required.** Passing checks on separate branches does not prove the combined result. Integrate and verify the combined work before closure under the existing workflow.

## Roles and authority

### Coordinator (SOL)

The coordinator owns the run plan and shared project navigation. SOL confirms implementation is authorized, checks existing baselines and approvals, inspects the repository, defines contracts and dependencies, marks contracts READY, assigns LUNA workers, tracks evidence, integrates in dependency order, runs combined checks, and updates shared project state at meaningful transitions. Coordinator status adds no product authority: SOL cannot baseline unapproved architecture, accept scope expansion, waive required checks, or approve a USER gate.

### Workers (LUNA)

Each worker executes one READY contract in its own Git worktree and branch. It may make local choices within locked decisions and owned paths. It must not change shared project navigation or another worker's owned paths. It reports checks and evidence to the coordinator and does not declare the overall run accepted.

ASTRA may independently challenge a high-risk decision when called for by the normal workflow. ASTRA does not dispatch implementation or replace USER/SOL decisions.

## Shared state and worker state

`.titan/STATE.md` on the coordinator's integration branch is the single authoritative project state. Workers read it as a snapshot and do not race to update it.

Coordinator-owned TITAN state and planning documents, including `.titan/**`, `docs/STATUS.md`, `docs/DECISIONS.md`, `docs/MASTER_PLAN.md`, `docs/PROJECT_INTAKE.md`, `docs/PROJECT_SPEC.md`, and `docs/ARCHITECTURE.md`, are not worker write targets.

Each contract carries worker execution status and evidence in its own plan/run record. Suggested statuses are `DRAFT`, `READY`, `IN_PROGRESS`, `BLOCKED`, `IMPLEMENTED`, and `ACCEPTED`, using the existing meanings and evidence rules in `.titan/WORKFLOW.md`. A worker can report `IMPLEMENTED`; only the coordinator applies integration/review outcomes and closes combined work. These per-contract states supplement, and never override, project phase or active plan status.

The coordinator keeps a concise run ledger: contract ID, assigned worker and branch, dependencies, status, latest commit, check results, and blockers. Keep logs out of `.titan/STATE.md`; it remains a navigator. Update shared state at meaningful transitions and point to contracts/ledger as appropriate.

## Scheduling and integration

The CLI requires a non-empty repository-relative `owns` list, rejects coordinator state paths, and rejects overlapping ownership unless one task depends on the other.

1. SOL records task dependencies as a directed acyclic graph. Work starts only after its declared prerequisites reach the required checkpoint.
2. Concurrent tasks must have non-overlapping write sets and no dependency on unfinished decisions or outputs. Shared configuration, schemas, public interfaces, and lockfiles are conflicts unless explicitly assigned to one task with downstream dependencies.
3. Each worker commits only its contract changes. Before integration, the coordinator checks the changed-file set against ownership.
4. Integrate in dependency order. Recheck downstream contracts against any changed prerequisite interface before starting or resuming them.
5. Resolve conflicts only when approved sources define the correct behavior. If resolution needs a product, architecture, or scope decision, STOP and route it to the proper owner.
6. Run contract checks and combined integration checks. Record `PASS`, `FAIL`, or `NOT_RUN` with the actual command/procedure. Required FAIL or NOT_RUN blocks completion under the existing workflow.
7. Apply normal SOL review, USER gates, and closure rules. Parallel completion alone is not acceptance.

## Task contract

Use `.titan/templates/PARALLEL_TASK_CONTRACT.md` for each worker task. IDs are stable within a run. `OWNS` lists paths the worker may change; `READ_ONLY` lists relevant inputs. An empty or ambiguous write set means the task is not READY. Every contract names its dependencies, locked decisions, checks, STOP conditions, and handoff evidence.

For the Node CLI, task JSON format, adapter setup, state/log locations, and worktree lifecycle, see [`PARALLEL_CLI.md`](PARALLEL_CLI.md).

## Example: three independent tasks

This example is illustrative; SOL must inspect the repository and confirm the baseline and file independence before marking these READY.

| Contract | Worker-owned paths | Depends on | Acceptance evidence |
| --- | --- | --- | --- |
| `DOC-01` | `docs/api/authentication.md` | none | Matches approved auth behavior; links resolve. |
| `DOC-02` | `docs/api/pagination.md` | none | Matches current API behavior; examples are consistent. |
| `DOC-03` | `docs/operations/health-checks.md` | none | Matches current health endpoints; runbook steps are actionable. |

The workers can start in isolated worktrees because the write sets do not overlap and they need no unfinished output from one another. Each commits its document and reports checks. SOL verifies ownership, integrates the three commits, runs combined documentation checks, and reports any required review. If repository inspection shows a shared, unapproved API contract is needed first, SOL adds that prerequisite and holds dependent work.

## Compatibility

Parallel work is not a new default phase and does not alter existing role names, `STATE.md` vocabulary, plan lifecycle, or strategic approval gates. Suitable READY contracts may be run serially in dependency order when parallel execution is unavailable or disabled.

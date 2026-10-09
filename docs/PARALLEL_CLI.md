# TITAN Parallel CLI

The original `titan` initializer remains unchanged. Parallel orchestration is an opt-in subcommand and requires Node.js 22.13 or later because it uses the built-in SQLite module. The package still supports Node.js 18 for initialization and other existing behavior.

## Task file

Create a JSON array with one object per READY task. `instructions` is the worker brief. Include `owns`, `readOnly`, `lockedDecisions`, `requiredContext`, and `stopConditions` when applicable, plus `acceptanceCriteria`, `dependsOn`, and adapter-specific inputs.

```json
[
  {
    "id": "DOC-01",
    "title": "Document authentication",
    "instructions": "Update docs/api/authentication.md to match the approved API behavior.",
    "owns": ["docs/api/authentication.md"],
    "readOnly": ["docs/api/overview.md"],
    "lockedDecisions": ["Use the approved v2 API behavior"],
    "stopConditions": ["Stop if current code conflicts with the approved behavior"],
    "acceptanceCriteria": ["Only the assigned file changes", "Examples match the current API"],
    "dependsOn": []
  },
  {
    "id": "DOC-02",
    "title": "Document pagination",
    "instructions": "Update docs/api/pagination.md to match the approved API behavior.",
    "owns": ["docs/api/pagination.md"],
    "readOnly": ["docs/api/overview.md"],
    "acceptanceCriteria": ["Only the assigned file changes", "Examples match the current API"],
    "dependsOn": []
  },
  {
    "id": "TEST-01",
    "title": "Add API examples",
    "instructions": "Add examples after reading the completed authentication and pagination docs.",
    "owns": ["docs/api/examples/"],
    "acceptanceCriteria": ["Examples cover both authentication and pagination"],
    "dependsOn": ["DOC-01", "DOC-02"]
  }
]
```

IDs may contain letters, digits, periods, underscores, and hyphens. Dependencies must reference task IDs in the same file and form an acyclic graph. `maxAttempts` may override the run default for a task; retry limits are 1 through 10.

## Run

From the repository root, load the built-in Codex, Copilot, and process adapters:

```sh
node bin/titan.js parallel run \
  --tasks ./parallel-tasks.json \
  --adapter codex \
  --adapter-module ./src/adapters/index.js \
  --concurrency 3 \
  --max-attempts 2 \
  --base-ref HEAD
```

Use `--adapter copilot` to select Copilot. A task can set its own `adapter` when the run mixes providers. The adapter module exports an `adapters` map. CLI tasks use `instructions` and optional contract fields to create the provider prompt. The process adapter accepts `command` and `commandArgs`; set `appendPrompt: true` if the command expects the TITAN task prompt as a final argument.

The command creates one branch and Git worktree per task. It schedules ready tasks up to the concurrency limit, retries failed tasks only up to the configured bound, and marks dependents blocked when a prerequisite fails. Worker changes remain in their branches for coordinator review; the orchestrator never merges them into the coordinator's integration branch.

When a task depends on another task, the coordinator merges successful prerequisite branch commits into its worktree before execution so downstream workers see those outputs.

By default, worktrees and task branches are retained so the coordinator can inspect and integrate worker changes. Pass `--cleanup-worktrees` to remove clean worker checkouts after reviewing them; task branches remain available for integration. A worktree with uncommitted changes is preserved and logged as a cleanup warning. Logs and run state are kept separately from the project checkout:

- SQLite: `~/.titan/parallel/state.sqlite`
- Attempt logs: `~/.titan/parallel/logs/<run-id>/<task-id>/attempt-<n>.log`
- Worktrees while running: a `.titan-worktrees` folder beside the repository

Pass `--state-dir <path>` to use a different directory for the SQLite database and logs.

The CLI reports the run ID, each task's worktree and branch, result, and log paths as JSON. It requires workers to commit their changes and verifies committed file changes against `owns`. A failed task or blocked dependent makes the run fail. A successful run is still only `IMPLEMENTED`; the coordinator must review commits, integrate in dependency order, run combined checks, and apply the ordinary TITAN review and closure gates.

## Provider requirements

Install and authenticate the provider CLI before assigning tasks to it:

- Codex: `codex` CLI available on `PATH`.
- Copilot: `copilot` CLI available on `PATH`.

The Codex adapter uses the `workspace-write` sandbox and disables approval prompts for that sandboxed run. The Copilot adapter grants the write and shell tools, denies Git push and merge, package publishing, and common cloud deployment commands, and leaves its default path verification enabled. The generic `process` adapter launches `task.command` directly without an OS sandbox; use it only for commands you trust. Git worktrees isolate branch contents, while provider CLIs still run under the invoking user's account.

For a no-provider integration demonstration using three real isolated worktrees, run [`../examples/parallel-three-workers.js`](../examples/parallel-three-workers.js).

# Three isolated workers demo

From the repository root, run:

```sh
node examples/parallel-three-workers.js
```

The coordinator creates three independent Git worktrees and runs the same mock
provider concurrently in each one. The mock writes one distinct marker file per
worker, so the example is safe when neither `codex` nor `copilot` is installed
and does not call an external model. It uses `HEAD` as the starting revision,
keeps the worktrees for inspection, and puts SQLite state under the system temp
folder. Remove the generated worktrees and `titan/parallel/<run-id>/...`
branches manually after inspecting the printed result.

To use real providers through the CLI, select `codex` or `copilot`; each worker
receives only its own task contract and worktree path. Provider CLIs must be
installed and authenticated separately.
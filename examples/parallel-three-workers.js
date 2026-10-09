'use strict';

// Safe integration example: the coordinator still creates real isolated Git
// worktrees, while this adapter simulates provider work without invoking an AI CLI.
const fs = require('node:fs/promises');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const os = require('node:os');
const { runParallel } = require('../src/parallel');

async function main() {
  const workers = [
    { id: 'worker-one', title: 'Independent worker one', instructions: 'Create a one-line marker for worker one.', owns: ['parallel-demo-worker-one.txt'] },
    { id: 'worker-two', title: 'Independent worker two', instructions: 'Create a one-line marker for worker two.', owns: ['parallel-demo-worker-two.txt'] },
    { id: 'worker-three', title: 'Independent worker three', instructions: 'Create a one-line marker for worker three.', owns: ['parallel-demo-worker-three.txt'] },
  ];
  const mock = {
    id: 'mock',
    async run({ task, worktreePath, onLog }) {
      const marker = path.join(worktreePath, `parallel-demo-${task.id}.txt`);
      await fs.writeFile(marker, `${task.id}: isolated worktree\n`, { flag: 'wx' });
      execFileSync('git', ['add', path.basename(marker)], { cwd: worktreePath, stdio: 'ignore' });
      execFileSync('git', ['commit', '-m', `demo worker: ${task.id}`], { cwd: worktreePath, stdio: 'ignore' });
      onLog?.('wrote ' + path.basename(marker));
      return { exitCode: 0, output: `created ${marker}` };
    },
  };
  const result = await runParallel({
    tasks: workers,
    adapters: { mock },
    adapter: 'mock',
    concurrency: 3,
    repoRoot: process.cwd(),
    stateDir: path.join(os.tmpdir(), 'titan-parallel-demo-state'),
    baseRef: 'HEAD',
    keepWorktrees: true,
    runId: `three-workers-${Date.now()}`,
  });
  console.log(JSON.stringify(result, null, 2));
  console.log('Three independent mock workers completed in separate Git worktrees.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

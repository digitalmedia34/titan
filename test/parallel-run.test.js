'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { runParallel } = require('../src/parallel');

const nodeVersion = process.versions.node.split('.').map(Number);
const supportsParallel = nodeVersion[0] > 22 || (nodeVersion[0] === 22 && nodeVersion[1] >= 13);

test('schedules dependencies, retries within a bound, and persists isolated worker results', { skip: !supportsParallel }, async () => {
  const tempRoot = fs.mkdtempSync(path.join(__dirname, '.tmp-parallel-run-'));

  try {
    const repoRoot = path.join(tempRoot, 'repo');
    const stateDir = path.join(tempRoot, 'state');
    fs.mkdirSync(repoRoot);
    const git = (args) => execFileSync('git', args, { cwd: repoRoot, stdio: 'ignore' });
    git(['init', '-b', 'main']);
    git(['config', 'user.name', 'TITAN test']);
    git(['config', 'user.email', 'titan-test@example.invalid']);
    fs.writeFileSync(path.join(repoRoot, 'README.md'), 'fixture\n');
    git(['add', 'README.md']);
    git(['commit', '-m', 'fixture']);

    const active = new Set();
    const completed = new Set();
    const firstAttemptByTask = new Map();
    let maximumActive = 0;
    const adapter = {
    id: 'fixture',
    async run({ task, worktreePath, attempt, onLog }) {
      active.add(task.id);
      maximumActive = Math.max(maximumActive, active.size);
      try {
        if (task.id === 'dependent') {
          assert.ok(completed.has('prerequisite'));
          assert.ok(fs.existsSync(path.join(worktreePath, 'prerequisite.txt')), 'dependent worker receives prerequisite commits');
        }
        if (task.id === 'retry') {
          firstAttemptByTask.set(task.id, attempt);
          if (attempt === 1) {
            onLog('temporary failure');
            await new Promise((resolve) => setTimeout(resolve, 10));
            return { exitCode: 1, output: 'retry this task' };
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 25));
        fs.writeFileSync(path.join(worktreePath, `${task.id}.txt`), `${task.id}\n`);
        execFileSync('git', ['add', `${task.id}.txt`], { cwd: worktreePath, stdio: 'ignore' });
        execFileSync('git', ['commit', '-m', `worker: ${task.id}`], { cwd: worktreePath, stdio: 'ignore' });
        onLog(`finished ${task.id}`);
        completed.add(task.id);
        return { exitCode: 0, output: `finished ${task.id}` };
      } finally {
        active.delete(task.id);
      }
    },
    };

    const result = await runParallel({
      tasks: [
        { id: 'retry', title: 'Retries once', owns: ['retry.txt'], maxAttempts: 2 },
        { id: 'prerequisite', title: 'Prerequisite', owns: ['prerequisite.txt'] },
        { id: 'dependent', title: 'Waits for prerequisite', owns: ['dependent.txt'], dependsOn: ['prerequisite'] },
      ],
      adapters: { fixture: adapter },
      adapter: 'fixture',
      concurrency: 2,
      repoRoot,
      stateDir,
      baseRef: 'main',
      keepWorktrees: false,
      runId: 'integration-test',
    });

    assert.equal(result.status, 'succeeded');
    assert.equal(firstAttemptByTask.get('retry'), 2);
    assert.ok(maximumActive >= 2, 'independent workers should overlap');
    assert.deepEqual(Object.values(result.results).map((item) => item.status), ['succeeded', 'succeeded', 'succeeded']);
    assert.equal(fs.existsSync(path.join(repoRoot, 'retry.txt')), false, 'worker edits stay out of the coordinator checkout');
    assert.equal(fs.existsSync(path.join(repoRoot, 'prerequisite.txt')), false);
    assert.equal(fs.existsSync(path.join(repoRoot, 'dependent.txt')), false);
    assert.ok(Object.values(result.results).every((item) => !fs.existsSync(item.worktreePath)), 'explicit cleanup removes clean worktrees');
    for (const item of Object.values(result.results)) assert.match(execFileSync('git', ['branch', '--list', item.branch], { cwd: repoRoot, encoding: 'utf8' }), /titan\/parallel\//, 'worker branch retains its commit');
    assert.match(fs.readFileSync(path.join(result.logRoot, 'retry', 'attempt-1.log'), 'utf8'), /temporary failure/);
    assert.match(fs.readFileSync(result.results.dependent.logFile, 'utf8'), /finished dependent/);

    const { DatabaseSync } = require('node:sqlite');
    const db = new DatabaseSync(result.stateDatabase, { readOnly: true });
    try {
      assert.equal(db.prepare('SELECT status FROM runs WHERE id = ?').get(result.runId).status, 'succeeded');
      assert.equal(db.prepare('SELECT attempts FROM tasks WHERE run_id = ? AND id = ?').get(result.runId, 'retry').attempts, 2);
      assert.equal(db.prepare('SELECT branch FROM tasks WHERE run_id = ? AND id = ?').get(result.runId, 'retry').branch, result.results.retry.branch);
      assert.ok(db.prepare('SELECT COUNT(*) AS count FROM events WHERE run_id = ?').get(result.runId).count >= 7);
    } finally {
      db.close();
    }

    const cliTaskFile = path.join(repoRoot, 'cli-tasks.json');
    const cliStateDir = path.join(tempRoot, 'cli-state');
    const cliCode = "require('node:fs').writeFileSync('cli-output.txt','ok\\n'); require('node:child_process').execFileSync('git',['add','cli-output.txt']); require('node:child_process').execFileSync('git',['commit','-m','cli worker']);";
    fs.writeFileSync(cliTaskFile, JSON.stringify([{ id: 'cli-worker', title: 'CLI worker', instructions: 'Create and commit cli-output.txt.', owns: ['cli-output.txt'], command: process.execPath, commandArgs: ['-e', cliCode] }]));
    const cliOutput = execFileSync(process.execPath, [
      path.join(__dirname, '..', 'bin', 'titan.js'), 'parallel', 'run',
      '--tasks', 'cli-tasks.json', '--adapter', 'process', '--adapter-module', path.join(__dirname, '..', 'src', 'adapters', 'index.js'),
      '--state-dir', cliStateDir, '--base-ref', 'main', '--cleanup-worktrees',
    ], { cwd: repoRoot, encoding: 'utf8' });
    const cliResult = JSON.parse(cliOutput);
    assert.equal(cliResult.status, 'succeeded');
    assert.equal(fs.existsSync(cliResult.results['cli-worker'].worktreePath), false);
    assert.match(execFileSync('git', ['branch', '--list', cliResult.results['cli-worker'].branch], { cwd: repoRoot, encoding: 'utf8' }), /titan\/parallel\//);
    await assert.rejects(runParallel({
      tasks: [{ id: 'retry', title: 'duplicate run ID fixture', owns: ['retry.txt'] }],
      adapters: { fixture: adapter }, adapter: 'fixture', repoRoot, stateDir, runId: 'integration-test',
    }), /UNIQUE constraint/);

    const failingAdapter = { id: 'fail', async run() { return { exitCode: 1, output: 'expected failure' }; } };
    const failedRun = await runParallel({
      tasks: [
        { id: 'failure', title: 'Fails once', owns: ['failure.txt'], maxAttempts: 1 },
        { id: 'blocked', title: 'Needs failed task', owns: ['blocked.txt'], dependsOn: ['failure'] },
      ],
      adapters: { fail: failingAdapter }, adapter: 'fail', repoRoot, stateDir, baseRef: 'main', keepWorktrees: false, runId: 'blocked-test',
    });
    assert.equal(failedRun.status, 'failed');
    assert.equal(failedRun.results.failure.status, 'failed');
    assert.equal(failedRun.results.blocked.status, 'blocked');
  } finally {
    const resolvedTemp = path.resolve(tempRoot);
    const resolvedTestDir = path.resolve(__dirname);
    assert.ok(resolvedTemp.startsWith(resolvedTestDir + path.sep));
    fs.rmSync(resolvedTemp, { recursive: true, force: true });
  }
});

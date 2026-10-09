'use strict';
const { createCodexAdapter } = require('../src/adapters/codex');
const { createCopilotAdapter } = require('../src/adapters/copilot');
const { createProcessAdapter } = require('../src/adapters/process-adapter');
const { taskPrompt } = require('../src/adapters/prompt');
const { EventEmitter } = require('node:events');
const { PassThrough } = require('node:stream');
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const task = { id: 'worker-a', instructions: 'Update only the assigned module.', owns: ['src/assigned.js'], readOnly: ['docs/architecture.md'], lockedDecisions: ['Keep the existing API'], stopConditions: ['If the API contract conflicts'], acceptanceCriteria: ['No cross-worker writes'], globalState: 'secret coordinator state', siblingWorktrees: ['../worker-b'] };

for (const [name, createAdapter, command] of [
  ['Codex', createCodexAdapter, 'codex'],
  ['Copilot', createCopilotAdapter, 'copilot'],
]) {
  test(`${name} receives the task in its own worktree and returns provider result`, async () => {
    let invocation;
    const logs = [];
    const adapter = createAdapter({ runCommand: async (options) => { invocation = options; options.onLog('worker output'); return { exitCode: 0, output: 'worker output' }; } });
    const worktreePath = path.resolve('worktrees/worker-a');
    const result = await adapter.run({ task, worktreePath, attempt: 2, onLog: (entry) => logs.push(entry) });
    assert.equal(adapter.id, name.toLowerCase());
    assert.equal(invocation.command, command);
    assert.equal(invocation.cwd, worktreePath);
    assert.equal(typeof invocation.onLog, 'function');
    assert.equal(invocation.signal, undefined);
    const prompt = name === 'Codex' ? invocation.args.at(-1) : invocation.args[1];
    assert.match(prompt, /worker-a/);
    assert.match(prompt, /No cross-worker writes/);
    assert.match(prompt, /src\/assigned.js/);
    assert.match(prompt, /Keep the existing API/);
    assert.match(prompt, /If the API contract conflicts/);
    assert.doesNotMatch(prompt, /secret coordinator state|worker-b/);
    if (name === 'Codex') assert.deepEqual(invocation.args.slice(0, 7), ['exec', '--sandbox', 'workspace-write', '--ask-for-approval', 'never', '--cd', worktreePath]);
    else {
      assert.deepEqual(invocation.args.slice(0, 1), ['-p']);
      assert.ok(invocation.args.includes('--allow-tool=write,shell'));
      assert.ok(invocation.args.includes('--deny-tool=shell(git push)'));
      assert.ok(invocation.args.includes('--deny-tool=shell(git merge)'));
      assert.ok(invocation.args.includes('--deny-tool=shell(npm publish)'));
      assert.ok(invocation.args.includes('--deny-tool=shell(azd up)'));
      assert.ok(invocation.args.includes('--deny-tool=shell(terraform apply)'));
      assert.ok(invocation.args.includes('--no-ask-user'));
    }
    assert.deepEqual(result, { exitCode: 0, output: 'worker output' });
    assert.deepEqual(logs, ['worker output']);
  });
}

test('task prompt refuses malformed contracts', () => { assert.throws(() => taskPrompt({ id: 'missing-instructions' }, 1), /task must include/); });

test('process runner captures output, streams logs and resolves the exit code', async () => {
  const child = new EventEmitter(); child.stdout = new PassThrough(); child.stderr = new PassThrough();
  let commandOptions; const logs = [];
  const { runCommand } = require('../src/adapters/process');
  const pending = runCommand({ command: 'fake', args: [], cwd: process.cwd(), onLog: (item) => logs.push(item), spawnProcess: (_command, _args, options) => { commandOptions = options; return child; } });
  child.stdout.write('hello'); child.stderr.write('warning'); child.emit('close', 7, null);
  assert.deepEqual(await pending, { exitCode: 7, output: 'hellowarning' });
  assert.equal(commandOptions.shell, false);
  assert.deepEqual(logs, ['hello', 'warning']);
});test('process adapter executes the task-selected command in its isolated worktree', async () => {
  let invocation;
  const adapter = createProcessAdapter({ runCommand: async (options) => { invocation = options; return { exitCode: 0, output: 'ok' }; } });
  const result = await adapter.run({ task: { ...task, command: 'fake-worker', commandArgs: ['--quiet'], appendPrompt: true }, worktreePath: 'worktrees/process-worker', attempt: 1 });
  assert.equal(adapter.id, 'process');
  assert.equal(invocation.command, 'fake-worker');
  assert.deepEqual(invocation.args.slice(0, 1), ['--quiet']);
  assert.match(invocation.args[1], /worker-a/);
  assert.equal(invocation.cwd, path.resolve('worktrees/process-worker'));
  assert.deepEqual(result, { exitCode: 0, output: 'ok' });
});


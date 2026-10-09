'use strict';
const path = require('node:path');
const { runCommand } = require('./process');
const { taskPrompt } = require('./prompt');
function createCodexAdapter(options = {}) {
  const command = options.command || 'codex';
  const run = options.runCommand || runCommand;
  return { id: 'codex', async run({ task, worktreePath, attempt = 1, onLog, signal }) {
    if (!worktreePath) throw new TypeError('worktreePath is required');
    const cwd = path.resolve(worktreePath);
    return run({ command, args: ['exec', '--sandbox', 'workspace-write', '--ask-for-approval', 'never', '--cd', cwd, taskPrompt(task, attempt)], cwd, onLog, signal, spawnProcess: options.spawnProcess });
  } };
}
module.exports = { createCodexAdapter };

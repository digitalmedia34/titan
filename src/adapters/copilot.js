'use strict';
const path = require('node:path');
const { runCommand } = require('./process');
const { taskPrompt } = require('./prompt');
function createCopilotAdapter(options = {}) {
  const command = options.command || 'copilot';
  const run = options.runCommand || runCommand;
  return { id: 'copilot', async run({ task, worktreePath, attempt = 1, onLog, signal }) {
    if (!worktreePath) throw new TypeError('worktreePath is required');
    const cwd = path.resolve(worktreePath);
    return run({ command, args: ['-p', taskPrompt(task, attempt), '--allow-all-tools'], cwd, onLog, signal, spawnProcess: options.spawnProcess });
  } };
}
module.exports = { createCopilotAdapter };
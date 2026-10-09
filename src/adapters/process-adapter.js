'use strict';
const path = require('node:path');
const { runCommand } = require('./process');
const { taskPrompt } = require('./prompt');

function createProcessAdapter(options = {}) {
  const run = options.runCommand || runCommand;
  return {
    id: 'process',
    async run({ task, worktreePath, attempt = 1, onLog, signal }) {
      const command = task.command || options.command;
      if (!command || typeof command !== 'string') throw new TypeError('process adapter task requires a command');
      if (!worktreePath) throw new TypeError('worktreePath is required');
      const extraArgs = task.commandArgs || [];
      if (!Array.isArray(extraArgs) || extraArgs.some((arg) => typeof arg !== 'string')) throw new TypeError('task.commandArgs must be an array of strings');
      const cwd = path.resolve(worktreePath);
      const args = [...extraArgs];
      if (task.appendPrompt === true) args.push(taskPrompt(task, attempt));
      return run({ command, args, cwd, onLog, signal, spawnProcess: options.spawnProcess });
    },
  };
}
module.exports = { createProcessAdapter };

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
    return run({ command, args: [
      '-p', taskPrompt(task, attempt),
      '--allow-tool=write,shell',
      '--deny-tool=shell(git push)',
      '--deny-tool=shell(git merge)',
      '--deny-tool=shell(gh pr merge)',
      '--deny-tool=shell(npm publish)',
      '--deny-tool=shell(az deployment)',
      '--deny-tool=shell(azd up)',
      '--deny-tool=shell(terraform apply)',
      '--deny-tool=shell(terraform destroy)',
      '--deny-tool=shell(kubectl apply)',
      '--deny-tool=shell(helm upgrade)',
      '--no-ask-user',
    ], cwd, onLog, signal, spawnProcess: options.spawnProcess });
  } };
}
module.exports = { createCopilotAdapter };

'use strict';
const path = require('node:path');
async function main(argv) {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 22 || (major === 22 && minor < 13)) throw new Error('TITAN parallel requires Node.js >=22.13.0. The existing TITAN initializer still supports Node.js >=18.');
  const [, , command, action, ...args] = argv;
  if (command !== 'parallel' || action !== 'run') { console.error('Usage: titan parallel run --tasks <file> --adapter <id> [--adapter-module <file>] [--state-dir <dir>] [--concurrency <n>] [--cleanup-worktrees]'); process.exitCode = 2; return; }
  const options = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--keep-worktrees') options.keepWorktrees = true;
    else if (arg === '--cleanup-worktrees') options.keepWorktrees = false;
    else if (arg.startsWith('--')) options[arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = args[++i];
    else throw new Error(`unexpected argument: ${arg}`);
  }
  if (!options.tasks) throw new Error('--tasks is required');
  if (!options.adapter && !options.adapterModule) throw new Error('--adapter or --adapter-module is required');
  const tasks = JSON.parse(require('node:fs').readFileSync(path.resolve(options.tasks), 'utf8'));
  let adapters = {};
  if (options.adapterModule) { const loaded = require(path.resolve(options.adapterModule)); adapters = loaded.adapters || loaded.default || loaded; }
  const result = await require('../parallel').runParallel({ tasks, adapters, adapter: options.adapter, repoRoot: process.cwd(), stateDir: options.stateDir, concurrency: options.concurrency ? Number(options.concurrency) : 3, maxAttempts: options.maxAttempts ? Number(options.maxAttempts) : 2, baseRef: options.baseRef || 'HEAD', keepWorktrees: options.keepWorktrees });
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== 'succeeded') process.exitCode = 1;
}
main(process.argv).catch((error) => { console.error(`TITAN parallel: ${error.message}`); process.exitCode = 1; });

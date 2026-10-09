'use strict';
const path = require('node:path');
async function main(argv) {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 22 || (major === 22 && minor < 13)) throw new Error('TITAN parallel requires Node.js >=22.13.0. The existing TITAN initializer still supports Node.js >=18.');
  const [, , command, action, ...args] = argv;
  if (command !== 'parallel' || !['run', 'resume', 'status', 'doctor'].includes(action)) { console.error('Usage: titan parallel <run|resume|status|doctor> [options]'); process.exitCode = 2; return; }
  const options = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--keep-worktrees') options.keepWorktrees = true;
    else if (arg === '--cleanup-worktrees') options.keepWorktrees = false;
    else if (arg === '--allow-process-adapter') options.allowProcessAdapter = true;
    else if (arg === '--allow-copilot-shell') options.allowCopilotShell = true;
    else if (arg.startsWith('--')) options[arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = args[++i];
    else throw new Error(`unexpected argument: ${arg}`);
  }
  const stateRoot = options.stateDir ? path.resolve(options.stateDir) : undefined;
  if (action === 'resume' || action === 'status') {
    if (!options.runId) throw new Error('--run-id is required');
    const savedRun = require('../parallel').readRunConfig({ runId: options.runId, stateDir: stateRoot });
    if (action === 'status') {
      console.log(JSON.stringify({ runId: savedRun.id, status: savedRun.status, repository: savedRun.repo_root, baseCommit: savedRun.base_sha, tasks: savedRun.tasks }, null, 2));
      return;
    }
    if (!options.tasks) throw new Error('--tasks is required to verify the saved contract before resume');
    options.stateDir = stateRoot || savedRun.config.stateDir;
    options.adapter ||= savedRun.config.adapter;
    options.adapterModule ||= savedRun.config.adapterModulePath;
    options.concurrency ||= savedRun.config.concurrency;
    options.maxAttempts ||= savedRun.config.maxAttempts;
    options.taskTimeoutMs ||= savedRun.config.taskTimeoutMs;
    options.keepWorktrees ??= savedRun.config.keepWorktrees;
    options.baseRef = savedRun.base_sha;
  }
  if (action !== 'doctor' && !options.tasks) throw new Error('--tasks is required');
  if (!options.adapter && !options.adapterModule) throw new Error('--adapter or --adapter-module is required');
  if (action === 'resume' && !options.adapterModule) throw new Error('--adapter-module is required to resume this run');
  const tasks = options.tasks ? JSON.parse(require('node:fs').readFileSync(path.resolve(options.tasks), 'utf8')) : [];
  if (action !== 'doctor' && !options.allowProcessAdapter && (options.adapter === 'process' || tasks.some((task) => task.adapter === 'process'))) throw new Error('the unsandboxed process adapter requires --allow-process-adapter');
  if (action !== 'doctor' && !options.allowCopilotShell && (options.adapter === 'copilot' || tasks.some((task) => task.adapter === 'copilot'))) throw new Error('the Copilot adapter grants shell access; opt in with --allow-copilot-shell');
  let adapters = {};
  if (options.adapterModule) { const loaded = require(path.resolve(options.adapterModule)); adapters = loaded.adapters || loaded.default || loaded; }
  if (action === 'doctor') {
    const provider = adapters[options.adapter];
    if (!provider || typeof provider.check !== 'function') throw new Error(`adapter ${options.adapter || 'unspecified'} does not support doctor checks`);
    const result = await provider.check();
    console.log(JSON.stringify({ adapter: provider.id, ...result }, null, 2));
    if (result.exitCode !== 0) process.exitCode = 1;
    return;
  }
  const controller = new AbortController();
  const abort = () => controller.abort(new Error('run cancelled by signal'));
  process.once('SIGINT', abort);
  process.once('SIGTERM', abort);
  try {
    const result = await require('../parallel').runParallel({ tasks, adapters, adapter: options.adapter, adapterModulePath: options.adapterModule ? path.resolve(options.adapterModule) : null, repoRoot: process.cwd(), stateDir: options.stateDir, concurrency: options.concurrency ? Number(options.concurrency) : 3, maxAttempts: options.maxAttempts ? Number(options.maxAttempts) : 2, taskTimeoutMs: options.taskTimeoutMs ? Number(options.taskTimeoutMs) : 60 * 60 * 1000, baseRef: options.baseRef || 'HEAD', keepWorktrees: options.keepWorktrees, signal: controller.signal, runId: options.runId, resume: action === 'resume' });
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'succeeded') process.exitCode = 1;
  } finally {
    process.removeListener('SIGINT', abort);
    process.removeListener('SIGTERM', abort);
  }
}
main(process.argv).catch((error) => { console.error(`TITAN parallel: ${error.message}`); process.exitCode = 1; });

'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { finished } = require('node:stream/promises');
const { runCommand } = require('../adapters/process');

function ownershipPathsOverlap(left, right, caseInsensitive = process.platform === 'win32') {
  const canonical = (value) => {
    const normalized = path.posix.normalize(value.replace(/\\/g, '/').replace(/^\.\//, '')).replace(/\/$/, '');
    return caseInsensitive ? normalized.toLowerCase() : normalized;
  };
  const a = canonical(left), b = canonical(right);
  return a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
}

function validateTasks(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) throw new Error('tasks must be a non-empty array');
  const ids = new Set();
  const caseInsensitive = process.platform === 'win32';
  for (const task of tasks) {
    if (!task || typeof task.id !== 'string' || task.id.length > 48 || !/^[A-Za-z0-9._-]+$/.test(task.id) || task.id === '.' || task.id === '..') throw new Error('each task needs a safe id of at most 48 characters');
    const idKey = caseInsensitive ? task.id.toLowerCase() : task.id;
    if (ids.has(idKey)) throw new Error(`duplicate task id: ${task.id}`);
    ids.add(idKey);
    if (!task.title || typeof task.title !== 'string') throw new Error(`task ${task.id} needs a title`);
    if (task.adapter && typeof task.adapter !== 'string') throw new Error(`task ${task.id} adapter must be a string`);
    if (!Array.isArray(task.owns) || task.owns.length === 0) throw new Error(`task ${task.id} needs a non-empty owns write set`);
    if (task.dependsOn !== undefined && (!Array.isArray(task.dependsOn) || task.dependsOn.some((id) => typeof id !== 'string'))) throw new Error(`task ${task.id} dependsOn must be an array of task ids`);
    for (const field of ['owns', 'readOnly', 'lockedDecisions', 'requiredContext', 'stopConditions', 'acceptanceCriteria']) {
      if (task[field] !== undefined && (!Array.isArray(task[field]) || task[field].some((entry) => typeof entry !== 'string'))) throw new Error(`task ${task.id} ${field} must be an array of strings`);
    }
    if (task.timeoutMs !== undefined && (!Number.isInteger(task.timeoutMs) || task.timeoutMs < 1000 || task.timeoutMs > 24 * 60 * 60 * 1000)) throw new Error(`task ${task.id} timeoutMs must be 1000..86400000`);
    if (task.verificationCommands !== undefined && (!Array.isArray(task.verificationCommands) || task.verificationCommands.some((check) => !check || typeof check.command !== 'string' || !check.command.trim() || (check.args !== undefined && (!Array.isArray(check.args) || check.args.some((arg) => typeof arg !== 'string')))))) throw new Error(`task ${task.id} verificationCommands must contain command and string args`);
    if (task.owns) for (const ownedPath of task.owns) {
      const normalized = ownedPath.replace(/\\/g, '/');
      if (!normalized || normalized.startsWith('/') || /^[A-Za-z]:/.test(normalized) || normalized.split('/').includes('..')) throw new Error(`task ${task.id} owns must contain repository-relative paths`);
      const canonical = path.posix.normalize(normalized.replace(/^\.\/+/, '')).toLowerCase();
      if (canonical === '.' || canonical === '.titan' || canonical.startsWith('.titan/') || ['docs/status.md', 'docs/decisions.md', 'docs/master_plan.md', 'docs/project_intake.md', 'docs/project_spec.md', 'docs/architecture.md'].includes(canonical)) throw new Error(`task ${task.id} cannot own coordinator/global TITAN state`);
    }
    task.dependsOn = task.dependsOn || [];
    for (const dep of task.dependsOn) if (dep === task.id || !tasks.some((candidate) => candidate.id === dep)) throw new Error(`task ${task.id} has invalid dependency: ${dep}`);
    if (task.maxAttempts !== undefined && (!Number.isInteger(task.maxAttempts) || task.maxAttempts < 1 || task.maxAttempts > 10)) throw new Error(`task ${task.id} maxAttempts must be 1..10`);
  }
  const visiting = new Set(), visited = new Set();
  function visit(id) {
    if (visiting.has(id)) throw new Error(`dependency cycle involving ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    const task = tasks.find((item) => item.id === id);
    for (const dep of task.dependsOn) visit(dep);
    visiting.delete(id); visited.add(id);
  }
  for (const task of tasks) visit(task.id);

  function dependsTransitively(from, target, checked = new Set()) {
    if (checked.has(from)) return false;
    checked.add(from);
    const current = tasks.find((candidate) => candidate.id === from);
    return current.dependsOn.includes(target) || current.dependsOn.some((dependency) => dependsTransitively(dependency, target, checked));
  }
  for (let leftIndex = 0; leftIndex < tasks.length; leftIndex++) {
    for (let rightIndex = leftIndex + 1; rightIndex < tasks.length; rightIndex++) {
      const leftTask = tasks[leftIndex], rightTask = tasks[rightIndex];
      const overlap = (leftTask.owns || []).some((left) => (rightTask.owns || []).some((right) => ownershipPathsOverlap(left, right, caseInsensitive)));
      if (overlap && !dependsTransitively(leftTask.id, rightTask.id) && !dependsTransitively(rightTask.id, leftTask.id)) {
        throw new Error(`tasks ${leftTask.id} and ${rightTask.id} have overlapping write ownership without a dependency`);
      }
    }
  }
  return tasks;
}

function git(args, cwd, env = {}) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, ...env } });
  if (result.status !== 0) throw new Error((result.stderr || result.stdout || `git ${args.join(' ')} failed`).trim());
  return result.stdout.trim();
}
function ensureNodeRuntime() {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 22 || (major === 22 && minor < 13)) throw new Error('TITAN parallel requires Node.js >=22.13.0. The existing TITAN initializer still supports Node.js >=18.');
}
function openDatabase(file) {
  const { DatabaseSync } = require('node:sqlite');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS runs (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, repo_root TEXT NOT NULL, status TEXT NOT NULL, base_sha TEXT, config_json TEXT, contract_hash TEXT);
    CREATE TABLE IF NOT EXISTS tasks (run_id TEXT NOT NULL, id TEXT NOT NULL, title TEXT NOT NULL, status TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, worktree TEXT, branch TEXT, error TEXT, task_base_sha TEXT, PRIMARY KEY(run_id,id));
    CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY, run_id TEXT NOT NULL, task_id TEXT, at TEXT NOT NULL, event TEXT NOT NULL, detail TEXT);`);
  const migrateColumn = (table, column, type) => {
    if (!db.prepare(`PRAGMA table_info(${table})`).all().some((item) => item.name === column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  };
  migrateColumn('tasks', 'branch', 'TEXT');
  migrateColumn('tasks', 'task_base_sha', 'TEXT');
  migrateColumn('runs', 'base_sha', 'TEXT');
  migrateColumn('runs', 'config_json', 'TEXT');
  migrateColumn('runs', 'contract_hash', 'TEXT');
  return db;
}
function defaultStateDir() { return path.join(os.homedir(), '.titan', 'parallel'); }
function readRunConfig({ runId, stateDir = defaultStateDir() }) {
  const db = openDatabase(path.join(stateDir, 'state.sqlite'));
  try {
    const run = db.prepare('SELECT * FROM runs WHERE id = ?').get(runId);
    if (!run) throw new Error(`unknown run ID: ${runId}`);
    if (!run.config_json || !run.contract_hash) throw new Error(`run ${runId} predates resumable state; start a new run`);
    return { ...run, config: JSON.parse(run.config_json), tasks: db.prepare('SELECT * FROM tasks WHERE run_id = ? ORDER BY id').all(runId) };
  } finally { db.close(); }
}
function record(db, runId, taskId, event, detail = '') {
  db.prepare('INSERT INTO events(run_id,task_id,at,event,detail) VALUES(?,?,?,?,?)').run(runId, taskId || null, new Date().toISOString(), event, detail);
}
function writeState(db, runId, task, status, attempt, worktree, error, branch) {
  db.prepare(`INSERT INTO tasks(run_id,id,title,status,attempts,worktree,error,branch) VALUES(?,?,?,?,?,?,?,?)
    ON CONFLICT(run_id,id) DO UPDATE SET status=excluded.status,attempts=excluded.attempts,worktree=COALESCE(excluded.worktree,tasks.worktree),error=excluded.error,branch=COALESCE(excluded.branch,tasks.branch)`).run(runId, task.id, task.title, status, attempt, worktree || null, error || null, branch || null);
}
async function runParallel({ tasks, adapters, adapter, adapterModulePath, concurrency = 3, repoRoot = process.cwd(), stateDir, maxAttempts = 2, taskTimeoutMs = 60 * 60 * 1000, baseRef = 'HEAD', keepWorktrees = true, runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, signal, resume = false }) {
  ensureNodeRuntime(); validateTasks(tasks);
  if (typeof runId !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(runId) || runId === '.' || runId === '..') throw new Error('runId must be 1..80 safe alphanumeric, dot, underscore, or hyphen characters');
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 32) throw new Error('concurrency must be 1..32');
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 10) throw new Error('maxAttempts must be 1..10');
  if (!Number.isInteger(taskTimeoutMs) || taskTimeoutMs < 1000 || taskTimeoutMs > 24 * 60 * 60 * 1000) throw new Error('taskTimeoutMs must be 1000..86400000');
  repoRoot = git(['rev-parse', '--show-toplevel'], path.resolve(repoRoot));
  const baseShaFromRef = git(['rev-parse', baseRef], repoRoot);
  const repoIdentity = crypto.createHash('sha256').update(process.platform === 'win32' ? repoRoot.toLowerCase() : repoRoot).digest('hex').slice(0, 12);
  const workRoot = path.join(path.dirname(repoRoot), '.titan-worktrees', `${path.basename(repoRoot)}-${repoIdentity}`, runId);
  const rootState = stateDir || path.join(os.homedir(), '.titan', 'parallel');
  const logRoot = path.join(rootState, 'logs', runId);
  const db = openDatabase(path.join(rootState, 'state.sqlite'));
  let baseSha = baseShaFromRef;
  let priorTasks = new Map();
  const contractHash = crypto.createHash('sha256').update(JSON.stringify(tasks)).digest('hex');
  try {
    if (resume) {
      const savedRun = db.prepare('SELECT * FROM runs WHERE id = ?').get(runId);
      if (!savedRun) throw new Error(`unknown run ID: ${runId}`);
      if (!savedRun.config_json || !savedRun.contract_hash) throw new Error(`run ${runId} predates resumable state; start a new run`);
      const savedConfig = JSON.parse(savedRun.config_json);
      if (savedRun.repo_root !== repoRoot) throw new Error('resume refused: current repository path does not match the original run');
      if (savedRun.contract_hash !== contractHash) throw new Error('resume refused: task contract file differs from the original run');
      if (path.resolve(rootState) !== path.resolve(savedConfig.stateDir)) throw new Error('resume refused: state directory does not match the original run');
      if (savedRun.status === 'succeeded') throw new Error(`run ${runId} already succeeded`);
      baseSha = savedRun.base_sha;
      git(['cat-file', '-e', `${baseSha}^{commit}`], repoRoot);
      priorTasks = new Map(db.prepare('SELECT * FROM tasks WHERE run_id = ?').all(runId).map((task) => [task.id, task]));
      for (const task of tasks) {
        const prior = priorTasks.get(task.id);
        if (prior?.status === 'succeeded') {
          if (!prior.branch) throw new Error(`resume refused: succeeded task ${task.id} has no branch`);
          git(['rev-parse', '--verify', `${prior.branch}^{commit}`], repoRoot);
        }
      }
      db.prepare('UPDATE runs SET status = ? WHERE id = ?').run('running', runId);
      record(db, runId, null, 'resumed', `base=${baseSha}`);
    } else {
      const config = { adapter: adapter || null, adapterModulePath: adapterModulePath || null, concurrency, maxAttempts, taskTimeoutMs, baseSha: baseShaFromRef, keepWorktrees, stateDir: path.resolve(rootState) };
      db.prepare('INSERT INTO runs(id,created_at,repo_root,status,base_sha,config_json,contract_hash) VALUES(?,?,?,?,?,?,?)').run(runId, new Date().toISOString(), repoRoot, 'running', baseShaFromRef, JSON.stringify(config), contractHash);
    }
  } catch (error) {
    db.close();
    throw error;
  }
  const adapterMap = adapters || {};
  const running = new Map();
  const results = new Map();
  for (const task of tasks) {
    const prior = priorTasks.get(task.id);
    if (prior?.status === 'succeeded') {
      results.set(task.id, { status: 'succeeded', worktreePath: prior.worktree, branch: prior.branch });
    }
  }
  let fatal;
  const taskAdapter = (task) => adapterMap[task.adapter || adapter];
  const launch = async (task) => {
    const worker = taskAdapter(task);
    if (!worker || typeof worker.run !== 'function') throw new Error(`No adapter registered for task ${task.id} (${task.adapter || adapter || 'unspecified'})`);
    const taskWorktree = path.join(workRoot, task.id);
    const branch = `titan/parallel/${runId}/${task.id}`;
    const taskLogs = path.join(logRoot, task.id);
    fs.mkdirSync(taskLogs, { recursive: true }); fs.mkdirSync(path.dirname(taskWorktree), { recursive: true });
    const prior = priorTasks.get(task.id);
    if (prior) {
      const listedWorktrees = git(['worktree', 'list', '--porcelain'], repoRoot).split(/\r?\n/).filter((line) => line.startsWith('worktree ')).map((line) => path.resolve(line.slice(9)));
      const registered = listedWorktrees.some((item) => process.platform === 'win32' ? item.toLowerCase() === taskWorktree.toLowerCase() : item === taskWorktree);
      if (registered) git(['worktree', 'remove', '--force', taskWorktree], repoRoot);
      else if (fs.existsSync(taskWorktree)) throw new Error(`resume refused: unregistered path already exists: ${taskWorktree}`);
      const branchRef = `refs/heads/${branch}`;
      const branchExists = spawnSync('git', ['show-ref', '--verify', '--quiet', branchRef], { cwd: repoRoot }).status === 0;
      if (branchExists) git(['branch', '-f', branch, baseSha], repoRoot);
      git(branchExists ? ['worktree', 'add', taskWorktree, branch] : ['worktree', 'add', '-b', branch, taskWorktree, baseSha], repoRoot);
    } else {
      git(['worktree', 'add', '-b', branch, taskWorktree, baseSha], repoRoot);
    }
    for (const dependencyId of task.dependsOn) {
      git(['merge', '--no-edit', `titan/parallel/${runId}/${dependencyId}`], taskWorktree, {
        GIT_AUTHOR_NAME: 'TITAN coordinator', GIT_AUTHOR_EMAIL: 'titan-coordinator@invalid',
        GIT_COMMITTER_NAME: 'TITAN coordinator', GIT_COMMITTER_EMAIL: 'titan-coordinator@invalid',
      });
    }
    const taskBaseSha = git(['rev-parse', 'HEAD'], taskWorktree);
    writeState(db, runId, task, 'running', prior?.attempts || 0, taskWorktree, null, branch); record(db, runId, task.id, 'started', `taskBase=${taskBaseSha}`);
    db.prepare('UPDATE tasks SET task_base_sha = ? WHERE run_id = ? AND id = ?').run(taskBaseSha, runId, task.id);
    const attempts = Math.min(task.maxAttempts || maxAttempts, 10);
    const firstAttempt = resume ? (prior?.attempts || 0) + 1 : 1;
    if (firstAttempt > attempts) throw new Error(`task ${task.id} has no attempts remaining; resume with a higher --max-attempts`);
    for (let attempt = firstAttempt; attempt <= attempts; attempt++) {
      if (attempt > 1) {
        git(['reset', '--hard', taskBaseSha], taskWorktree);
        git(['clean', '-fdx'], taskWorktree);
      }
      writeState(db, runId, task, 'running', attempt, taskWorktree, null, branch);
      const logFile = path.join(taskLogs, `attempt-${attempt}.log`);
      const stream = fs.createWriteStream(logFile, { flags: 'a' });
      let finishPromise;
      const finishLog = () => {
        if (!finishPromise) {
          finishPromise = finished(stream);
          stream.end();
        }
        return finishPromise;
      };
      const onLog = (line) => { const text = String(line); if (!stream.writableEnded) stream.write(text.endsWith('\n') ? text : `${text}\n`); };
      const timeoutController = new AbortController();
      const timeoutMs = task.timeoutMs || taskTimeoutMs;
      const timeoutHandle = setTimeout(() => {
        const timeoutError = new Error(`task ${task.id} timed out after ${timeoutMs}ms`);
        timeoutError.code = 'TITAN_TASK_TIMEOUT';
        timeoutController.abort(timeoutError);
      }, timeoutMs);
      const effectiveSignal = signal ? AbortSignal.any([signal, timeoutController.signal]) : timeoutController.signal;
      let abortHandler;
      try {
        const execution = Promise.resolve().then(() => worker.run({ task: Object.freeze({ ...task, dependsOn: [...task.dependsOn] }), worktreePath: taskWorktree, attempt, onLog, signal: effectiveSignal }));
        execution.catch(() => {});
        const aborted = new Promise((_, reject) => {
          if (effectiveSignal.aborted) reject(effectiveSignal.reason || new Error('task aborted'));
          else {
            abortHandler = () => reject(effectiveSignal.reason || new Error('task aborted'));
            effectiveSignal.addEventListener('abort', abortHandler, { once: true });
          }
        });
        const result = await Promise.race([execution, aborted]);
        if (result && result.output) onLog(result.output);
        if (result && result.exitCode === 0) {
          for (const check of task.verificationCommands || []) {
            onLog(`verification: ${check.name || check.command}`);
            const verified = await runCommand({ command: check.command, args: check.args || [], cwd: taskWorktree, onLog, signal: effectiveSignal });
            if (verified.exitCode !== 0) throw new Error(`verification failed (${check.name || check.command}): ${verified.output || `exit code ${verified.exitCode}`}`);
          }
          const dirty = git(['status', '--porcelain'], taskWorktree);
          if (dirty) throw new Error(`worker ${task.id} must commit its changes before reporting success; uncommitted changes remain in ${taskWorktree}`);
          const changedFiles = new Set([
            ...git(['diff', '--name-only', '--no-renames', taskBaseSha], taskWorktree).split(/\r?\n/).filter(Boolean),
            ...git(['ls-files', '--others', '--exclude-standard'], taskWorktree).split(/\r?\n/).filter(Boolean),
          ]);
          const caseInsensitivePaths = process.platform === 'win32';
          const canonicalOwnedPaths = task.owns.map((owned) => {
            const normalized = path.posix.normalize(owned.replace(/\\/g, '/').replace(/^\.\/+/, ''));
            return caseInsensitivePaths ? normalized.toLowerCase() : normalized;
          });
          const unexpectedFiles = [...changedFiles].filter((file) => {
            const filePath = file.replace(/\\/g, '/');
            const normalized = caseInsensitivePaths ? filePath.toLowerCase() : filePath;
            return !canonicalOwnedPaths.some((owned) => normalized === owned || normalized.startsWith(`${owned.replace(/\/$/, '')}/`));
          });
          if (unexpectedFiles.length) throw new Error(`worker ${task.id} changed paths outside its owns set: ${unexpectedFiles.join(', ')}`);
          await finishLog();
          writeState(db, runId, task, 'succeeded', attempt, taskWorktree, null, branch); record(db, runId, task.id, 'succeeded', `attempt=${attempt}`);
          results.set(task.id, { status: 'succeeded', worktreePath: taskWorktree, branch, logFile }); return;
        }
        const message = result && (result.output || `exit code ${result.exitCode}`) || 'adapter returned no successful result';
        writeState(db, runId, task, 'retrying', attempt, taskWorktree, String(message)); record(db, runId, task.id, 'failed-attempt', String(message));
        await finishLog();
        if (attempt === attempts) throw new Error(String(message));
      } catch (error) {
        await finishLog();
        if (effectiveSignal.aborted) {
          const timedOut = effectiveSignal.reason && effectiveSignal.reason.code === 'TITAN_TASK_TIMEOUT';
          const status = timedOut ? 'timed_out' : 'cancelled';
          writeState(db, runId, task, status, attempt, taskWorktree, error.message, branch);
          record(db, runId, task.id, status, error.message);
          results.set(task.id, { status, error: error.message, worktreePath: taskWorktree, branch, logFile });
          return;
        }
        if (attempt === attempts) throw error;
        writeState(db, runId, task, 'retrying', attempt, taskWorktree, error.message); record(db, runId, task.id, 'failed-attempt', error.message);
      } finally {
        clearTimeout(timeoutHandle);
        if (abortHandler) effectiveSignal.removeEventListener('abort', abortHandler);
      }
    }
  };
  const startTask = (task) => {
    const promise = launch(task).catch((error) => {
      fatal = fatal || error; writeState(db, runId, task, 'failed', db.prepare('SELECT attempts FROM tasks WHERE run_id=? AND id=?').get(runId, task.id)?.attempts || 0, path.join(workRoot, task.id), error.message, `titan/parallel/${runId}/${task.id}`);
      record(db, runId, task.id, 'failed', error.message); results.set(task.id, { status: 'failed', error: error.message, worktreePath: path.join(workRoot, task.id), branch: `titan/parallel/${runId}/${task.id}`, logRoot: path.join(logRoot, task.id) });
    }).finally(() => running.delete(task.id));
    running.set(task.id, promise);
  };
  try {
    const pending = new Map(tasks.filter((task) => !results.has(task.id)).map((task) => [task.id, task]));
    while (pending.size || running.size) {
      let progressed = false;
      for (const [id, task] of pending) {
        if (running.size >= concurrency) break;
        if (signal?.aborted) {
          pending.delete(id); writeState(db, runId, task, 'cancelled', 0, null, 'run cancelled'); results.set(id, { status: 'cancelled' }); record(db, runId, id, 'cancelled', 'run cancelled'); progressed = true; continue;
        }
        if (task.dependsOn.some((dep) => ['failed', 'blocked', 'cancelled', 'timed_out'].includes(results.get(dep)?.status))) {
          pending.delete(id); writeState(db, runId, task, 'blocked', 0, null, 'dependency failed'); results.set(id, { status: 'blocked' }); record(db, runId, id, 'blocked', 'dependency failed'); progressed = true; continue;
        }
        if (task.dependsOn.every((dep) => results.get(dep)?.status === 'succeeded')) { pending.delete(id); startTask(task); progressed = true; }
      }
      if (running.size) await Promise.race(running.values());
      else if (pending.size && !progressed) throw new Error('scheduler stalled: unresolved dependency graph');
    }
    const status = [...results.values()].every((result) => result.status === 'succeeded') ? 'succeeded' : signal?.aborted ? 'cancelled' : 'failed';
    db.prepare('UPDATE runs SET status=? WHERE id=?').run(status, runId);
    if (!keepWorktrees && status !== 'cancelled') for (const [id, result] of results) if (result.worktreePath && result.status === 'succeeded') {
      try {
        git(['worktree', 'remove', result.worktreePath], repoRoot);
          record(db, runId, id, 'worktree-removed', `worker branch retained: ${result.branch}`);
      } catch (error) {
        record(db, runId, id, 'cleanup-warning', `worktree retained to preserve its contents; worker branch: ${result.branch}; ${error.message}`);
      }
    }
    return { runId, status, results: Object.fromEntries(results), logRoot, stateDatabase: path.join(rootState, 'state.sqlite') };
  } catch (error) {
    db.prepare('UPDATE runs SET status=? WHERE id=?').run('failed', runId);
    throw fatal || error;
  } finally { db.close(); }
}
module.exports = { runParallel, validateTasks, ensureNodeRuntime, readRunConfig, ownershipPathsOverlap };

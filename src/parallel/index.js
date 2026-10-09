'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const { finished } = require('node:stream/promises');

function validateTasks(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) throw new Error('tasks must be a non-empty array');
  const ids = new Set();
  for (const task of tasks) {
    if (!task || typeof task.id !== 'string' || task.id.length > 48 || !/^[A-Za-z0-9._-]+$/.test(task.id) || task.id === '.' || task.id === '..') throw new Error('each task needs a safe id of at most 48 characters');
    if (ids.has(task.id)) throw new Error(`duplicate task id: ${task.id}`);
    ids.add(task.id);
    if (!task.title || typeof task.title !== 'string') throw new Error(`task ${task.id} needs a title`);
    if (task.adapter && typeof task.adapter !== 'string') throw new Error(`task ${task.id} adapter must be a string`);
    if (!Array.isArray(task.owns) || task.owns.length === 0) throw new Error(`task ${task.id} needs a non-empty owns write set`);
    if (task.dependsOn !== undefined && (!Array.isArray(task.dependsOn) || task.dependsOn.some((id) => typeof id !== 'string'))) throw new Error(`task ${task.id} dependsOn must be an array of task ids`);
    for (const field of ['owns', 'readOnly', 'lockedDecisions', 'requiredContext', 'stopConditions', 'acceptanceCriteria']) {
      if (task[field] !== undefined && (!Array.isArray(task[field]) || task[field].some((entry) => typeof entry !== 'string'))) throw new Error(`task ${task.id} ${field} must be an array of strings`);
    }
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
  const normalizedPath = (value) => path.posix.normalize(value.replace(/\\/g, '/').replace(/^\.\//, '')).replace(/\/$/, '');
  const pathsOverlap = (left, right) => left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
  for (let leftIndex = 0; leftIndex < tasks.length; leftIndex++) {
    for (let rightIndex = leftIndex + 1; rightIndex < tasks.length; rightIndex++) {
      const leftTask = tasks[leftIndex], rightTask = tasks[rightIndex];
      const overlap = (leftTask.owns || []).some((left) => (rightTask.owns || []).some((right) => pathsOverlap(normalizedPath(left), normalizedPath(right))));
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
    CREATE TABLE IF NOT EXISTS runs (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, repo_root TEXT NOT NULL, status TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS tasks (run_id TEXT NOT NULL, id TEXT NOT NULL, title TEXT NOT NULL, status TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, worktree TEXT, branch TEXT, error TEXT, PRIMARY KEY(run_id,id));
    CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY, run_id TEXT NOT NULL, task_id TEXT, at TEXT NOT NULL, event TEXT NOT NULL, detail TEXT);`);
  if (!db.prepare('PRAGMA table_info(tasks)').all().some((column) => column.name === 'branch')) db.exec('ALTER TABLE tasks ADD COLUMN branch TEXT');
  return db;
}
function record(db, runId, taskId, event, detail = '') {
  db.prepare('INSERT INTO events(run_id,task_id,at,event,detail) VALUES(?,?,?,?,?)').run(runId, taskId || null, new Date().toISOString(), event, detail);
}
function writeState(db, runId, task, status, attempt, worktree, error, branch) {
  db.prepare(`INSERT INTO tasks(run_id,id,title,status,attempts,worktree,error,branch) VALUES(?,?,?,?,?,?,?,?)
    ON CONFLICT(run_id,id) DO UPDATE SET status=excluded.status,attempts=excluded.attempts,worktree=COALESCE(excluded.worktree,tasks.worktree),error=excluded.error,branch=COALESCE(excluded.branch,tasks.branch)`).run(runId, task.id, task.title, status, attempt, worktree || null, error || null, branch || null);
}
async function runParallel({ tasks, adapters, adapter, concurrency = 3, repoRoot = process.cwd(), stateDir, maxAttempts = 2, baseRef = 'HEAD', keepWorktrees = true, runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, signal }) {
  ensureNodeRuntime(); validateTasks(tasks);
  if (typeof runId !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(runId) || runId === '.' || runId === '..') throw new Error('runId must be 1..80 safe alphanumeric, dot, underscore, or hyphen characters');
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 32) throw new Error('concurrency must be 1..32');
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 10) throw new Error('maxAttempts must be 1..10');
  repoRoot = git(['rev-parse', '--show-toplevel'], path.resolve(repoRoot));
  const baseSha = git(['rev-parse', baseRef], repoRoot);
  const workRoot = path.join(path.dirname(repoRoot), '.titan-worktrees', path.basename(repoRoot), runId);
  const rootState = stateDir || path.join(os.homedir(), '.titan', 'parallel');
  const logRoot = path.join(rootState, 'logs', runId);
  const db = openDatabase(path.join(rootState, 'state.sqlite'));
  try {
    db.prepare('INSERT INTO runs(id,created_at,repo_root,status) VALUES(?,?,?,?)').run(runId, new Date().toISOString(), repoRoot, 'running');
  } catch (error) {
    db.close();
    throw error;
  }
  const adapterMap = adapters || {};
  const running = new Map();
  const results = new Map();
  let fatal;
  const taskAdapter = (task) => adapterMap[task.adapter || adapter];
  const launch = async (task) => {
    const worker = taskAdapter(task);
    if (!worker || typeof worker.run !== 'function') throw new Error(`No adapter registered for task ${task.id} (${task.adapter || adapter || 'unspecified'})`);
    const taskWorktree = path.join(workRoot, task.id);
    const branch = `titan/parallel/${runId}/${task.id}`;
    const taskLogs = path.join(logRoot, task.id);
    fs.mkdirSync(taskLogs, { recursive: true }); fs.mkdirSync(path.dirname(taskWorktree), { recursive: true });
    git(['worktree', 'add', '-b', branch, taskWorktree, baseSha], repoRoot);
    for (const dependencyId of task.dependsOn) {
      git(['merge', '--no-edit', `titan/parallel/${runId}/${dependencyId}`], taskWorktree, {
        GIT_AUTHOR_NAME: 'TITAN coordinator', GIT_AUTHOR_EMAIL: 'titan-coordinator@invalid',
        GIT_COMMITTER_NAME: 'TITAN coordinator', GIT_COMMITTER_EMAIL: 'titan-coordinator@invalid',
      });
    }
    const taskBaseSha = git(['rev-parse', 'HEAD'], taskWorktree);
    writeState(db, runId, task, 'running', 0, taskWorktree, null, branch); record(db, runId, task.id, 'started');
    const attempts = Math.min(task.maxAttempts || maxAttempts, 10);
    for (let attempt = 1; attempt <= attempts; attempt++) {
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
      const onLog = (line) => { const text = String(line); stream.write(text.endsWith('\n') ? text : `${text}\n`); };
      try {
        const result = await worker.run({ task: Object.freeze({ ...task, dependsOn: [...task.dependsOn] }), worktreePath: taskWorktree, attempt, onLog, signal });
        if (result && result.output) onLog(result.output);
        if (result && result.exitCode === 0) {
          const dirty = git(['status', '--porcelain'], taskWorktree);
          if (dirty) throw new Error(`worker ${task.id} must commit its changes before reporting success; uncommitted changes remain in ${taskWorktree}`);
          const changedFiles = new Set([
            ...git(['diff', '--name-only', '--no-renames', taskBaseSha], taskWorktree).split(/\r?\n/).filter(Boolean),
            ...git(['ls-files', '--others', '--exclude-standard'], taskWorktree).split(/\r?\n/).filter(Boolean),
          ]);
          const ownedPaths = task.owns.map((owned) => path.posix.normalize(owned.replace(/\\/g, '/').replace(/^\.\/+/, '')).toLowerCase());
          const unexpectedFiles = [...changedFiles].filter((file) => {
            const normalized = file.replace(/\\/g, '/').toLowerCase();
            return !ownedPaths.some((owned) => normalized === owned || normalized.startsWith(`${owned.replace(/\/$/, '')}/`));
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
        if (attempt === attempts) throw error;
        writeState(db, runId, task, 'retrying', attempt, taskWorktree, error.message); record(db, runId, task.id, 'failed-attempt', error.message);
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
    const pending = new Map(tasks.map((task) => [task.id, task]));
    while (pending.size || running.size) {
      let progressed = false;
      for (const [id, task] of pending) {
        if (running.size >= concurrency) break;
        if (task.dependsOn.some((dep) => results.get(dep)?.status === 'failed' || results.get(dep)?.status === 'blocked')) {
          pending.delete(id); writeState(db, runId, task, 'blocked', 0, null, 'dependency failed'); results.set(id, { status: 'blocked' }); record(db, runId, id, 'blocked', 'dependency failed'); progressed = true; continue;
        }
        if (task.dependsOn.every((dep) => results.get(dep)?.status === 'succeeded')) { pending.delete(id); startTask(task); progressed = true; }
      }
      if (running.size) await Promise.race(running.values());
      else if (pending.size && !progressed) throw new Error('scheduler stalled: unresolved dependency graph');
    }
    const status = [...results.values()].every((result) => result.status === 'succeeded') ? 'succeeded' : 'failed';
    db.prepare('UPDATE runs SET status=? WHERE id=?').run(status, runId);
    if (!keepWorktrees) for (const [id, result] of results) if (result.worktreePath) {
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
module.exports = { runParallel, validateTasks, ensureNodeRuntime };

'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

function validateTasks(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) throw new Error('tasks must be a non-empty array');
  const ids = new Set();
  for (const task of tasks) {
    if (!task || typeof task.id !== 'string' || !/^[A-Za-z0-9._-]+$/.test(task.id) || task.id === '.' || task.id === '..') throw new Error('each task needs a safe id');
    if (ids.has(task.id)) throw new Error(`duplicate task id: ${task.id}`);
    ids.add(task.id);
    if (!task.title || typeof task.title !== 'string') throw new Error(`task ${task.id} needs a title`);
    if (task.adapter && typeof task.adapter !== 'string') throw new Error(`task ${task.id} adapter must be a string`);
    if (task.dependsOn !== undefined && (!Array.isArray(task.dependsOn) || task.dependsOn.some((id) => typeof id !== 'string'))) throw new Error(`task ${task.id} dependsOn must be an array of task ids`);
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
  return tasks;
}

function git(args, cwd) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
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
    CREATE TABLE IF NOT EXISTS tasks (run_id TEXT NOT NULL, id TEXT NOT NULL, title TEXT NOT NULL, status TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, worktree TEXT, error TEXT, PRIMARY KEY(run_id,id));
    CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY, run_id TEXT NOT NULL, task_id TEXT, at TEXT NOT NULL, event TEXT NOT NULL, detail TEXT);`);
  return db;
}
function record(db, runId, taskId, event, detail = '') {
  db.prepare('INSERT INTO events(run_id,task_id,at,event,detail) VALUES(?,?,?,?,?)').run(runId, taskId || null, new Date().toISOString(), event, detail);
}
function writeState(db, runId, task, status, attempt, worktree, error) {
  db.prepare(`INSERT INTO tasks(run_id,id,title,status,attempts,worktree,error) VALUES(?,?,?,?,?,?,?)
    ON CONFLICT(run_id,id) DO UPDATE SET status=excluded.status,attempts=excluded.attempts,worktree=excluded.worktree,error=excluded.error`).run(runId, task.id, task.title, status, attempt, worktree || null, error || null);
}
async function runParallel({ tasks, adapters, adapter, concurrency = 3, repoRoot = process.cwd(), stateDir, maxAttempts = 2, baseRef = 'HEAD', keepWorktrees = true, runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, signal }) {
  ensureNodeRuntime(); validateTasks(tasks);
  if (typeof runId !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(runId) || runId === '.' || runId === '..') throw new Error('runId must be 1..80 safe alphanumeric, dot, underscore, or hyphen characters');
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 32) throw new Error('concurrency must be 1..32');
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 10) throw new Error('maxAttempts must be 1..10');
  repoRoot = git(['rev-parse', '--show-toplevel'], path.resolve(repoRoot));
  const workRoot = path.join(path.dirname(repoRoot), '.titan-worktrees', path.basename(repoRoot), runId);
  const rootState = stateDir || path.join(os.homedir(), '.titan', 'parallel');
  const logRoot = path.join(rootState, 'logs', runId);
  const db = openDatabase(path.join(rootState, 'state.sqlite'));
  db.prepare('INSERT INTO runs(id,created_at,repo_root,status) VALUES(?,?,?,?)').run(runId, new Date().toISOString(), repoRoot, 'running');
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
    git(['worktree', 'add', '-b', branch, taskWorktree, baseRef], repoRoot);
    writeState(db, runId, task, 'running', 0, taskWorktree); record(db, runId, task.id, 'started');
    const attempts = Math.min(task.maxAttempts || maxAttempts, 10);
    for (let attempt = 1; attempt <= attempts; attempt++) {
      writeState(db, runId, task, 'running', attempt, taskWorktree);
      const logFile = path.join(taskLogs, `attempt-${attempt}.log`);
      const stream = fs.createWriteStream(logFile, { flags: 'a' });
      const onLog = (line) => { const text = String(line); stream.write(text.endsWith('\n') ? text : `${text}\n`); };
      try {
        const result = await worker.run({ task: Object.freeze({ ...task, dependsOn: [...task.dependsOn] }), worktreePath: taskWorktree, attempt, onLog, signal });
        if (result && result.output) onLog(result.output);
        stream.end();
        if (result && result.exitCode === 0) {
          writeState(db, runId, task, 'succeeded', attempt, taskWorktree); record(db, runId, task.id, 'succeeded', `attempt=${attempt}`);
          results.set(task.id, { status: 'succeeded', worktreePath: taskWorktree, logFile }); return;
        }
        const message = result && (result.output || `exit code ${result.exitCode}`) || 'adapter returned no successful result';
        writeState(db, runId, task, 'retrying', attempt, taskWorktree, String(message)); record(db, runId, task.id, 'failed-attempt', String(message));
        if (attempt === attempts) throw new Error(String(message));
      } catch (error) {
        stream.end();
        if (attempt === attempts) throw error;
        writeState(db, runId, task, 'retrying', attempt, taskWorktree, error.message); record(db, runId, task.id, 'failed-attempt', error.message);
      }
    }
  };
  const startTask = (task) => {
    const promise = launch(task).catch((error) => {
      fatal = fatal || error; writeState(db, runId, task, 'failed', db.prepare('SELECT attempts FROM tasks WHERE run_id=? AND id=?').get(runId, task.id)?.attempts || 0, null, error.message);
      record(db, runId, task.id, 'failed', error.message); results.set(task.id, { status: 'failed', error: error.message, worktreePath: path.join(workRoot, task.id), logRoot: path.join(logRoot, task.id) });
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
      try { git(['worktree', 'remove', '--force', result.worktreePath], repoRoot); git(['branch', '-D', `titan/parallel/${runId}/${id}`], repoRoot); } catch (error) { record(db, runId, id, 'cleanup-warning', error.message); }
    }
    return { runId, status, results: Object.fromEntries(results), logRoot, stateDatabase: path.join(rootState, 'state.sqlite') };
  } catch (error) {
    db.prepare('UPDATE runs SET status=? WHERE id=?').run('failed', runId);
    throw fatal || error;
  } finally { db.close(); }
}
module.exports = { runParallel, validateTasks, ensureNodeRuntime };

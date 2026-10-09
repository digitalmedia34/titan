/** @typedef {{ id: string, title: string, dependsOn?: string[], adapter?: string, maxAttempts?: number, [key: string]: unknown }} ParallelTask */
/** @typedef {{ id: string, run: (context: { task: ParallelTask, worktreePath: string, attempt: number, onLog: (line: unknown) => void, signal?: AbortSignal }) => Promise<{ exitCode: number, output?: string }> }} ParallelAdapter */
/** @typedef {{ tasks: ParallelTask[], adapters: Record<string, ParallelAdapter>, adapter?: string, concurrency?: number, repoRoot?: string, stateDir?: string, maxAttempts?: number, baseRef?: string, keepWorktrees?: boolean, runId?: string }} ParallelOptions */
/** @param {ParallelOptions} options @returns {Promise<{runId: string, status: string, results: Record<string, object>, logRoot: string, stateDatabase: string}>} */
export function runParallel(options);
/** @param {ParallelTask[]} tasks @returns {ParallelTask[]} */
export function validateTasks(tasks);
export function ensureNodeRuntime();

export interface ParallelTask {
  id: string;
  title: string;
  owns: string[];
  readOnly?: string[];
  lockedDecisions?: string[];
  requiredContext?: string[];
  stopConditions?: string[];
  acceptanceCriteria?: string[];
  instructions?: string;
  dependsOn?: string[];
  adapter?: string;
  maxAttempts?: number;
  command?: string;
  commandArgs?: string[];
  appendPrompt?: boolean;
  [key: string]: unknown;
}

export interface ParallelWorkerContext {
  task: ParallelTask;
  worktreePath: string;
  attempt: number;
  onLog: (line: unknown) => void;
  signal?: AbortSignal;
}

export interface ParallelWorkerResult {
  exitCode: number;
  output?: string;
}

export interface ParallelAdapter {
  id: string;
  run(context: ParallelWorkerContext): Promise<ParallelWorkerResult>;
}

export interface ParallelTaskResult {
  status: 'succeeded' | 'failed' | 'blocked';
  worktreePath?: string;
  branch?: string;
  logFile?: string;
  logRoot?: string;
  error?: string;
}

export interface ParallelOptions {
  tasks: ParallelTask[];
  adapters?: Record<string, ParallelAdapter>;
  adapter?: string;
  concurrency?: number;
  repoRoot?: string;
  stateDir?: string;
  maxAttempts?: number;
  baseRef?: string;
  keepWorktrees?: boolean;
  runId?: string;
  signal?: AbortSignal;
}

export interface ParallelRunResult {
  runId: string;
  status: 'succeeded' | 'failed';
  results: Record<string, ParallelTaskResult>;
  logRoot: string;
  stateDatabase: string;
}

export function runParallel(options: ParallelOptions): Promise<ParallelRunResult>;
export function validateTasks(tasks: ParallelTask[]): ParallelTask[];
export function ensureNodeRuntime(): void;

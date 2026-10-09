'use strict';
function taskPrompt(task, attempt) {
  if (!task || typeof task !== 'object' || typeof task.id !== 'string' || typeof task.instructions !== 'string') throw new TypeError('task must include string id and instructions');
  const acceptance = Array.isArray(task.acceptanceCriteria) && task.acceptanceCriteria.length ? task.acceptanceCriteria.map((criterion) => `- ${criterion}`).join('\n') : '- Complete the requested task and leave a clear summary.';
  const list = (label, value) => Array.isArray(value) && value.length ? [`${label}:`, ...value.map((entry) => `- ${entry}`)] : [];
  return [
    `TITAN worker task: ${task.id}`,
    `Attempt: ${attempt}`,
    '',
    'Work only in the current repository checkout. Follow its TITAN instructions and this task contract.',
    'Do not read or modify coordinator/global orchestration state. Do not access sibling workers.',
    ...list('Worker-owned paths (the only paths you may change)', task.owns),
    ...list('Read-only paths', task.readOnly),
    ...list('Locked decisions', task.lockedDecisions),
    ...list('Required context', task.requiredContext),
    ...list('STOP conditions', task.stopConditions),
    '',
    'Task instructions:',
    task.instructions,
    '',
    'Acceptance criteria:',
    acceptance,
    '',
    'When finished, run the required checks, commit only changes inside this task contract on the current worker branch, and report the commit, changed files, and checks performed. Do not push, merge, switch branches, or alter shared project state.',
  ].join('\n');
}
module.exports = { taskPrompt };

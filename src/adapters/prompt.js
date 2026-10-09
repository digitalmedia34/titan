'use strict';
function taskPrompt(task, attempt) {
  if (!task || typeof task !== 'object' || typeof task.id !== 'string' || typeof task.instructions !== 'string') throw new TypeError('task must include string id and instructions');
  const acceptance = Array.isArray(task.acceptanceCriteria) && task.acceptanceCriteria.length ? task.acceptanceCriteria.map((criterion) => `- ${criterion}`).join('\n') : '- Complete the requested task and leave a clear summary.';
  return [`TITAN worker task: ${task.id}`, `Attempt: ${attempt}`, '', 'Work only in the current repository checkout. Follow its TITAN instructions and task contract.', 'Do not read or modify coordinator/global orchestration state. Do not access sibling workers.', '', 'Task instructions:', task.instructions, '', 'Acceptance criteria:', acceptance, '', 'When finished, report changes and checks performed. Do not commit unless the task explicitly asks.'].join('\n');
}
module.exports = { taskPrompt };
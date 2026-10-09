'use strict';
const { createCodexAdapter } = require('./codex');
const { createCopilotAdapter } = require('./copilot');
const { createProcessAdapter } = require('./process-adapter');
module.exports = { adapters: { codex: createCodexAdapter(), copilot: createCopilotAdapter(), process: createProcessAdapter() } };
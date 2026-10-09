'use strict';
const { spawn } = require('node:child_process');
function runCommand({ command, args, cwd, onLog = () => {}, signal, spawnProcess = spawn }) {
  return new Promise((resolve, reject) => {
    let output = '';
    let settled = false;
    const child = spawnProcess(command, args, { cwd, shell: false, windowsHide: true, signal, stdio: ['ignore', 'pipe', 'pipe'] });
    const append = (stream, chunk) => { const text = chunk.toString(); output = (output + text).slice(-64 * 1024); onLog(text); };
    child.stdout?.on('data', (chunk) => append('stdout', chunk));
    child.stderr?.on('data', (chunk) => append('stderr', chunk));
    child.once('error', (error) => { if (!settled) { settled = true; reject(error); } });
    child.once('close', (code, closeSignal) => { if (!settled) { settled = true; resolve({ exitCode: code ?? (closeSignal ? 1 : 0), output }); } });
  });
}
module.exports = { runCommand };
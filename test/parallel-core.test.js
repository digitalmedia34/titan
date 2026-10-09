'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { validateTasks } = require('../src/parallel');

test('accepts independent tasks and declared dependencies', () => {
  const tasks = [{ id: 'a', title: 'A', owns: ['src/a.js'] }, { id: 'b', title: 'B', owns: ['src/b.js'], dependsOn: ['a'] }];
  assert.equal(validateTasks(tasks), tasks);
});
test('rejects duplicate ids, missing dependencies, cycles, and unsafe ids', () => {
  assert.throws(() => validateTasks([{ id: 'x', title: 'x', owns: ['x.js'] }, { id: 'x', title: 'duplicate', owns: ['y.js'] }]), /duplicate/);
  assert.throws(() => validateTasks([{ id: 'x', title: 'x', owns: ['x.js'], dependsOn: ['missing'] }]), /invalid dependency/);
  assert.throws(() => validateTasks([{ id: 'x', title: 'x', owns: ['x.js'], dependsOn: ['y'] }, { id: 'y', title: 'y', owns: ['y.js'], dependsOn: ['x'] }]), /cycle/);
  assert.throws(() => validateTasks([{ id: '../x', title: 'unsafe', owns: ['x.js'] }]), /safe id/);
  assert.throws(() => validateTasks([{ id: '..', title: 'unsafe', owns: ['x.js'] }]), /safe id/);
});

test('prevents overlapping parallel ownership and coordinator state writes', () => {
  assert.throws(() => validateTasks([
    { id: 'one', title: 'One', owns: ['src/shared'] },
    { id: 'two', title: 'Two', owns: ['src/shared/file.js'] },
  ]), /overlapping write ownership/);
  assert.throws(() => validateTasks([{ id: 'state', title: 'State', owns: ['.titan/STATE.md'] }]), /coordinator\/global/);
  assert.throws(() => validateTasks([{ id: 'state-alt', title: 'State', owns: ['./.titan/STATE.md'] }]), /coordinator\/global/);
  assert.throws(() => validateTasks([{ id: 'broad', title: 'Broad', owns: ['.'] }]), /coordinator\/global/);
  assert.throws(() => validateTasks([{ id: 'status', title: 'Status', owns: ['docs/STATUS.md'] }]), /coordinator\/global/);
  assert.throws(() => validateTasks([{ id: 'escape', title: 'Escape', owns: ['../outside'] }]), /repository-relative/);
  assert.doesNotThrow(() => validateTasks([
    { id: 'one', title: 'One', owns: ['src/shared'] },
    { id: 'two', title: 'Two', owns: ['src/shared/file.js'], dependsOn: ['one'] },
  ]));
});

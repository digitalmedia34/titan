'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { validateTasks } = require('../src/parallel');

test('accepts independent tasks and declared dependencies', () => {
  const tasks = [{ id: 'a', title: 'A' }, { id: 'b', title: 'B', dependsOn: ['a'] }];
  assert.equal(validateTasks(tasks), tasks);
});
test('rejects duplicate ids, missing dependencies, cycles, and unsafe ids', () => {
  assert.throws(() => validateTasks([{ id: 'x', title: 'x' }, { id: 'x', title: 'duplicate' }]), /duplicate/);
  assert.throws(() => validateTasks([{ id: 'x', title: 'x', dependsOn: ['missing'] }]), /invalid dependency/);
  assert.throws(() => validateTasks([{ id: 'x', title: 'x', dependsOn: ['y'] }, { id: 'y', title: 'y', dependsOn: ['x'] }]), /cycle/);
  assert.throws(() => validateTasks([{ id: '../x', title: 'unsafe' }]), /safe id/);
  assert.throws(() => validateTasks([{ id: '..', title: 'unsafe' }]), /safe id/);
});

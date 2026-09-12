import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createEmptyWorkflow } from '@konitif/composition';
import {
  createViewerSnapshot,
  createViewerWorkflowCompositionSource
} from '../dist/index.js';

test('viewer snapshots normalize time and isolate selected identities', () => {
  const selectedIds = ['left-hand'];
  const snapshot = createViewerSnapshot({
    sourceId: 'robot.nao',
    selectedIds,
    observedAtMs: Number.NaN
  });

  selectedIds.push('right-hand');
  assert.deepEqual(snapshot, {
    sourceId: 'robot.nao',
    selectedIds: ['left-hand'],
    observedAtMs: 0
  });
  assert.equal(createViewerSnapshot({ observedAtMs: -12 }).observedAtMs, 0);
});

test('workflow composition remains external and is observed through a clone', () => {
  const workflow = createEmptyWorkflow({ id: 'dance', title: 'Dance' });
  const source = createViewerWorkflowCompositionSource(workflow);

  assert.equal(source.kind, 'workflow-composition-source');
  assert.notEqual(source.workflow, workflow);
  assert.equal(source.workflow.id, 'dance');
  assert.equal(source.readModel.workflowId, 'dance');
  assert.equal(source.readModel.moduleCount, 0);

  workflow.title = 'Changed outside Viewer';
  assert.equal(source.workflow.title, 'Dance');
});

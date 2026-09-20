import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createEmptyWorkflow } from '@konitif/composition';
import {
  createViewerSnapshot,
  createViewerWorkflowCompositionSource
} from '../dist/index.js';

test('viewer snapshots normalize time and isolate selected identities', () => {
  const selectedIds = ['segment:left'];
  const snapshot = createViewerSnapshot({
    sourceId: 'subject.example',
    selectedIds,
    observedAtMs: Number.NaN
  });

  selectedIds.push('segment:right');
  assert.deepEqual(snapshot, {
    sourceId: 'subject.example',
    selectedIds: ['segment:left'],
    observedAtMs: 0
  });
  assert.equal(createViewerSnapshot({ observedAtMs: -12 }).observedAtMs, 0);
});

test('workflow composition remains external and is observed through a clone', () => {
  const workflow = createEmptyWorkflow({ id: 'example', title: 'Example composition' });
  const source = createViewerWorkflowCompositionSource(workflow);

  assert.equal(source.kind, 'workflow-composition-source');
  assert.notEqual(source.workflow, workflow);
  assert.equal(source.workflow.id, 'example');
  assert.equal(source.readModel.workflowId, 'example');
  assert.equal(source.readModel.moduleCount, 0);

  workflow.title = 'Changed outside Viewer';
  assert.equal(source.workflow.title, 'Example composition');
});

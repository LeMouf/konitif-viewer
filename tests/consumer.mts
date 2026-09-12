import {
  createViewerSnapshot,
  createViewerWorkflowCompositionSource,
  type ViewerIntent,
  type ViewerPort,
  type ViewerSnapshot
} from '@konitif/viewer';
import { createEmptyWorkflow } from '@konitif/composition';

const snapshot: ViewerSnapshot = createViewerSnapshot({
  sourceId: 'consumer',
  selectedIds: ['subject'],
  observedAtMs: 12
});
const intent: ViewerIntent = { type: 'focus', id: 'subject' };
const port: ViewerPort = {
  read: () => snapshot,
  dispatch: (_intent) => undefined
};
const source = createViewerWorkflowCompositionSource(
  createEmptyWorkflow({ id: 'consumer', title: 'Consumer' })
);

port.dispatch(intent);
void source.readModel;

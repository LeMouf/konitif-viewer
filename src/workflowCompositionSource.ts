import {
  cloneWorkflow,
  projectWorkflowCompositionReadModel,
  type Workflow,
  type WorkflowCompositionReadModel
} from '@konitif/composition';

/**
 * Projection-neutral source a Viewer can consume without requiring a Nodal
 * incarnation. The Workflow Composition authority remains external.
 */
export interface ViewerWorkflowCompositionSource {
  kind: 'workflow-composition-source';
  workflow: Workflow;
  readModel: WorkflowCompositionReadModel;
}

export function createViewerWorkflowCompositionSource(
  workflow: Workflow
): ViewerWorkflowCompositionSource {
  return {
    kind: 'workflow-composition-source',
    workflow: cloneWorkflow(workflow),
    readModel: projectWorkflowCompositionReadModel(workflow)
  };
}

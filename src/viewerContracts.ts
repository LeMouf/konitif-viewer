export interface ViewerSnapshot {
  sourceId: string | null;
  selectedIds: readonly string[];
  observedAtMs: number;
}

export type ViewerIntent =
  | { type: 'select'; ids: readonly string[] }
  | { type: 'focus'; id: string | null }
  | { type: 'reset-view' };

export interface ViewerPort<
  Snapshot extends ViewerSnapshot = ViewerSnapshot,
  Intent = ViewerIntent
> {
  read(): Snapshot;
  dispatch(intent: Intent): void;
}

export function createViewerSnapshot(
  input: Partial<ViewerSnapshot> = {}
): ViewerSnapshot {
  return {
    sourceId: input.sourceId ?? null,
    selectedIds: [...(input.selectedIds ?? [])],
    observedAtMs: finiteNonNegative(input.observedAtMs)
  };
}

function finiteNonNegative(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0;
}

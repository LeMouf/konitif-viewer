# @konitif/viewer

Amodal Viewer contracts for projecting a subject without transferring the
subject's authority to a visual surface.

## Installation

```sh
npm install @konitif/viewer
```

## What it provides

- `ViewerSnapshot` for source, selection and observation state.
- `ViewerIntent` for select, focus and reset requests.
- `ViewerPort` for explicit reads and intent dispatch.
- `ViewerWorkflowCompositionSource` for detached composition reads.

## Authority boundary

The package defines how a Viewer observes and addresses a subject. It does not
provide a renderer, camera, geometry, physics policy or product workflow.
Specialized projections may extend the contracts, while domain authorities
remain responsible for admitting or refusing emitted intents.

## Quick start

```ts
import { createViewerSnapshot, type ViewerPort } from '@konitif/viewer';

const snapshot = createViewerSnapshot({
  sourceId: 'composition:example',
  selectedIds: ['step:inspect'],
});

const port: ViewerPort = {
  read: () => snapshot,
  dispatch: intent => console.log(intent),
};
```

## Public entry points

| Entry | Purpose |
| --- | --- |
| `@konitif/viewer` | Viewer contracts, snapshot factory and composition source. |

## Reference

See [`reference/`](reference/) for the machine-readable capability catalog and
authority diagrams. Three-dimensional rendering is a separate incarnation in
`@konitif/viewer-3d`.

## License

Source-available under [PolyForm Noncommercial 1.0.0](LICENSE.md), not OSI open
source. Commercial use requires separate written authorization.

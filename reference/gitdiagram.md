# GitDiagram architecture — @konitif/viewer

This architecture view was generated from the public repository by [GitDiagram](https://gitdiagram.com/lemouf/konitif-viewer) on 2026-09-20 19:02:20 UTC.

It is a documentation projection of the repository tree, README, and source files sampled by GitDiagram. It does not replace the authored contracts in [catalog.json](catalog.json) and [diagrams.json](diagrams.json), nor does it establish runtime authority.

The Mermaid source keeps GitDiagram's groups, nodes, relationships, and source links. GitDiagram's forced color classes and HTML line breaks are omitted so the diagram remains readable in local previews and dark themes.

- Public repository: [konitif-viewer](https://github.com/LeMouf/konitif-viewer)
- Interactive diagram: [Open in GitDiagram](https://gitdiagram.com/lemouf/konitif-viewer)

## Architecture diagram

```mermaid
flowchart TD

subgraph group_contracts["Viewer Contracts"]
  node_viewer_snapshot["Viewer Snapshot — [viewerContracts.ts]"]
  node_viewer_intent["Viewer Intent — [viewerContracts.ts]"]
  node_viewer_port["Viewer Port — [viewerContracts.ts]"]
end

subgraph group_factories["Projection Factories"]
  node_snapshot_factory["Snapshot Factory — [viewerContracts.ts]"]
  node_composition_factory["Composition Source"]
end

subgraph group_external["External Authorities"]
  node_composition_package["Composition Package"]
  node_workflow_authority["Workflow Authority"]
  node_domain_authority["Domain Authority"]
end

node_host(("Host Application"))

node_host -->|"creates snapshot"| node_snapshot_factory
node_snapshot_factory -->|"normalizes state"| node_viewer_snapshot
node_snapshot_factory -->|"returns snapshot"| node_host
node_host -->|"creates source"| node_composition_factory
node_composition_factory -->|"projects workflow"| node_composition_package
node_composition_package -->|"returns read model"| node_composition_factory
node_composition_factory -->|"returns source"| node_host
node_host -->|"reads or dispatches"| node_viewer_port
node_viewer_port -->|"reads snapshot"| node_viewer_snapshot
node_host -->|"creates intents"| node_viewer_intent
node_host -.->|"submits intents"| node_domain_authority
node_workflow_authority -.->|"supplies workflow"| node_composition_factory

click node_snapshot_factory "https://github.com/lemouf/konitif-viewer/blob/main/src/viewerContracts.ts"
click node_composition_factory "https://github.com/lemouf/konitif-viewer/blob/main/src/workflowCompositionSource.ts"
click node_viewer_snapshot "https://github.com/lemouf/konitif-viewer/blob/main/src/viewerContracts.ts"
click node_viewer_intent "https://github.com/lemouf/konitif-viewer/blob/main/src/viewerContracts.ts"
click node_viewer_port "https://github.com/lemouf/konitif-viewer/blob/main/src/viewerContracts.ts"

```

## Generated analysis

@konitif/viewer is a small contract-and-adapter library. A host creates normalized viewer snapshots or a detached workflow-composition source, then exposes/uses a ViewerPort to read state and dispatch selection, focus, or reset intents. The host remains responsible for forwarding intents to domain authorities; rendering and camera behavior are explicitly outside this package. The composition dependency supplies workflow cloning and read-model projection. Arrows are limited to sampled implementation calls and README-documented authority boundaries.

# @konitif/viewer

Amodal contracts for surfaces that project a subject without becoming the
authority for that subject.

`ViewerSnapshot`, `ViewerIntent` and `ViewerPort` describe selection, focus,
reset and observation independently from a rendering technology. A specialized
projection may extend them with its own state and commands.

`ViewerWorkflowCompositionSource` exposes a cloned Workflow and its read model
without requiring Nodal or a particular visual modality.

This package does not provide a renderer, camera, geometry or physics policy.
Those concerns belong to incarnations such as `@konitif/viewer-3d`.

## Local qualification

The source package owns its TypeScript toolchain and repeatable checks:

```sh
npm ci
npm run build
npm test
npm run verify:package
```

`verify:package` packs Viewer and its installed Composition dependency, then
loads the resulting archives from an isolated ESM consumer and checks their
public declarations with strict NodeNext resolution. It does not publish.

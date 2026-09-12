# Release boundary

`@konitif/viewer` is published only from the standalone
`LeMouf/konitif-viewer` repository. A merge does not publish a package.

Before release:

1. install exactly the reviewed lockfile with lifecycle scripts disabled;
2. build ESM and declarations with the locked TypeScript compiler;
3. run the package contracts and isolated archive consumer;
4. review the exact archive file list, integrity and version;
5. require a matching protected `v<version>` tag on `main` and the
   `npm-release` environment;
6. publish that verified archive through GitHub Actions OIDC.

Publication additionally requires the repository variable
`VIEWER_NPM_PUBLISH_ENABLED=true`. Once the package exists on npm, configure
Trusted Publishing for
`LeMouf / konitif-viewer / publish.yml / npm-release`; permit direct
`npm publish`, and configure the GitHub environment to admit protected tags
matching `v*`.

## Initial package bootstrap

Trusted Publishing is configured from an existing package's npm settings.
Because `@konitif/viewer@0.284.1` is the first registry version, its reviewed
archive must be published once by an authenticated maintainer, as an explicit
bootstrap exception. Leave `VIEWER_NPM_PUBLISH_ENABLED` absent while pushing
`v0.284.1`, publish only the archive emitted by `prepare-release-archive.mjs`,
then configure Trusted Publishing and enable the repository variable for later
versions. The bootstrap has no CI provenance and must not be repeated for a
subsequent version.

A tag push is the normal release trigger. For recovery, dispatch the workflow
from the exact tag in GitHub's “Use workflow from” selector and provide the same
tag as input. Dispatching from `main` is intentionally refused even if the input
names an existing tag.

The workflow does not upgrade Node or npm and does not publish source from a
branch checkout. No renderer, physics backend, browser or product adapter is
part of this release boundary.

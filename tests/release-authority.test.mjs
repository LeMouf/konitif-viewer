import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { assertPublishingTools, assertReleaseInputs } from '../scripts/check-release.mjs';

const json = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));

test('release inputs bind the exact package version to its repository and tag ref', () => {
  const policy = json('release-policy.json');
  const manifest = json('package.json');
  const lock = json('package-lock.json');
  const base = {
    GITHUB_REPOSITORY: 'LeMouf/konitif-viewer',
    GITHUB_REF: 'refs/tags/v0.284.1'
  };
  assert.doesNotThrow(() => assertReleaseInputs(policy, manifest, lock, {
    ...base,
    GITHUB_EVENT_NAME: 'push'
  }));
  assert.doesNotThrow(() => assertReleaseInputs(policy, manifest, lock, {
    ...base,
    GITHUB_EVENT_NAME: 'workflow_dispatch',
    VIEWER_RELEASE_TAG: 'v0.284.1'
  }));
  assert.throws(() => assertReleaseInputs(policy, manifest, lock, {
    ...base,
    GITHUB_EVENT_NAME: 'workflow_dispatch',
    VIEWER_RELEASE_TAG: 'v0.284.2'
  }));
  assert.throws(() => assertReleaseInputs(policy, manifest, lock, {
    ...base,
    GITHUB_EVENT_NAME: 'workflow_dispatch',
    GITHUB_REF: 'refs/heads/main',
    VIEWER_RELEASE_TAG: 'v0.284.1'
  }));
});

test('publication requires an OIDC-capable preinstalled npm without upgrading it', () => {
  assert.doesNotThrow(() => assertPublishingTools('24.20.0', '11.6.0'));
  assert.throws(() => assertPublishingTools('22.13.0', '11.6.0'));
  assert.throws(() => assertPublishingTools('24.20.0', '11.4.9'));
});

test('the publish workflow is the only constrained publication authority', () => {
  const workflow = readFileSync(new URL('../.github/workflows/publish.yml', import.meta.url), 'utf8');
  assert.match(workflow, /tags: \['v\*'\]/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /vars\.VIEWER_NPM_PUBLISH_ENABLED == 'true'/);
  assert.match(workflow, /environment: npm-release/);
  assert.match(workflow, /id-token: write/);
  assert.match(workflow, /test "\$\{GITHUB_REF\}" = "refs\/tags\/\$\{expected\}"/);
  assert.match(workflow, /npm publish \.release\/package\.tgz --access public --provenance --ignore-scripts/);
  assert.doesNotMatch(workflow, /npm install -g|npm update/);
});

test('the release preparation retains only the archive emitted by the verifier', () => {
  const script = readFileSync(new URL('../scripts/prepare-release-archive.mjs', import.meta.url), 'utf8');
  assert.match(script, /realpathSync\(evidence\.archive\)/);
  assert.match(script, /COPYFILE_EXCL/);
  assert.doesNotMatch(script, /npm pack|readdirSync/);
});

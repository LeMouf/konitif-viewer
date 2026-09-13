import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = realpathSync(fileURLToPath(new URL('..', import.meta.url)));
const evidence = mkdtempSync(join(tmpdir(), 'konitif-viewer-package-'));
const cache = join(evidence, 'npm-cache');
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

assert.equal(manifest.name, '@konitif/viewer');
assert.equal(manifest.private, false);
assert.deepEqual(manifest.dependencies, { '@konitif/composition': '0.284.2' });
assert.deepEqual(manifest.exports, {
  '.': { types: './dist/index.d.ts', import: './dist/index.js' }
});

const run = (command, args, cwd = root) => execFileSync(command, args, {
  cwd,
  encoding: 'utf8',
  maxBuffer: 8 * 1024 * 1024,
  env: { ...process.env, npm_config_offline: 'true', npm_config_cache: cache }
});

function pack(source, destination) {
  mkdirSync(destination, { recursive: true });
  const args = ['pack', '--offline', '--ignore-scripts', '--json', '--pack-destination', destination];
  const npmCli = process.platform === 'win32'
    ? join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js')
    : join(dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js');
  assert.ok(existsSync(npmCli), `Installed npm CLI required at ${npmCli}`);
  const output = run(process.execPath, [npmCli, ...args], source);
  return JSON.parse(output)[0];
}

function extract(packed, destination, packageName) {
  const archive = join(destination, packed.filename);
  const target = join(evidence, 'consumer/node_modules', packageName);
  mkdirSync(target, { recursive: true });
  run('tar', ['-xzf', archive, '-C', target, '--strip-components=1']);
  return { archive, target };
}

const viewerDirectory = join(evidence, 'viewer');
const packedViewer = pack(root, viewerDirectory);
const files = packedViewer.files.map(file => file.path).sort();
for (const file of files) {
  assert.match(file, /^(dist\/|reference\/|package\.json$|README\.md$|LICENSE\.md$)/);
}
for (const file of [
  'dist/index.js',
  'dist/index.d.ts',
  'dist/viewerContracts.js',
  'dist/workflowCompositionSource.js',
  'reference/README.md',
  'reference/catalog.json',
  'reference/diagrams.json',
  'README.md',
  'LICENSE.md',
  'package.json'
]) assert.ok(files.includes(file), file);

const viewer = extract(packedViewer, viewerDirectory, '@konitif/viewer');
const compositionRoot = realpathSync(join(root, 'node_modules/@konitif/composition'));
const compositionManifest = JSON.parse(readFileSync(join(compositionRoot, 'package.json'), 'utf8'));
assert.equal(compositionManifest.version, manifest.dependencies['@konitif/composition']);
const compositionDirectory = join(evidence, 'composition');
const packedComposition = pack(compositionRoot, compositionDirectory);
extract(packedComposition, compositionDirectory, '@konitif/composition');

cpSync(join(root, 'tests/consumer.mts'), join(evidence, 'consumer/consumer.mts'));
run(process.execPath, [
  join(root, 'node_modules/typescript/bin/tsc'),
  '--noEmit',
  '--strict',
  '--skipLibCheck', 'false',
  '--target', 'ES2022',
  '--module', 'NodeNext',
  '--moduleResolution', 'NodeNext',
  'consumer.mts'
], join(evidence, 'consumer'));
run(process.execPath, ['--input-type=module', '-e', `
  import assert from 'node:assert/strict';
  import { createEmptyWorkflow } from '@konitif/composition';
  import { createViewerSnapshot, createViewerWorkflowCompositionSource } from '@konitif/viewer';
  const snapshot = createViewerSnapshot({ selectedIds: ['subject'], observedAtMs: -1 });
  assert.deepEqual(snapshot.selectedIds, ['subject']);
  assert.equal(snapshot.observedAtMs, 0);
  const source = createViewerWorkflowCompositionSource(createEmptyWorkflow({ id: 'proof', title: 'Proof' }));
  assert.equal(source.kind, 'workflow-composition-source');
  assert.equal(source.readModel.workflowId, 'proof');
`], join(evidence, 'consumer'));

const bytes = readFileSync(viewer.archive);
assert.equal(
  packedViewer.integrity,
  `sha512-${createHash('sha512').update(bytes).digest('base64')}`
);

const result = {
  status: 'passed',
  name: manifest.name,
  version: manifest.version,
  dependency: `${compositionManifest.name}@${compositionManifest.version}`,
  integrity: packedViewer.integrity,
  sha256: createHash('sha256').update(bytes).digest('hex'),
  bytes: bytes.length,
  files: files.length,
  archive: viewer.archive,
  consumer: 'isolated ESM and strict NodeNext declarations',
  evidence
};
writeFileSync(join(evidence, 'result.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));

#!/usr/bin/env node
// Contract check for the advanced-components catalog: assemble the blank
// kit workspace (the fallback every consumer has), copy EVERY catalog
// component in exactly the way an agent performs the copy-in — everything
// but component.json into src/components/, plus one barrel line — then run
// the real toolchain and assert each component surfaced in design.json.
//
// Green here ≈ "every catalog component drops into a workspace and builds".
//
// Usage:
//   node scripts/build-components.mjs

import { appendFile, cp, mkdir, readdir, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const KITS_SRC = resolve(ROOT, 'kits');
const COMPONENTS_SRC = resolve(ROOT, 'components');
const WORK = resolve(ROOT, '.build/_components');

// Mirror build-kit.mjs: never carry local artifacts or metadata files.
const SKIP = new Set(['node_modules', 'dist', 'dist-ssr', '.DS_Store', 'kit.json', '.gitkeep', 'component.json']);
const filter = (src) => !SKIP.has(src.split('/').at(-1));

if (!existsSync(COMPONENTS_SRC)) {
  console.log('build-components: no components/ catalog — nothing to check');
  process.exit(0);
}
const names = (await readdir(COMPONENTS_SRC, { withFileTypes: true }))
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();
if (names.length === 0) {
  console.log('build-components: empty components/ catalog — nothing to check');
  process.exit(0);
}

await rm(WORK, { recursive: true, force: true });
await mkdir(WORK, { recursive: true });

// The workspace: base ∪ blank (the fallback kit, always present).
await cp(resolve(KITS_SRC, '_base'), WORK, { recursive: true, filter });
await cp(resolve(KITS_SRC, 'blank'), WORK, { recursive: true, force: true, filter });

// The copy-in, per components/AGENTS.md: everything but component.json
// into src/components/, one barrel line per component.
for (const name of names) {
  await cp(resolve(COMPONENTS_SRC, name), resolve(WORK, 'src/components'), {
    recursive: true,
    force: true,
    filter,
  });
  await appendFile(resolve(WORK, 'src/components/index.ts'), `export * from './${name}';\n`);
}

execFileSync('bun', ['install'], { cwd: WORK, stdio: 'inherit' });
console.log(`\nbuild-components: ${names.join(', ')} — bun run build`);
execFileSync('bun', ['run', 'build'], { cwd: WORK, stdio: 'inherit' });

// The build passing isn't enough — each component must also have made it
// into the machine-readable catalog (design.json.components).
const design = JSON.parse(await readFile(resolve(WORK, 'design.json'), 'utf8'));
const surfaced = new Set((design.components ?? []).map((c) => c.name));
const missing = names.filter((n) => !surfaced.has(n));
if (missing.length > 0) {
  console.error(`build-components: built, but missing from design.json.components: ${missing.join(', ')}`);
  process.exit(1);
}
console.log(`build-components: ${names.length} component(s) built + surfaced ✓ (workspace at .build/_components)`);

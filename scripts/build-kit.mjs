#!/usr/bin/env node
// Contract check: assemble { _base ∪ <kit> } into .build/<slug> the way
// consumers materialize a kit workspace (kit files win on path
// collisions; kit.json is metadata and never materialized), then run
// the real toolchain — `bun install && bun run build`, exactly what a
// consumer workspace runs.
//
// Green here ≈ "this kit builds for every consumer".
//
// Usage:
//   node scripts/build-kit.mjs <slug>     one kit
//   node scripts/build-kit.mjs --all      every kit (node_modules reused
//                                         across kits — deps come from _base,
//                                         so they're identical)

import { cp, mkdir, readdir, rm, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const KITS_SRC = resolve(ROOT, 'kits');
const BUILD_DIR = resolve(ROOT, '.build');

// Mirror pack-kits.mjs: never carry local build artifacts into the
// assembled workspace, and never materialize kit.json.
const SKIP = new Set(['node_modules', 'dist', 'dist-ssr', '.DS_Store', 'kit.json', '.gitkeep']);
const filter = (src) => !SKIP.has(src.split('/').at(-1));

async function listKits() {
  const entries = await readdir(KITS_SRC, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && e.name !== '_base')
    .map((e) => e.name)
    .sort();
}

async function buildKit(slug, sharedModules) {
  const work = resolve(BUILD_DIR, slug);
  await rm(work, { recursive: true, force: true });
  await mkdir(work, { recursive: true });

  // base ∪ kit — kit wins on collisions (cp overwrites with force).
  await cp(resolve(KITS_SRC, '_base'), work, { recursive: true, filter });
  await cp(resolve(KITS_SRC, slug), work, { recursive: true, force: true, filter });

  if (sharedModules && existsSync(sharedModules)) {
    // Deps are defined entirely by _base/package.json, so node_modules is
    // identical across kits — move it from the previous kit's workspace
    // instead of paying bun install six times.
    await rename(sharedModules, resolve(work, 'node_modules'));
  } else {
    execFileSync('bun', ['install'], { cwd: work, stdio: 'inherit' });
  }

  console.log(`\nbuild-kit: ${slug} — bun run build`);
  execFileSync('bun', ['run', 'build'], { cwd: work, stdio: 'inherit' });
  console.log(`build-kit: ${slug} ✓ (workspace at .build/${slug})`);
  return resolve(work, 'node_modules');
}

const arg = process.argv[2];
if (!arg) {
  console.error('usage: build-kit.mjs <slug> | --all');
  process.exit(1);
}

const slugs = arg === '--all' ? await listKits() : [arg];
if (arg !== '--all' && !existsSync(resolve(KITS_SRC, arg))) {
  console.error(`build-kit: no kit at kits/${arg}`);
  process.exit(1);
}

let modules = null;
for (const slug of slugs) {
  modules = await buildKit(slug, modules);
}
console.log(`\nbuild-kit: ${slugs.length} kit(s) built ✓`);

#!/usr/bin/env node
// Pack the kits tree into the published artifact: dist/kits-bundle.json.
//
// Why a JSON bundle instead of publishing the raw file tree: npm pack
// unconditionally strips `.gitignore` and `package-lock.json` from a
// tarball, and _base ships BOTH as part of the workspace on purpose
// (`npm install` wants the lock). Encoding the tree into JSON at
// publish time sidesteps npm's file-exclusion rules and gives the
// consumer exactly the bytes that are in git.
//
// Shape (keep in sync with CONTRACT.md):
//
//   {
//     formatVersion: 1,
//     base: { "<relpath>": "<base64>", ... },
//     kits: { "<slug>": { manifest, files: { "<relpath>": "<base64>" } } }
//   }
//
// `base` is the kit-invariant substrate (kits/_base). Each kit's `files`
// are its overlay — they win on path collisions when a workspace is
// materialized as base ∪ kit. `manifest` is the parsed kit.json +
// derived slug (the folder name).

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { collectTokensFromCss } from '../kits/_base/scripts/lib/tokens.mjs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const KITS_SRC = resolve(ROOT, 'kits');
const BASE_SRC = resolve(KITS_SRC, '_base');
const OUT_PATH = resolve(ROOT, 'dist/kits-bundle.json');

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'dist-ssr',
  '.git',
  '.turbo',
  '.next',
  '.vite',
  '.cache',
]);
// `.gitkeep` is a marker for empty dirs in git; we don't need to ship
// it to consumers. Empty directories materialize implicitly when the
// first child file lands. `kit.json` is kit METADATA, not a workspace
// file — it's read into the manifest, never materialized, so it's
// excluded from the packed file tree here too.
const SKIP_FILES = new Set(['.DS_Store', 'pnpm-lock.yaml', '.gitkeep', 'kit.json']);

async function walk(dir, acc = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walk(join(dir, entry.name), acc);
    } else if (entry.isFile()) {
      if (SKIP_FILES.has(entry.name)) continue;
      acc.push(join(dir, entry.name));
    }
  }
  return acc;
}

async function packTree(srcDir, label) {
  const files = (await walk(srcDir)).sort();
  if (files.length === 0) {
    console.error(`pack: no files found under ${srcDir}`);
    process.exit(1);
  }
  let bytes = 0;
  /** @type {Record<string, string>} */
  const out = {};
  for (const abs of files) {
    const rel = relative(srcDir, abs).replaceAll('\\', '/');
    const buf = await readFile(abs);
    bytes += buf.length;
    out[rel] = buf.toString('base64');
  }
  console.log(`pack: ${label} → ${files.length} files, ${bytes} bytes`);
  return out;
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

function validateManifest(slug, raw) {
  const errs = [];
  if (typeof raw !== 'object' || raw === null) errs.push('kit.json must be a JSON object');
  const m = /** @type {Record<string, unknown>} */ (raw ?? {});
  if (typeof m.name !== 'string' || !m.name.trim()) errs.push('`name` (non-empty string) required');
  if (typeof m.description !== 'string' || !m.description.trim())
    errs.push('`description` (non-empty string) required');
  if (typeof m.whenToUse !== 'string' || !m.whenToUse.trim())
    errs.push('`whenToUse` (non-empty string) required');
  if (!Array.isArray(m.tags) || !m.tags.every((t) => typeof t === 'string'))
    errs.push('`tags` (string[]) required');
  if (typeof m.featured !== 'boolean') errs.push('`featured` (boolean) required');
  if (typeof m.order !== 'number') errs.push('`order` (number) required');
  if (m.accent != null && typeof m.accent !== 'string') errs.push('`accent` must be a string or null');
  if (m.thumbnail != null && typeof m.thumbnail !== 'string')
    errs.push('`thumbnail` must be a string or null');
  if (errs.length > 0) {
    console.error(`pack: kit "${slug}" kit.json invalid:\n  - ${errs.join('\n  - ')}`);
    process.exit(1);
  }
  return {
    slug,
    name: m.name,
    description: m.description,
    whenToUse: m.whenToUse,
    tags: m.tags,
    featured: m.featured,
    order: m.order,
    accent: m.accent ?? null,
    thumbnail: m.thumbnail ?? null,
  };
}

async function packKits() {
  const entries = await readdir(KITS_SRC, { withFileTypes: true });
  const slugs = entries
    .filter((e) => e.isDirectory() && e.name !== '_base' && !SKIP_DIRS.has(e.name))
    .map((e) => e.name)
    .sort();
  if (slugs.length === 0) {
    console.error(`pack: no kits found under ${KITS_SRC} (need at least one alongside _base)`);
    process.exit(1);
  }

  /** @type {Record<string, { manifest: object, files: Record<string,string> }>} */
  const kits = {};
  for (const slug of slugs) {
    if (!SLUG_RE.test(slug)) {
      console.error(
        `pack: kit folder "${slug}" is not a valid slug (lowercase letters, digits, hyphens)`,
      );
      process.exit(1);
    }
    const kitDir = resolve(KITS_SRC, slug);
    let manifestRaw;
    try {
      manifestRaw = JSON.parse(await readFile(resolve(kitDir, 'kit.json'), 'utf8'));
    } catch (err) {
      console.error(`pack: kit "${slug}" is missing or has an unparseable kit.json: ${err.message}`);
      process.exit(1);
    }
    const manifest = validateManifest(slug, manifestRaw);
    // The kit's token DECLARATION — derived from globals.css (never
    // hand-authored, so it can't drift) and attached to the manifest so
    // consumers can show/select tokens before any workspace exists.
    const tokens = collectTokensFromCss(await readFile(resolve(kitDir, 'src/globals.css'), 'utf8'));
    if (!tokens || Object.keys(tokens.base).length === 0) {
      console.error(`pack: kit "${slug}" declares no tokens — src/globals.css needs a :root block`);
      process.exit(1);
    }
    manifest.tokens = tokens;
    const files = await packTree(kitDir, `kit:${slug}`);
    // A kit must carry its theme + section catalog; framework/toolchain come
    // from base. Catch a malformed overlay at pack time, not downstream.
    for (const required of ['src/globals.css', 'src/sections/index.ts']) {
      if (!(required in files)) {
        console.error(`pack: kit "${slug}" is missing required overlay file ${required}`);
        process.exit(1);
      }
    }
    kits[slug] = { manifest, files };
  }
  // Consumers fall back to this kit when no (or an unknown) kit is
  // specified — it must always exist. See CONTRACT.md.
  const FALLBACK_KIT = 'blank';
  if (!(FALLBACK_KIT in kits)) {
    console.error(
      `pack: fallback kit "${FALLBACK_KIT}" is missing — consumers depend ` +
        `on it as the default. Add kits/${FALLBACK_KIT}/.`,
    );
    process.exit(1);
  }
  console.log(`pack: kits → ${slugs.length} (${slugs.join(', ')})`);
  return kits;
}

const base = await packTree(BASE_SRC, 'base   ');
const kits = await packKits();

await mkdir(dirname(OUT_PATH), { recursive: true });
await writeFile(OUT_PATH, JSON.stringify({ formatVersion: 1, base, kits }));
console.log(`pack: → ${relative(ROOT, OUT_PATH)}`);

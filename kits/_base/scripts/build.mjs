#!/usr/bin/env bun
// Build the design system as a library — Bun.build for JS, Tailwind CLI
// for CSS. No Vite, no esbuild: Bun's native bundler has no install-time
// native binary, so it just works in any consumer workspace.
//
//   dist/library.js      — ESM, re-exports every section (react EXTERNAL,
//                          everything else bundled).
//   dist/library.js.map  — external sourcemap.
//   dist/theme.css       — compiled Tailwind theme (tokens + used utilities).
//
// design.json is produced separately by `gen:design` (extract-design.mjs).
// Run with Bun: `bun scripts/build.mjs`.

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// React is provided by the consumer (the host runtime, one shared
// instance). Everything else a section needs is bundled. The `@` → src
// alias resolves automatically from tsconfig `paths`.
const REACT_EXTERNALS = [
  'react',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'react-dom',
  'react-dom/client',
  'react-dom/server',
];

const result = await Bun.build({
  entrypoints: [resolve(ROOT, 'src/index.ts')],
  outdir: resolve(ROOT, 'dist'),
  // Single entry → emit `library.js` (+ `library.js.map`) rather than the
  // default `index.js` — consumers resolve `dist/library.js` by name.
  naming: 'library.[ext]',
  target: 'browser',
  format: 'esm',
  minify: true,
  sourcemap: 'external',
  external: REACT_EXTERNALS,
  define: { 'process.env.NODE_ENV': '"production"' },
});
if (!result.success) {
  for (const log of result.logs) console.error(log);
  throw new AggregateError(result.logs, 'Bun.build failed');
}

// Tailwind v4 CLI compiles the theme + scans src/ for used utilities. Its
// native oxide binary ships as a prebuilt optional dependency (no postinstall
// script), so `bun install` resolves it cleanly.
//
// The entry is src/index.css (base-owned: kit globals.css + _base motion.css),
// falling back to globals.css when there is no index.css. The fallback is not
// defensive noise — this script TRAVELS. A consumer materializes a workspace
// once and keeps it, refreshing only its build tooling from the pinned ref, so
// a workspace created before index.css existed will run this file against a
// tree that has only globals.css. Compiling what is actually there is what
// lets the toolchain move without touching anyone's design source.
const cssEntry = existsSync(resolve(ROOT, 'src/index.css'))
  ? resolve(ROOT, 'src/index.css')
  : resolve(ROOT, 'src/globals.css');
execFileSync(
  'bun',
  ['x', '@tailwindcss/cli', '-i', cssEntry, '-o', resolve(ROOT, 'dist/theme.css'), '--minify'],
  { cwd: ROOT, stdio: 'inherit' },
);

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

const SRC = resolve(ROOT, 'src');

/**
 * Keep `<Name>Demo` and `<Name>Showcase` out of the shipped bundle.
 *
 * They are PREVIEW DATA, not runtime API. `extract-design.mjs` reads them
 * statically and embeds them in `design.json` — which is its own package export
 * — so the editor's canvas already has them without the library carrying a
 * second copy. Nothing imports them at runtime; they were in `library.js` only
 * because the barrels re-export with `export *`, which sweeps up every name a
 * module happens to expose.
 *
 * Measured before this existed: 17.4 KB of the blank kit's 214 KB, and 24.7 KB
 * of finance's 246 KB — 8–10% of every consumer's download, to ship the strings
 * that draw a preview thumbnail in a different tool.
 *
 * The transform is one token wide: drop the `export` keyword and the const
 * becomes an unreferenced local that the minifier's dead-code pass removes.
 * Deliberately not a bracket-matching delete of the whole literal — a regex that
 * has to balance nested arrays of objects is a regex that eventually eats a
 * component.
 *
 * It runs at BUNDLE time only, which is the whole reason it is safe:
 * `gen:design` and `tsc --noEmit` run first, in that order, against untouched
 * source (see package.json's `build`). So the extractor still sees a real
 * `export`, which it requires, and types still check. If a section genuinely
 * references its own `Demo`, the local stays referenced and survives — correct
 * either way.
 */
const stripPreviewData = {
  name: 'strip-preview-data',
  setup(build) {
    build.onLoad({ filter: /\.tsx?$/ }, async (args) => {
      // Our source only. A dependency's `.ts` has nothing to strip, and loading
      // node_modules through here would just be slower.
      if (!args.path.startsWith(SRC)) return undefined;
      const source = await Bun.file(args.path).text();
      return {
        contents: source.replace(/^export const (\w+(?:Showcase|Demo))\b/gm, 'const $1'),
        loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts',
      };
    });
  },
};

const result = await Bun.build({
  entrypoints: [resolve(ROOT, 'src/index.ts')],
  plugins: [stripPreviewData],
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
// script), so `bun install` resolves it cleanly. The entry is src/index.css
// (base-owned: kit globals.css + _base motion.css), not globals.css itself.
execFileSync(
  'bun',
  [
    'x',
    '@tailwindcss/cli',
    '-i',
    resolve(ROOT, 'src/index.css'),
    '-o',
    resolve(ROOT, 'dist/theme.css'),
    '--minify',
  ],
  { cwd: ROOT, stdio: 'inherit' },
);

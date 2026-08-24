#!/usr/bin/env node
// Generate the glue for the COMPONENT LAB under components.gen/ (gitignored).
// Sibling of gen-kits.mjs, and the same reason it exists: Next has no
// import.meta.glob, so discovery happens here at build time.
//
//   manifests.ts   — typed, sorted catalog (from each component.json)
//   registry.tsx   — 'use client' + STATIC imports of every component and its
//                    <Name>Showcase, as one map
//   theme.css      — the lab's default theme: one kit's globals.css UNTOUCHED,
//                    plus @source for the catalog and _base
//   themes.ts      — slug → dynamic import of that kit's lab CSS, for the
//                    theme switcher
//   <slug>.lab.css — one per kit, same shape as theme.css
//
// Two things here are load-bearing and easy to get wrong:
//
//   1. STATIC imports in registry.tsx, not the `useEffect` + dynamic import
//      that KitFrame uses. The lab has to be able to render with JavaScript
//      DISABLED — that is the single most valuable check it offers, since a
//      published page ships no JS unless a section declares `@hydrate`. A
//      client component whose modules load in an effect renders an empty frame
//      with scripts off, which would make every component look broken instead
//      of only the ones that are.
//
//   2. `@source "../../components"`. Catalog components live OUTSIDE the demo
//      root, so Tailwind's automatic content detection never finds them — the
//      exact trap the kit entries already work around for kits/. Without it a
//      perfectly good component renders completely unstyled, which reads as
//      the component being broken rather than the lab being misconfigured.
//
// Kit and component files are never edited: they must stay byte-identical to
// what ships in the published bundle / gets copied into a workspace.

import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const DEMO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = resolve(DEMO, '..');
const COMPONENTS = resolve(ROOT, 'components');
const KITS = resolve(ROOT, 'kits');
const OUT = resolve(DEMO, 'components.gen');

// The theme the lab loads STATICALLY, so the no-JS pass is styled. Any other
// theme arrives through the switcher, which needs JS by construction.
const DEFAULT_THEME = 'blank';

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const entries = existsSync(COMPONENTS)
  ? (await readdir(COMPONENTS, { withFileTypes: true })).filter((e) => e.isDirectory())
  : [];

const manifests = [];
for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
  const manifestPath = resolve(COMPONENTS, entry.name, 'component.json');
  if (!existsSync(manifestPath)) continue; // a folder without one isn't a component
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const file = resolve(COMPONENTS, entry.name, `${entry.name}.tsx`);
  if (!existsSync(file)) {
    // Loud: a manifest with no component is a catalog error, and a lab that
    // silently skipped it would hide exactly the thing it exists to show.
    console.error(`gen-components: ${entry.name}/component.json has no ${entry.name}.tsx`);
    process.exitCode = 1;
    continue;
  }
  manifests.push({
    dir: entry.name,
    ...manifest,
    implements: normalizeImplements(manifest.implements),
    cases: showcaseCases(await readFile(file, 'utf8')),
  });
}

/**
 * `implements` in one shape, whichever shape it was authored in.
 *
 * A behaviour token is one ANSWER to "how should this behave?", so a component
 * covering two behaviours declares two — and each token carries the props that
 * MAKE it that behaviour, because a row that says only `scroll-stack →
 * CardStack` leaves the agent choosing `layout` and puts the guess back where
 * the catalog just took it out.
 *
 * A bare string stays legal, and means the component's defaults already are that
 * behaviour (`Marquee` has nothing to choose).
 *
 * `note` carries the part of a recipe that cannot be a literal — an interval that
 * has to come from the design's own prototype timing has no value to put in
 * `props`, and "don't invent one" is exactly the instruction worth carrying into
 * the table.
 */
function normalizeImplements(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === 'string') return { token: entry, props: {}, note: null };
      if (!entry || typeof entry !== 'object' || typeof entry.token !== 'string') return null;
      return { token: entry.token, props: entry.props ?? {}, note: entry.note ?? null };
    })
    .filter(Boolean);
}

/**
 * The showcase CASES, read out of the source text.
 *
 * Deliberately a source scan rather than an import: the Playwright specs
 * enumerate cases at collection time, and importing the component graph into the
 * test process drags `@/…` alias resolution and React into a place that has
 * neither. Labels are all the specs need — every assertion about CONTENT is made
 * against the rendered page, not against the props — so a scan that can only get
 * a test NAME wrong is the cheap side of that trade.
 *
 * Order matters and is preserved: the index is what `?case=` addresses.
 *
 * It counts the array's own entries and reads each one's OWN `label`, at exactly
 * the nesting the contract puts them. A flat `/label:/` sweep looked equivalent
 * and was not: a component whose showcase data happens to contain a `label`
 * field — a quiz's answer options, a chart's series — turned every one of them
 * into a phantom case, and since the specs read this file while the lab renders
 * from the registry, the two disagreed about how many cases exist. The specs then
 * addressed `?case=` numbers past the end, which the frame clamps, so the run
 * went green while testing the last case over and over.
 *
 * The rule here mirrors `read()` in registry.tsx deliberately: an entry counts
 * when it has `props`, and its name is its `label` or `Case N`. Two readers of
 * one contract, and they have to agree.
 */
function showcaseCases(source) {
  const decl = source.search(/export const \w+Showcase\s*=/);
  if (decl < 0) return [];
  const open = source.indexOf('[', decl);
  if (open < 0) return [];

  const cases = [];
  // Depth counts `[` and `{` together, so the showcase array itself is 1 and each
  // case object is 2. Anything the case's own data nests sits deeper and is
  // skipped by construction.
  let depth = 0;
  let entry = null;
  let i = open;

  while (i < source.length) {
    const ch = source[i];

    if (ch === '/' && source[i + 1] === '/') {
      const nl = source.indexOf('\n', i);
      i = nl < 0 ? source.length : nl + 1;
      continue;
    }
    if (ch === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      i = end < 0 ? source.length : end + 2;
      continue;
    }
    // Strings are skipped wholesale: a brace or an apostrophe inside prose copy
    // is the obvious way a depth counter loses its place.
    if (ch === '"' || ch === "'" || ch === '`') {
      i = readString(source, i).end;
      continue;
    }

    if (ch === '[' || ch === '{') {
      depth += 1;
      if (ch === '{' && depth === 2) entry = { label: null, hasProps: false };
      i += 1;
      continue;
    }
    if (ch === ']' || ch === '}') {
      depth -= 1;
      if (ch === '}' && depth === 1 && entry) {
        if (entry.hasProps) cases.push(entry.label ?? `Case ${cases.length + 1}`);
        entry = null;
      }
      i += 1;
      if (depth === 0) break; // the showcase array closed
      continue;
    }

    if (depth === 2 && entry && !/[\w$]/.test(source[i - 1] ?? '')) {
      const key = /^(label|props)\s*:/.exec(source.slice(i, i + 16));
      if (key?.[1] === 'props') {
        entry.hasProps = true;
        i += key[0].length;
        continue;
      }
      if (key?.[1] === 'label') {
        let at = i + key[0].length;
        while (/\s/.test(source[at] ?? '')) at += 1;
        const str = readString(source, at);
        // A label that isn't a literal leaves the entry unnamed rather than
        // dropping it — the contract's own rule, and the index has to hold.
        if (str.value !== null) entry.label = str.value;
        i = str.end;
        continue;
      }
    }

    i += 1;
  }

  return cases;
}

/** The string literal starting at `i`, and the index just past its closing
 *  quote. `value` is null when `i` isn't a quote at all. */
function readString(source, i) {
  const quote = source[i];
  if (quote !== '"' && quote !== "'" && quote !== '`') return { value: null, end: i + 1 };
  let value = '';
  for (let j = i + 1; j < source.length; j += 1) {
    if (source[j] === '\\') {
      value += source[j + 1] ?? '';
      j += 1;
      continue;
    }
    if (source[j] === quote) return { value, end: j + 1 };
    value += source[j];
  }
  return { value, end: source.length };
}

// Kit slugs, hoisted above the manifests write: specs sweep the catalog across
// every theme, and manifests.ts is the one generated module the test process can
// import — themes.ts carries CSS-importing loader thunks Playwright cannot load.
const kitSlugs = (await readdir(KITS, { withFileTypes: true }))
  .filter((e) => e.isDirectory() && e.name !== '_base')
  .map((e) => e.name)
  .sort();

const defaultTheme = kitSlugs.includes(DEFAULT_THEME) ? DEFAULT_THEME : kitSlugs[0];
if (!defaultTheme) {
  console.error('gen-components: no kits found — the lab has no theme to render in');
  process.exitCode = 1;
}

// ── manifests.ts ──────────────────────────────────────────────────────
await writeFile(
  resolve(OUT, 'manifests.ts'),
  [
    '// generated by scripts/gen-components.mjs — do not edit',
    'export interface CatalogComponent {',
    '  /** Folder name, and the route segment. */',
    '  dir: string;',
    '  name: string;',
    '  description: string;',
    '  whenToUse: string;',
    '  tags: string[];',
    '  /** Declared in component.json: does its recipe need client JS? */',
    '  hydrate: boolean;',
    '  /** The behaviour tokens this component answers, each with the props that',
    '   *  make it that behaviour, and a note for the part of the recipe that',
    '   *  cannot be a literal. Normalized here: a bare string in component.json',
    '   *  arrives as `{ token, props: {}, note: null }`. */',
    '  implements: { token: string; props: Record<string, unknown>; note: string | null }[];',
    '  vendor?: { pkg: string; version: string; license: string }[];',
    '  /** Showcase case labels, in `?case=` index order. Scanned from the source',
    '   *  so consumers can enumerate cases without importing the component. */',
    '  cases: string[];',
    '}',
    '',
    `export const components: CatalogComponent[] = ${JSON.stringify(manifests, null, 2)};`,
    '',
    '/** Kit theme slugs, here rather than themes.ts because that module\'s CSS',
    ' *  loader thunks cannot be imported by the test process. Plain data. */',
    `export const themes: string[] = ${JSON.stringify(kitSlugs)};`,
    '',
    `export const defaultTheme = ${JSON.stringify(defaultTheme ?? '')};`,
    '',
  ].join('\n'),
);

// ── registry.tsx ─────────────────────────────────────────────────────
// Static imports, and a `showcase` that is whatever the component exported —
// normalized to an ARRAY of named cases so the lab's content switcher has
// something to iterate whether the component exported one object or many.
await writeFile(
  resolve(OUT, 'registry.tsx'),
  [
    "'use client';",
    '',
    '// generated by scripts/gen-components.mjs — do not edit',
    '//',
    '// STATIC imports on purpose: the lab must render with JavaScript disabled,',
    '// and a module loaded in an effect produces an empty frame when it is.',
    '',
    "import type { ComponentType } from 'react';",
    ...manifests.map(
      (m) => `import * as ${m.dir}Mod from '../../components/${m.dir}/${m.dir}';`,
    ),
    '',
    'export interface ShowcaseCase {',
    '  /** What the switcher calls it. */',
    '  label: string;',
    '  props: Record<string, unknown>;',
    '}',
    '',
    'export interface RegistryEntry {',
    '  component: ComponentType<Record<string, unknown>> | null;',
    '  cases: ShowcaseCase[];',
    '}',
    '',
    '/** The component export and its showcase, out of one module.',
    ' *',
    ' *  CONTRACT.md is authoritative on the shape: `<Name>Showcase` is an array of',
    ' *  `{ props, label? }` static literals — the same shape a section\'s',
    ' *  `<Name>Demo` has, and what `extract-design.mjs` reads. Only that shape is',
    ' *  accepted here. A component exporting something else shows up as a',
    ' *  component with NO cases, which the lab says out loud; guessing at other',
    ' *  shapes would instead render a component with props that are really a',
    ' *  wrapper object, and the resulting mess would read as the component\'s bug. */',
    'function read(mod: Record<string, unknown>, name: string): RegistryEntry {',
    '  const component = typeof mod[name] === \'function\'',
    '    ? (mod[name] as ComponentType<Record<string, unknown>>)',
    '    : null;',
    '  const showcase = mod[`${name}Showcase`];',
    '  const cases: ShowcaseCase[] = [];',
    '  if (Array.isArray(showcase)) {',
    '    showcase.forEach((entry, i) => {',
    '      if (!entry || typeof entry !== \'object\') return;',
    '      const row = entry as { props?: unknown; label?: unknown };',
    '      if (!row.props || typeof row.props !== \'object\') return;',
    '      cases.push({',
    '        label: typeof row.label === \'string\' && row.label ? row.label : `Case ${i + 1}`,',
    '        props: row.props as Record<string, unknown>,',
    '      });',
    '    });',
    '  }',
    '  return { component, cases };',
    '}',
    '',
    'export const registry: Record<string, RegistryEntry> = {',
    ...manifests.map((m) => `  ${JSON.stringify(m.dir)}: read(${m.dir}Mod as Record<string, unknown>, ${JSON.stringify(m.name ?? m.dir)}),`),
    '};',
    '',
  ].join('\n'),
);

// ── per-theme CSS, PRECOMPILED to static files ────────────────────────
//
// The frame links `/lab-themes/<slug>.css` server-side — a plain <link> in the
// HTML — and that is the entire theming mechanism. It replaced a dynamic
// `import('./<slug>.lab')` for a reason worth keeping on record: Next's dev
// server does not inject global CSS from a dynamically imported client chunk.
// The import RESOLVES — so a readiness gate keyed on it opens — and no
// stylesheet ever arrives, which meant every theme in the lab silently rendered
// as the default one, and a cross-theme test sweep passed while measuring one
// theme thirteen times. A server-rendered <link> cannot half-work like that:
// either the sheet is in the document or the request 404s, and the sweep now
// asserts the sheet it expects is the one that loaded.
//
// Precompiling also styles the SCRIPTS-OFF frame in every theme, not just the
// default — a <link> needs no hydration — which turned the lab's old "only the
// default theme is styled with scripts off" caveat from a documented limit into
// a deleted one.
const labCss = (slug) =>
  [
    '/* generated by scripts/gen-components.mjs — do not edit */',
    `@import "../../kits/${slug}/src/globals.css";`,
    // The catalog lives outside the demo root, so Tailwind cannot find it on
    // its own. Missing this renders every component unstyled.
    '@source "../../components";',
    '@source "../../kits/_base/src";',
    '',
  ].join('\n');

const PUBLIC_THEMES = resolve(DEMO, 'public', 'lab-themes');
await mkdir(PUBLIC_THEMES, { recursive: true });

/** Newest mtime under the trees a theme's CSS is compiled from. */
async function newestMtime(roots) {
  let newest = 0;
  const walk = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await walk(path);
      else newest = Math.max(newest, (await stat(path)).mtimeMs);
    }
  };
  for (const root of roots) if (existsSync(root)) await walk(root);
  return newest;
}

const tailwind = resolve(DEMO, 'node_modules', '.bin', 'tailwindcss');
const sourcesChanged = await newestMtime([COMPONENTS, KITS]);
let compiled = 0;
for (const slug of kitSlugs) {
  await writeFile(resolve(OUT, `${slug}.lab.css`), labCss(slug));
  const out = resolve(PUBLIC_THEMES, `${slug}.css`);
  // Skip untouched themes: thirteen Tailwind runs on every dev start is the
  // kind of tax that gets a generator deleted.
  if (existsSync(out) && (await stat(out)).mtimeMs > sourcesChanged) continue;
  execFileSync(tailwind, ['-i', resolve(OUT, `${slug}.lab.css`), '-o', out, '--minify'], {
    cwd: DEMO,
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  compiled += 1;
}

await writeFile(
  resolve(OUT, 'themes.ts'),
  [
    '// generated by scripts/gen-components.mjs — do not edit',
    '//',
    '// Theme CSS is precompiled to public/lab-themes/<slug>.css and linked',
    '// server-side by the frame — every theme is styled with scripts off, and',
    '// nothing about theming needs hydration. See gen-components.mjs for why a',
    '// dynamic import cannot do this job.',
    `export const defaultTheme = ${JSON.stringify(defaultTheme ?? '')};`,
    '',
    `export const themes: string[] = ${JSON.stringify(kitSlugs)};`,
    '',
    'export function themeHref(slug: string): string {',
    '  return `/lab-themes/${slug}.css`;',
    '}',
    '',
  ].join('\n'),
);

console.log(
  `gen-components: ${manifests.length} component(s), ${kitSlugs.length} theme(s) (${compiled} recompiled), default "${defaultTheme ?? 'none'}"`,
);

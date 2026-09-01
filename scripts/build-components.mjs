#!/usr/bin/env node
// Contract check for the advanced-components catalog: assemble a kit workspace,
// copy EVERY catalog component in exactly the way an agent performs the
// copy-in — everything but component.json into src/components/, plus one
// barrel line — then run the real toolchain and assert each component
// surfaced in design.json.
//
// Green here ≈ "every catalog component drops into a workspace and builds".
//
// It builds against MORE THAN ONE KIT, and the second kit is the point. Each kit
// SHADOWS `src/components/index.ts` with its own catalog, so the barrel a
// component is appended to is different in every workspace: blank exports the
// _base Button and nothing else, finance exports Badge, Card and Stat as well. A
// component that collides with a kit's own primitive, or leans on something only
// blank happens to provide, builds perfectly in blank and fails the moment a
// customer picks a different system. One extra workspace turns that from a
// support ticket into a red CI run.
//
// Worth being precise about what this does NOT catch: a hardcoded radius or
// colour still BUILDS. It is wrong to look at, not wrong to compile. That one is
// the component lab's theme switcher, by eye, across all thirteen kits.
//
// It also refuses a component whose manifest says `hydrate: false` while its
// source reaches for a hook — see `checkStatic`.
//
// Usage:
//   node scripts/build-components.mjs              # blank + finance
//   node scripts/build-components.mjs saas deck    # blank + the named kits
//   node scripts/build-components.mjs --all        # every kit (slow)

import { appendFile, cp, mkdir, readdir, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const KITS_SRC = resolve(ROOT, 'kits');
const COMPONENTS_SRC = resolve(ROOT, 'components');

// `blank` is the fallback every consumer has, so it is never optional. `finance`
// is the second because it has the richest catalog of its own (Badge, Card,
// Stat) — the most surface for a copied component to collide with.
const ALWAYS = 'blank';
const DEFAULT_SECOND = 'finance';

// Mirror build-kit.mjs: never carry local artifacts or metadata files.
const SKIP = new Set(['node_modules', 'dist', 'dist-ssr', '.DS_Store', 'kit.json', '.gitkeep', 'component.json']);
// `skeleton.*.tsx` files are SECTION sources for the agent to copy and reshape
// (components/AGENTS.md) — they import `@/components/*` as a section would, so
// copying them into src/components/ would both fail the workspace typecheck's
// alias resolution expectations and surface them in the extractor's catalog as
// components, which they are not.
const filter = (src) => {
  const name = src.split('/').at(-1);
  return !SKIP.has(name) && !name.startsWith('skeleton.');
};

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

const allKits = (await readdir(KITS_SRC, { withFileTypes: true }))
  .filter((e) => e.isDirectory() && e.name !== '_base')
  .map((e) => e.name)
  .sort();

const args = process.argv.slice(2);
const requested = args.includes('--all')
  ? allKits
  : [ALWAYS, ...(args.filter((a) => !a.startsWith('--')).length ? args.filter((a) => !a.startsWith('--')) : [DEFAULT_SECOND])];
const kits = [...new Set(requested)].filter((slug) => {
  if (allKits.includes(slug)) return true;
  console.error(`build-components: no kit named "${slug}"`);
  process.exitCode = 1;
  return false;
});
if (kits.length === 0) process.exit(1);

/**
 * The manifest's own shape, checked before anything is built.
 *
 * `implements` is the one field a consumer reads to build its "copy this instead
 * of writing it" table, so a typo in it does not break a build — it silently
 * drops a behaviour out of the table and the agent goes back to writing the
 * mechanics from prose, which is the exact failure this catalog exists to
 * remove. Cheap to check here, invisible everywhere else.
 */
function checkManifest(name, manifest) {
  const problems = [];
  for (const field of ['name', 'description', 'whenToUse']) {
    if (typeof manifest[field] !== 'string' || !manifest[field]) {
      problems.push(`${field} must be a non-empty string`);
    }
  }
  if (typeof manifest.hydrate !== 'boolean') problems.push('hydrate must be true or false');
  if (manifest.implements !== undefined) {
    if (!Array.isArray(manifest.implements)) {
      problems.push('implements must be an array');
    } else {
      for (const [i, entry] of manifest.implements.entries()) {
        if (typeof entry === 'string') continue;
        if (!entry || typeof entry !== 'object') {
          problems.push(`implements[${i}] must be a string or { token, props?, note? }`);
          continue;
        }
        if (typeof entry.token !== 'string' || !entry.token) {
          problems.push(`implements[${i}].token must be a non-empty string`);
        }
        if (entry.props !== undefined && (typeof entry.props !== 'object' || entry.props === null)) {
          problems.push(`implements[${i}].props must be an object`);
        }
        if (entry.note !== undefined && typeof entry.note !== 'string') {
          problems.push(`implements[${i}].note must be a string`);
        }
      }
    }
  }
  return problems.map((p) => `${name}: ${p}`);
}

/** The hooks that turn a static component into one the host has to hydrate. */
const HOOKS = [
  'useState',
  'useReducer',
  'useEffect',
  'useLayoutEffect',
  'useInsertionEffect',
  'useRef',
  'useId',
  'useMemo',
  'useCallback',
  'useSyncExternalStore',
  'useTransition',
  'useOptimistic',
  'useActionState',
];

/**
 * Packages that are fine in general and not in a static component, because
 * importing them creates a client boundary of their own.
 *
 * `lucide-react` is the one that bites: every icon renders through its `Icon`,
 * which is `'use client'` and reads a context, so a static component importing a
 * cross ships a runtime for the cross. Nothing catches it — the component has no
 * hooks and no `'use client'` of its own, so the AST inference says static and it
 * is not. Inline the SVG instead; `Modal` has the shape to copy.
 */
const CLIENT_ONLY_IMPORTS = [{ pkg: 'lucide-react', why: 'every icon renders through a "use client" Icon' }];

/**
 * Packages that no longer exist in the workspace at all. `tsc` would fail the
 * build anyway — this exists to fail it with the reason and the replacement
 * instead of a module-not-found trace.
 */
const REMOVED_IMPORTS = [
  {
    pattern: /from\s+['"]motion(?:\/|['"])/,
    message:
      'imports the motion library, which left the substrate when entrance animation went ' +
      'CSS scroll-driven (#30) — use the motion.css classes via @/motion, or @/lib/count-up',
  },
];

/**
 * A component claiming `hydrate: false` must not reach for a hook.
 *
 * This is the check with the widest blast radius in the whole catalog, because
 * the failure it catches is completely silent. A `hydrate: false` component
 * renders as a Server Component in a consumer's workspace; add a `useState` to it
 * and either the render throws in a place nobody is looking, or the host marks
 * the file as client and every section using it starts shipping a runtime. Either
 * way the component still looks right in the lab, which renders inside a client
 * boundary and hides the whole problem.
 *
 * Comment lines are skipped rather than the source being stripped: these files
 * discuss the hooks they are deliberately not using ("not `useId`: this component
 * is static"), and a check that trips on its own rationale gets deleted.
 */
function checkStatic(name, source) {
  const problems = [];
  const lines = source.split('\n');
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
    if (/^\s*['"]use client['"]/.test(line)) {
      problems.push(`${name}:${i + 1} declares 'use client' but component.json says hydrate: false`);
    }
    for (const hook of HOOKS) {
      if (new RegExp(`\\b${hook}\\s*\\(`).test(line)) {
        problems.push(
          `${name}:${i + 1} calls ${hook}() but component.json says hydrate: false — ` +
            'either the manifest is wrong or the behaviour belongs to the platform',
        );
      }
    }
    for (const { pkg, why } of CLIENT_ONLY_IMPORTS) {
      if (new RegExp(`from\\s+['"]${pkg}['"]`).test(line)) {
        problems.push(
          `${name}:${i + 1} imports ${pkg} but component.json says hydrate: false — ` +
            `${why}, so this ships a runtime to a component whose point is not shipping one`,
        );
      }
    }
  });
  return problems;
}

// ── the source pass, before anything is assembled ────────────────────
const problems = [];
for (const name of names) {
  const manifestPath = resolve(COMPONENTS_SRC, name, 'component.json');
  if (!existsSync(manifestPath)) {
    problems.push(`${name}: no component.json`);
    continue;
  }
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  problems.push(...checkManifest(name, manifest));

  const file = resolve(COMPONENTS_SRC, name, `${name}.tsx`);
  if (!existsSync(file)) {
    problems.push(`${name}: no ${name}.tsx`);
    continue;
  }
  const source = await readFile(file, 'utf8');
  if (manifest.hydrate === false) {
    problems.push(...checkStatic(name, source));
  }
  source.split('\n').forEach((line, i) => {
    for (const { pattern, message } of REMOVED_IMPORTS) {
      if (pattern.test(line)) problems.push(`${name}:${i + 1} ${message}`);
    }
  });
}
if (problems.length > 0) {
  console.error(`build-components: ${problems.length} contract problem(s)\n`);
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  process.exit(1);
}
console.log(`build-components: ${names.length} manifest(s) + static claims ✓`);

// ── one real workspace build per kit ─────────────────────────────────
for (const slug of kits) {
  const work = resolve(ROOT, '.build', `_components-${slug}`);
  await rm(work, { recursive: true, force: true });
  await mkdir(work, { recursive: true });

  // The workspace: base ∪ kit, exactly as build-kit.mjs assembles it.
  await cp(resolve(KITS_SRC, '_base'), work, { recursive: true, filter });
  await cp(resolve(KITS_SRC, slug), work, { recursive: true, force: true, filter });

  // The extractor is not part of _base any more (CONTRACT.md → "The toolchain
  // travels"): whoever compiles a workspace stages their own copy. This repo's
  // lives in scripts/extractor/, and staging it here is exactly what
  // build-kit.mjs does — the CI check builds the way a real consumer does.
  await mkdir(resolve(work, 'scripts/lib'), { recursive: true });
  for (const rel of ['extract-design.mjs', 'lib/tokens.mjs', 'lib/ts.mjs']) {
    await cp(resolve(ROOT, 'scripts/extractor', rel), resolve(work, 'scripts', rel));
  }

  // The copy-in, per components/AGENTS.md: everything but component.json into
  // src/components/, one barrel line per component. The barrel here is the KIT's
  // own, which is the whole reason for building more than once.
  for (const name of names) {
    await cp(resolve(COMPONENTS_SRC, name), resolve(work, 'src/components'), {
      recursive: true,
      force: true,
      filter,
    });
    await appendFile(resolve(work, 'src/components/index.ts'), `export * from './${name}';\n`);
  }

  console.log(`\nbuild-components: ${slug} — bun install && bun run build`);
  execFileSync('bun', ['install'], { cwd: work, stdio: 'inherit' });
  execFileSync('bun', ['run', 'build'], { cwd: work, stdio: 'inherit' });

  // The build passing isn't enough — each component must also have made it into
  // the machine-readable catalog (design.json.components).
  const design = JSON.parse(await readFile(resolve(work, 'design.json'), 'utf8'));
  const surfaced = new Map((design.components ?? []).map((c) => [c.name, c]));
  const missing = names.filter((n) => !surfaced.has(n));
  if (missing.length > 0) {
    console.error(
      `build-components: ${slug} built, but missing from design.json.components: ${missing.join(', ')}`,
    );
    process.exit(1);
  }

  // `hydrate` in the manifest against `hydrate` as the extractor INFERRED it from
  // the AST. This is the authoritative version of the static-claim check: the
  // regex pass above reads the source and guesses, this one is the same analysis
  // the consumer's own build runs, so a disagreement means the manifest is lying
  // about the one field that decides whether a page ships a runtime.
  const lies = [];
  for (const name of names) {
    const manifest = JSON.parse(await readFile(resolve(COMPONENTS_SRC, name, 'component.json'), 'utf8'));
    const inferred = surfaced.get(name)?.hydrate ?? false;
    if (Boolean(manifest.hydrate) !== inferred) {
      lies.push(
        `${name}: component.json says hydrate: ${Boolean(manifest.hydrate)}, ` +
          `the extractor infers ${inferred}`,
      );
    }
  }
  if (lies.length > 0) {
    console.error(`build-components: ${slug} — manifest disagrees with the build\n`);
    for (const lie of lies) console.error(`  ✗ ${lie}`);
    process.exit(1);
  }
  console.log(`build-components: ${slug} — ${names.length} component(s) built + surfaced ✓ (${work})`);
}

console.log(`\nbuild-components: ${names.length} component(s) × ${kits.length} kit(s) ✓ — ${kits.join(', ')}`);

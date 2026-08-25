#!/usr/bin/env node
// Regenerate design.json from source. Runs first in the build (`gen:design`
// → `tsc --noEmit` → `node scripts/build.mjs`). design.json is the host's
// API surface; the sources below are the authoring surface.
//
//   README.md                    → name, description, composition rationale
//   src/globals.css              → tokens (:root + .dark custom properties)
//   src/sections/index.ts        → section order (export order = chain order)
//   src/sections/<X>.tsx
//     JSDoc on <X>Props          → section description
//     interface <X>Props         → section props
//     JSDoc on each prop         → prop description ("@kind url|image|richtext"
//                                  overrides; richtext takes a feature list)
//     export const <X>Demo       → demo entry for that section
//
// Authoring edits those files; this script produces design.json. Never
// edit design.json by hand — it's regenerated on every build.
//
// README parsing:
//   - First H1                   → name
//   - Lines between H1 and the next H2 → description
//   - Body of "## Composition"   → rationale (whole block). The chain
//                                  itself is derived from index.ts.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { API, SignatureKind, SymbolFlags, TypeFlags } from 'typescript/unstable/async';
import {
  formatSyntaxKind,
  isArrayLiteralExpression,
  isArrowFunction,
  isAsExpression,
  isCallExpression,
  isExportDeclaration,
  isExpressionStatement,
  isFunctionDeclaration,
  isFunctionExpression,
  isIdentifier,
  isImportDeclaration,
  isJsxAttribute,
  isJsxExpression,
  isNoSubstitutionTemplateLiteral,
  isNumericLiteral,
  isObjectLiteralExpression,
  isParenthesizedExpression,
  isPrefixUnaryExpression,
  isPropertyAccessExpression,
  isPropertyAssignment,
  isStringLiteral,
  isTypeAssertion,
  isUnionTypeNode,
  isVariableDeclaration,
  isVariableStatement,
  SyntaxKind,
} from 'typescript/unstable/ast';

import { collectTokensFromCss } from './lib/tokens.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TSCONFIG = resolve(ROOT, 'tsconfig.json');
const SECTIONS_INDEX = resolve(ROOT, 'src/sections/index.ts');
const COMPONENTS_INDEX = resolve(ROOT, 'src/components/index.ts');
const README = resolve(ROOT, 'README.md');
const GLOBALS_CSS = resolve(ROOT, 'src/globals.css');
const DESIGN_JSON = resolve(ROOT, 'design.json');

const SPECIALIZED_STRING_KINDS = new Set(['url', 'image', 'richtext']);

// TypeScript 7 is the native compiler, so its JS surface is a CLIENT for a
// compiler running out of process: every checker lookup below is a round trip,
// hence the awaits, and the run owns a server handle that has to be released
// or `gen:design` never exits.
//
// This is the async client on purpose. The sync one reaches for a raw fd on
// the child's stdout (`stdout._handle`), which Node exposes and Bun does not —
// and the toolchain contract is `bun install && bun run build`.
async function main() {
  const api = new API({ cwd: ROOT });
  try {
    await run(api);
  } finally {
    await api.close();
  }
}

/** The project every AST/type lookup below is resolved against. Set once, in
 *  `run()` — symbols hand back node HANDLES rather than nodes, and a handle
 *  only means something inside the project that produced it. */
let project = null;

/** Resolve a declaration handle (`symbol.valueDeclaration`, `declarations[i]`)
 *  to its AST node. */
async function nodeOf(handle) {
  return handle ? ((await handle.resolve(project)) ?? null) : null;
}

async function run(api) {
  // The workspace tsconfig IS the configuration — same `jsx`, `paths`, and
  // `strict` the kit's own `tsc --noEmit` gate uses, so the catalog can't be
  // extracted under options the kit never compiles with. Both barrels sit
  // under its `include: ["src"]`.
  const snapshot = await api.updateSnapshot({ openProjects: [TSCONFIG] });
  project = await snapshot.getProject(TSCONFIG);
  if (!project) throw new Error(`could not load ${TSCONFIG}`);
  const { checker, program } = project;

  const indexSource = await program.getSourceFile(SECTIONS_INDEX);
  if (!indexSource) throw new Error(`could not load ${SECTIONS_INDEX}`);

  const sections = await collectSections(indexSource, checker, program);
  if (sections.length === 0) {
    // A kit MAY ship zero sections — the `blank` bare-canvas kit, whose
    // sections the architect authors from scratch on the first run. Emit an
    // empty catalog instead of failing. A content kit that empties its barrel
    // by mistake still surfaces loudly as "0 sections" in the log below.
    console.warn(
      'extract-design: no sections exported from src/sections/index.ts — ' +
        'emitting an empty catalog (bare-canvas kit).',
    );
  }

  const readmeInfo = parseReadme();
  const demo = await collectDemo(sections, program);
  const chain = sections.map((s) => s.name).join(' → ');
  const tokens = collectTokens();
  const components = await collectComponents(program, checker);

  // The flat, authoritative index of every export that needs client JS —
  // sections and components together, names only.
  //
  // This is what a HOST should read. The per-entry `hydrate` flags below stay
  // for authoring/debugging visibility, but a consumer must not walk the two
  // barrels itself: a publish step that MOVES a named export from `sections`
  // into `components`, flag and all, makes "look it up in sections" lose the
  // flag — and a lost flag publishes an interactive page as dead HTML. A list
  // of names is invariant under that move.
  const hydrateSections = [...sections, ...components]
    .filter((s) => s.hydrate)
    .map((s) => s.name);

  const designJson = {
    name: readmeInfo.name,
    description: readmeInfo.description,
    sections: sections.map(({ name, description, props, hydrate }) => ({
      name,
      description,
      props,
      // Authoring-visible detail; `hydrateSections` above is the contract.
      ...(hydrate ? { hydrate: true } : {}),
    })),
    recommendedOrder: { chain, rationale: readmeInfo.compositionRationale },
    demo,
    // Always emitted (empty array included) so a host can tell "this bundle
    // declares its hydration needs, and none" apart from "this bundle predates
    // the field" — the latter has to fall back to the per-entry flags.
    hydrateSections,
    // Optional: the reusable-component catalog (Button, …) from
    // src/components/index.ts. Present only when the kit exports components, so
    // section-only kits are unchanged. Mirrors the @kopla/types
    // ComponentDefinition contract the editor's component canvas consumes.
    ...(components.length > 0 ? { components } : {}),
    // Optional: present only when globals.css yields a `:root` token block.
    // Mirrors the kit's CSS custom properties so the host / future theming
    // can read tokens without re-parsing CSS.
    ...(tokens ? { tokens } : {}),
  };

  writeFileSync(DESIGN_JSON, JSON.stringify(designJson, null, 2) + '\n');
  const tokenNote = tokens
    ? `, ${Object.keys(tokens.base).length} token${
        Object.keys(tokens.base).length === 1 ? '' : 's'
      }${tokens.dark ? ' (+dark)' : ''}`
    : '';
  const componentNote = components.length
    ? `, ${components.length} component${components.length === 1 ? '' : 's'} (${components
        .map((c) => c.name)
        .join(', ')})`
    : '';
  // Name the hydration set explicitly: it decides whether published pages ship
  // JavaScript, and it's the one thing here with no visible symptom when wrong.
  const hydrateNote = hydrateSections.length
    ? `, needs client JS: ${hydrateSections.join(', ')}`
    : ', needs client JS: none (every page publishes as static HTML)';
  console.log(
    `extract-design: ${sections.length} section${sections.length === 1 ? '' : 's'} ` +
      `(${sections.map((s) => s.name).join(', ')}), ${demo.length} demo entr${demo.length === 1 ? 'y' : 'ies'}${componentNote}${tokenNote}${hydrateNote}`,
  );
}

// ── Tokens ────────────────────────────────────────────────────────────
// Token parsing lives in lib/tokens.mjs so pack-time consumers (kit
// manifests) and this in-workspace extractor stay byte-for-byte agreed
// on what a kit declares. See that module for the base/dark semantics.

function collectTokens() {
  let css;
  try {
    css = readFileSync(GLOBALS_CSS, 'utf8');
  } catch {
    return null;
  }
  return collectTokensFromCss(css);
}

// ── Barrel order ──────────────────────────────────────────────────────

/** A barrel's exports, ordered by the `export * from '…'` line that pulled each
 *  one in.
 *
 *  Both catalogs are ordered documents — the sections barrel's line order IS
 *  the recommended composition chain, and the components barrel's is catalog
 *  order — but `getExportsOfModule` returns a symbol TABLE, whose order is the
 *  compiler's business and not the file's. So rank each export by its
 *  re-export line, then by where it sits in the file that line names. */
async function exportsInBarrelOrder(indexSource, moduleSymbol, checker) {
  const lineOfFile = new Map();
  let line = 0;
  for (const statement of indexSource.statements) {
    if (!isExportDeclaration(statement) || !statement.moduleSpecifier) continue;
    if (!isStringLiteral(statement.moduleSpecifier)) continue;
    const target = await checker.getSymbolAtLocation(statement.moduleSpecifier);
    for (const d of target?.declarations ?? []) {
      if (d.kind === SyntaxKind.SourceFile && !lineOfFile.has(d.path)) {
        lineOfFile.set(d.path, line);
      }
    }
    line += 1;
  }

  const keyed = [];
  for (const exp of await checker.getExportsOfModule(moduleSymbol)) {
    let target = exp;
    if (target.flags & SymbolFlags.Alias) target = await checker.getAliasedSymbol(target);
    const decl = target.valueDeclaration ?? target.declarations?.[0];
    keyed.push({
      exp,
      // Anything the barrel declares itself, or re-exports from a file no line
      // names, sorts after the lines — it has no place in the stated order.
      line: (decl && lineOfFile.get(decl.path)) ?? line,
      // Handle indices run in parse order, so this is source order within a file.
      index: decl?.index ?? 0,
      seen: keyed.length,
    });
  }
  keyed.sort((a, b) => a.line - b.line || a.index - b.index || a.seen - b.seen);
  return keyed.map((k) => k.exp);
}

// ── Sections ──────────────────────────────────────────────────────────

async function collectSections(indexSource, checker, program) {
  const moduleSymbol = await checker.getSymbolAtLocation(indexSource);
  if (!moduleSymbol) return [];
  const exports = await exportsInBarrelOrder(indexSource, moduleSymbol, checker);

  const sections = [];
  for (const exp of exports) {
    if (!/^[A-Z]/.test(exp.name)) continue;
    // Skip *Demo exports — they're consumed by collectDemo, not as sections.
    if (exp.name.endsWith('Demo')) continue;

    let target = exp;
    if (target.flags & SymbolFlags.Alias) target = await checker.getAliasedSymbol(target);
    const decl = await nodeOf(target.valueDeclaration ?? target.declarations?.[0]);
    if (!decl) continue;
    const signatureNode = resolveSignatureNode(decl);
    if (!signatureNode || signatureNode.parameters.length === 0) continue;

    const propsType = await resolvePropsTypeAtSignature(signatureNode, checker);
    if (!propsType) {
      throw new Error(
        `could not resolve props type for section '${exp.name}'. ` +
          `Sections must be React components with a typed props parameter.`,
      );
    }
    const description = (await readPropsInterfaceJSDoc(propsType, checker)) ?? '';
    const props = await propsTypeToSchema(propsType, checker);
    // A section needs client JS in production (→ `hydrate: true`) if it opts
    // in via a `@hydrate` JSDoc tag on its Props, or if it (or anything it
    // imports in-workspace) uses React state/effects, a JSX event handler, or
    // an animation lib. Otherwise it ships as static
    // HTML. The production builder reads this to decide per-page.
    const hydrate = await sectionNeedsHydration(decl, propsType, checker);
    sections.push({ name: exp.name, description, props, ...(hydrate ? { hydrate: true } : {}) });
  }
  // Order comes from src/sections/index.ts (see `exportsInBarrelOrder`) —
  // that order is the recommended composition chain.
  return sections;
}

// ── Components ────────────────────────────────────────────────────────
// The reusable-primitive catalog (Button, Card, …), read from
// `src/components/index.ts` — the sibling of the sections barrel. Mirrors
// `collectSections` (typed `*Props` → schema, JSDoc → description) but emits
// the @kopla/types ComponentDefinition shape: enum props become variant `axes`
// for the editor's component canvas, a sibling `<Name>Showcase` literal seeds
// `showcase`, and `origin` is always `generated` (kits author their own; Figma
// provenance only exists in agent runs). Components live in their own barrel,
// so the section list + composition chain are untouched.

async function collectComponents(program, checker) {
  const indexSource = await program.getSourceFile(COMPONENTS_INDEX);
  if (!indexSource) return [];
  const moduleSymbol = await checker.getSymbolAtLocation(indexSource);
  if (!moduleSymbol) return [];
  const exports = await exportsInBarrelOrder(indexSource, moduleSymbol, checker);

  const components = [];
  for (const exp of exports) {
    if (!/^[A-Z]/.test(exp.name)) continue;
    // *Showcase feeds `showcase`; *Demo/*Props aren't components themselves.
    if (exp.name.endsWith('Showcase') || exp.name.endsWith('Demo') || exp.name.endsWith('Props')) {
      continue;
    }

    let target = exp;
    if (target.flags & SymbolFlags.Alias) target = await checker.getAliasedSymbol(target);
    const decl = await nodeOf(target.valueDeclaration ?? target.declarations?.[0]);
    if (!decl) continue;
    const signatureNode = resolveSignatureNode(decl);
    if (!signatureNode || signatureNode.parameters.length === 0) continue;
    // The barrel can also re-export styling helpers (e.g. cva `buttonVariants`)
    // — keep only functions that actually render React content.
    if (!(await signatureReturnsReactContent(signatureNode, checker))) continue;

    const propsType = await resolvePropsTypeAtSignature(signatureNode, checker);
    if (!propsType) continue;
    const description = (await readPropsInterfaceJSDoc(propsType, checker)) ?? '';
    const props = await propsTypeToSchema(propsType, checker);
    const hydrate = await sectionNeedsHydration(decl, propsType, checker);
    const axes = deriveAxesFromProps(props);
    const showcase = collectComponentShowcase(decl, exp.name);
    components.push({
      name: exp.name,
      description,
      props,
      origin: { kind: 'generated' },
      ...(axes.length > 0 ? { axes } : {}),
      ...(showcase.length > 0 ? { showcase } : {}),
      ...(hydrate ? { hydrate: true } : {}),
    });
  }
  return components;
}

/** Does this function's return type render React content (JSX), as opposed to a
 *  cva/util helper that returns a string/object? */
async function signatureReturnsReactContent(signatureNode, checker) {
  const sig = await checker.getSignatureFromDeclaration(signatureNode);
  if (!sig) return false;
  const ret = await checker.getReturnTypeOfSignature(sig);
  if (!ret) return false;
  if (await isReactContentType(ret)) return true;
  // Inferred JSX / `Element | null` unions read cleanest off the string form.
  return /\b(?:JSX\.Element|ReactElement|ReactNode|Element)\b/.test(await checker.typeToString(ret));
}

/** Each enum prop (optionally wrapped nullable when the prop is `?:`) becomes a
 *  variant axis the component canvas lays out. */
function deriveAxesFromProps(props) {
  const axes = [];
  for (const [name, type] of Object.entries(props ?? {})) {
    const t = type && type.kind === 'nullable' ? type.of : type;
    if (t && t.kind === 'enum' && Array.isArray(t.values) && t.values.length > 0) {
      axes.push({ name, values: t.values });
    }
  }
  return axes;
}

/** Read a component's sibling `<Name>Showcase` export — an array of
 *  `{ props, label? }` static literals — into ComponentInstance[]. The analogue
 *  of `collectDemo` for sections; reads the same source file the component is
 *  declared in. */
function collectComponentShowcase(decl, name) {
  const sourceFile = decl.getSourceFile();
  if (!sourceFile) return [];
  const initializer = findExportedConstInitializer(sourceFile, `${name}Showcase`);
  if (!initializer || !isArrayLiteralExpression(initializer)) return [];
  const out = [];
  for (const elem of initializer.elements) {
    if (!isObjectLiteralExpression(elem)) continue;
    // Showcase entries are static data (like a section's *Demo). A non-literal
    // value — e.g. a JSX node passed to a `children` slot — can't be serialized;
    // skip it with a warning rather than failing the whole build.
    let value;
    try {
      value = literalToValue(elem);
    } catch {
      console.warn(
        `extract-design: ${name}Showcase entry is not a static literal — skipping it. ` +
          `Showcase props must be plain data (no JSX/identifiers/calls).`,
      );
      continue;
    }
    if (value && typeof value === 'object' && 'props' in value) out.push(value);
  }
  return out;
}

function resolveSignatureNode(decl) {
  if (
    isFunctionDeclaration(decl) ||
    isFunctionExpression(decl) ||
    isArrowFunction(decl)
  ) {
    return decl;
  }
  if (isVariableDeclaration(decl) && decl.initializer) {
    if (
      isArrowFunction(decl.initializer) ||
      isFunctionExpression(decl.initializer)
    ) {
      return decl.initializer;
    }
  }
  return null;
}

async function resolvePropsTypeAtSignature(signatureNode, checker) {
  const param = signatureNode.parameters[0];
  const paramSymbol = await checker.getSymbolAtLocation(param.name);
  if (paramSymbol) return checker.getTypeOfSymbolAtLocation(paramSymbol, signatureNode);
  return checker.getTypeAtLocation(param);
}

// React hooks whose whole point is to change something after the first paint.
// A component calling one of these cannot work as static HTML.
const STATEFUL_HOOKS = new Set([
  'useState',
  'useReducer',
  'useEffect',
  'useLayoutEffect',
  'useSyncExternalStore',
  'useTransition',
  'useOptimistic',
]);

/** JS animation packages. The substrate's own wrappers (`@/motion`) are NOT
 *  on this list: they are pure CSS (scroll-driven animations, see
 *  `src/motion/motion.css`), so importing them says nothing about needing
 *  client JS. Only a real animation library — one that drives the DOM from
 *  JavaScript — pulls a section into the hydration set. */
function isClientLibSpecifier(text) {
  return (
    text === 'motion' ||
    text.startsWith('motion/') ||
    text === 'framer-motion' ||
    text.startsWith('framer-motion/')
  );
}

/** Does this component need client JS in production? True if its Props JSDoc
 *  carries an explicit `@hydrate` tag, or if it — or anything it imports from
 *  within the workspace — shows evidence of needing the browser.
 *
 *  Detection is deliberately GENEROUS. A false positive costs the published
 *  page one JS bundle it didn't need; a false negative publishes a DEAD page —
 *  an accordion frozen on its initial state, a carousel whose arrows do
 *  nothing — and nothing catches it, because SSR captures the initial state
 *  (so the page looks right) and preview surfaces typically mount the real
 *  components client-side and never read this flag. Visible only live.
 *
 *  Note the asymmetry with the authoring guidance: sections SHOULD prefer
 *  native primitives (`<details name>`, `popover`, scroll-snap) precisely so
 *  this returns false and the page ships static. */
async function sectionNeedsHydration(componentDecl, propsType, checker) {
  // Explicit opt-in via @hydrate on the Props interface always wins.
  const symbol = (await propsType.getAliasSymbol()) ?? (await propsType.getSymbol());
  if (symbol && /@hydrate\b/.test(await checker.getDocumentationCommentOfSymbol(symbol))) {
    return true;
  }
  const sourceFile = componentDecl.getSourceFile();
  if (!sourceFile) return false;
  return await fileNeedsHydration(sourceFile, checker, new Set());
}

/** Client-JS evidence in this file, or transitively in any workspace file it
 *  imports. The walk matters because interactivity increasingly lives in a
 *  `src/components/` primitive: a section that just renders `<Accordion>` has
 *  no hooks and no handlers of its own, so judging the section file alone
 *  called the whole page static and shipped it dead.
 *
 *  Only workspace sources are followed — a `node_modules` .d.ts carries no
 *  implementation to inspect, and the packages that matter are recognised by
 *  specifier instead. `seen` guards import cycles. */
async function fileNeedsHydration(sourceFile, checker, seen) {
  if (seen.has(sourceFile.fileName)) return false;
  seen.add(sourceFile.fileName);

  // `'use client'` as a real directive prologue, not a stray string anywhere.
  const [first] = sourceFile.statements;
  if (
    first &&
    isExpressionStatement(first) &&
    isStringLiteral(first.expression) &&
    first.expression.text === 'use client'
  ) {
    return true;
  }

  const imported = [];
  let found = false;
  const visit = (node) => {
    if (found) return;

    // An import of an animation lib, or a workspace module to recurse into.
    // Read off the AST (not the source text) so a specifier inside a comment
    // or an unrelated string can't trigger it.
    if (
      (isImportDeclaration(node) || isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      isStringLiteral(node.moduleSpecifier)
    ) {
      if (isClientLibSpecifier(node.moduleSpecifier.text)) {
        found = true;
        return;
      }
      imported.push(node.moduleSpecifier);
    }

    // A stateful hook CALL — `useState(…)`. The callee may be bare or
    // qualified (`React.useState`). A mere mention in a comment, a string, or
    // a type position is not a call, so none of those match.
    if (isCallExpression(node)) {
      const callee = node.expression;
      const name = isIdentifier(callee)
        ? callee.text
        : isPropertyAccessExpression(callee) && isIdentifier(callee.name)
          ? callee.name.text
          : null;
      if (name && STATEFUL_HOOKS.has(name)) {
        found = true;
        return;
      }
    }

    // A JSX event handler being PASSED — `onClick={…}`. Declaring
    // `onClick?: () => void` in a Props interface is a PropertySignature, not
    // a JsxAttribute, so it correctly says nothing about this file.
    if (
      isJsxAttribute(node) &&
      isIdentifier(node.name) &&
      /^on[A-Z]/.test(node.name.text) &&
      node.initializer &&
      isJsxExpression(node.initializer)
    ) {
      found = true;
      return;
    }

    node.forEachChild(visit);
  };
  visit(sourceFile);
  if (found) return true;

  for (const specifier of imported) {
    // Resolve through the checker rather than the raw path so tsconfig `@/*`
    // aliases and extensionless relative imports both land.
    const moduleSymbol = await checker.getSymbolAtLocation(specifier);
    for (const handle of moduleSymbol?.declarations ?? []) {
      // A handle carries its kind and file path, so both cheap rejections
      // happen before the node itself is materialized.
      if (handle.kind !== SyntaxKind.SourceFile) continue;
      if (handle.path.includes('node_modules')) continue;
      const decl = await nodeOf(handle);
      if (!decl || decl.isDeclarationFile) continue;
      if (await fileNeedsHydration(decl, checker, seen)) return true;
    }
  }
  return false;
}

async function readPropsInterfaceJSDoc(propsType, checker) {
  // Use the type's own symbol (the interface or type alias declaration).
  const symbol = (await propsType.getAliasSymbol()) ?? (await propsType.getSymbol());
  if (!symbol) return null;
  return (await checker.getDocumentationCommentOfSymbol(symbol)).trim() || null;
}

// ── Type → PropType ───────────────────────────────────────────────────

// Bounded type-walk guards. The walker below turns a section/component's props
// interface into the design.json schema. It used to recurse with no limit,
// which blew the call stack on real React prop types: a prop typed
// `React.ComponentProps<'button'>` drags in ~250 DOM/aria props (refs,
// handlers, `style: CSSProperties`), and `children: React.ReactNode` is a union
// that contains `Iterable<ReactNode>` → ReactNode → … (self-referential). We
// keep the authored, design-facing props and treat framework machinery as
// terminal: skip props inherited from library types (node_modules), collapse
// React content (ReactNode/ReactElement/JSX.Element) to `richtext`, skip
// function-typed props, and never recurse into library object types or past
// MAX_PROP_DEPTH.
const MAX_PROP_DEPTH = 8;
const REACT_CONTENT_NAMES = new Set([
  'ReactNode',
  'ReactElement',
  'ReactPortal',
  'ReactFragment',
  'Element',
]);

/** True for a type declared in node_modules (React/DOM lib) — framework
 *  machinery whose internals aren't authoring surface. Arrays/tuples are
 *  handled before this is consulted, so element types still extract. */
async function isLibraryType(type) {
  const sym = (await type.getAliasSymbol()) ?? (await type.getSymbol());
  for (const d of sym?.declarations ?? []) {
    if (d.path.includes('/node_modules/')) return true;
  }
  return false;
}

/** React render content (`ReactNode`, `ReactElement`, `JSX.Element`, …) — a
 *  rich-content slot, not structured data. Surface as richtext, stop recursing. */
async function isReactContentType(type) {
  const a = (await type.getAliasSymbol())?.name;
  const s = (await type.getSymbol())?.name;
  return Boolean((a && REACT_CONTENT_NAMES.has(a)) || (s && REACT_CONTENT_NAMES.has(s)));
}

/** A prop declared in node_modules is inherited framework surface (everything
 *  `extends React.ComponentProps<…>` pulls in), not an authored field. */
function isLibraryProp(prop) {
  const decl = prop.valueDeclaration ?? prop.declarations?.[0];
  return (decl?.path ?? '').includes('/node_modules/');
}

/** Function-typed prop (event handler, render prop) — not an authoring field. */
async function isFunctionType(type, checker) {
  return (await checker.getSignaturesOfType(type, SignatureKind.Call)).length > 0;
}

// ── Author order ──────────────────────────────────────────────────────
// design.json is an ORDERED document: the props object is the field order an
// editor renders, and an enum's first value reads as the primary one. The
// checker's own ordering is an implementation detail that has changed between
// compiler versions, so the two helpers below pin both to what the source
// says instead of inheriting whatever the compiler happens to hand back.

/** A type's authored properties, each paired with its declaration node: the
 *  type's own members first in source order, then inherited ones. Library
 *  props and props with no declaration are dropped here, so callers just
 *  iterate. */
async function declaredPropsInOrder(type, checker) {
  const own = new Set();
  const typeSymbol = (await type.getAliasSymbol()) ?? (await type.getSymbol());
  for (const d of typeSymbol?.declarations ?? []) {
    const node = await nodeOf(d);
    if (node) own.add(node);
  }

  const entries = [];
  for (const prop of await checker.getPropertiesOfType(type)) {
    if (isLibraryProp(prop)) continue;
    const decl = await nodeOf(prop.valueDeclaration ?? prop.declarations?.[0]);
    if (!decl) continue;
    // `own` holds the interface / type-literal nodes the type is declared by,
    // so a member declared directly in one of them is authored here and
    // anything else arrived through an `extends`.
    entries.push({ prop, decl, inherited: own.has(decl.parent) ? 0 : 1 });
  }
  // `pos` only orders members of the same declaration; ties across separate
  // inherited interfaces just fall out stable.
  entries.sort((a, b) => a.inherited - b.inherited || a.decl.pos - b.decl.pos);
  return entries;
}

/** A union's constituents in the order the source spells them out —
 *  `variant?: 'two-col' | 'three-col'` means what it says in the order it says
 *  it, and the first value is the one the component defaults to.
 *
 *  The spelling is either right there on the prop, or one hop away behind a
 *  type alias (`media?: MediaBlockProps`). Each written member is resolved back
 *  to a type and matched by identity, so this reorders and never invents:
 *  anything the two disagree about leaves `members` alone, as does a union
 *  with no written form at all (a cva/mapped type, say). */
async function unionInDeclaredOrder(members, typeNode, type, checker) {
  let written = typeNode && isUnionTypeNode(typeNode) ? typeNode : null;
  if (!written) {
    const aliasDecl = await nodeOf((await type.getAliasSymbol())?.declarations?.[0]);
    if (aliasDecl?.type && isUnionTypeNode(aliasDecl.type)) written = aliasDecl.type;
  }
  if (!written) return members;

  const byId = new Map(members.map((t) => [t.id, t]));
  const ordered = [];
  for (const member of written.types) {
    const resolved = await checker.getTypeFromTypeNode(member);
    if (!resolved || !byId.has(resolved.id)) return members;
    ordered.push(byId.get(resolved.id));
    byId.delete(resolved.id);
  }
  return byId.size === 0 ? ordered : members;
}

async function propsTypeToSchema(type, checker) {
  const out = {};
  for (const { prop, decl } of await declaredPropsInOrder(type, checker)) {
    const propType = await checker.getTypeOfSymbolAtLocation(prop, decl);
    if (await isFunctionType(propType, checker)) continue;
    const optional = (prop.flags & SymbolFlags.Optional) !== 0;
    const { description, kindOverride } = await readJSDoc(prop, checker);
    let entry = await typeToPropType(propType, checker, kindOverride, 0, decl.type);
    if (optional) entry = wrapNullable(entry);
    if (description) entry = { ...entry, description };
    out[prop.name] = entry;
  }
  return out;
}

// `typeNode` is the prop's WRITTEN type, when there is one — the source order
// of a union is only recoverable from the declaration, never from the type.
async function typeToPropType(type, checker, kindOverride, depth = 0, typeNode = null) {
  // ReactNode is itself an aliased union, so check before isUnionType().
  if (await isReactContentType(type)) return { kind: 'richtext' };
  if (depth > MAX_PROP_DEPTH) return { kind: 'string' };
  if (type.isUnionType()) {
    const constituents = await type.getTypes();
    const nonNullish = constituents.filter(
      (t) => !(t.flags & (TypeFlags.Null | TypeFlags.Undefined)),
    );
    const hadNullish = nonNullish.length !== constituents.length;
    // Reorder after dropping null/undefined: `variant?: 'a' | 'b'` writes two
    // members but types as three.
    const members = await unionInDeclaredOrder(nonNullish, typeNode, type, checker);
    let inner;
    if (members.length === 0) inner = { kind: 'string' };
    else if (members.length === 1) inner = await typeToPropType(members[0], checker, kindOverride, depth);
    else inner = await unionToPropType(members, checker, kindOverride, depth);
    return hadNullish ? wrapNullable(inner) : inner;
  }
  return await atomicTypeToPropType(type, checker, kindOverride, depth);
}

async function unionToPropType(types, checker, kindOverride, depth = 0) {
  // A union that includes React content (e.g. `ReactNode` flattened with
  // `undefined`) is a render slot — surface it as richtext, not a grab-bag.
  for (const t of types) {
    if (await isReactContentType(t)) return { kind: 'richtext' };
  }
  const allStringLiterals = types.every((t) => t.isStringLiteralType());
  if (allStringLiterals) {
    return { kind: 'enum', values: types.map((t) => t.value) };
  }
  const options = [];
  for (const t of types) options.push(await typeToPropType(t, checker, kindOverride, depth + 1));
  return { kind: 'union', options };
}

async function atomicTypeToPropType(type, checker, kindOverride, depth = 0) {
  if (kindOverride && type.flags & TypeFlags.StringLike) {
    // `@kind <kind> [feature ...]` — the kind, then (richtext only) which
    // formatting the in-preview editor should offer for this field, e.g.
    // `@kind richtext bold italic link bulletList`. Omitted means the host's
    // safe inline-only default.
    //
    // Feature names are passed through UNVALIDATED on purpose. The vocabulary
    // is owned by the host (`RichTextFeature` in @kopla/types), which already
    // drops entries it doesn't know; re-listing it here would be a second
    // source of truth to drift out of step. The tradeoff is that a misspelled
    // feature is silently ignored rather than reported at build time.
    const [kind, ...features] = kindOverride.split(/\s+/).filter(Boolean);
    if (SPECIALIZED_STRING_KINDS.has(kind)) {
      return kind === 'richtext' && features.length > 0 ? { kind, features } : { kind };
    }
  }
  if (type.isStringLiteralType()) return { kind: 'literal', value: type.value };
  if (type.isNumberLiteralType()) return { kind: 'literal', value: type.value };
  if (type.flags & TypeFlags.BooleanLiteral) {
    return { kind: 'literal', value: (await checker.typeToString(type)) === 'true' };
  }
  if (type.flags & TypeFlags.String) return { kind: 'string' };
  if (type.flags & TypeFlags.Number) return { kind: 'number' };
  if (type.flags & TypeFlags.Boolean) return { kind: 'boolean' };

  if ((await checker.isArrayType(type)) || (await checker.isTupleType(type))) {
    const typeArgs = await checker.getTypeArguments(type);
    const inner = typeArgs[0]
      ? await typeToPropType(typeArgs[0], checker, undefined, depth + 1)
      : { kind: 'string' };
    return { kind: 'array', of: inner };
  }

  if (type.flags & TypeFlags.Object) {
    // Don't walk framework objects (CSSProperties, DOM elements, ReactElement)
    // or function types — terminal instead of exploding their internals.
    if ((await isFunctionType(type, checker)) || (await isLibraryType(type))) {
      return { kind: 'string' };
    }
    const fields = {};
    for (const { prop, decl } of await declaredPropsInOrder(type, checker)) {
      const fieldType = await checker.getTypeOfSymbolAtLocation(prop, decl);
      if (await isFunctionType(fieldType, checker)) continue;
      const optional = (prop.flags & SymbolFlags.Optional) !== 0;
      const { description, kindOverride: childOverride } = await readJSDoc(prop, checker);
      let entry = await typeToPropType(fieldType, checker, childOverride, depth + 1, decl.type);
      if (optional) entry = wrapNullable(entry);
      if (description) entry = { ...entry, description };
      fields[prop.name] = entry;
    }
    return { kind: 'object', fields };
  }

  return { kind: 'string' };
}

function wrapNullable(inner) {
  if (inner.kind === 'nullable') return inner;
  return { kind: 'nullable', of: inner };
}

// ── JSDoc reader ──────────────────────────────────────────────────────

async function readJSDoc(symbol, checker) {
  const description = (await symbol.getDocumentationComment(checker)).trim() || null;
  let kindOverride = null;
  for (const tag of await symbol.getJsDocTags(checker)) {
    if (tag.name === 'kind') {
      kindOverride = (tag.text ?? '').trim() || null;
    }
  }
  return { description, kindOverride };
}

// ── Demo ──────────────────────────────────────────────────────────────

async function collectDemo(sections, program) {
  // For each section X, look for a value export `XDemo` whose initializer
  // is an object literal (single instance) or an array literal of object
  // literals (multiple instances). Demo entries appear in section order.
  // The file is already parsed as part of the program (the barrel imports
  // it), so take that AST rather than re-parsing.
  const demo = [];
  for (const section of sections) {
    const sourcePath = resolve(ROOT, `src/sections/${section.name}.tsx`);
    const sourceFile = await program.getSourceFile(sourcePath);
    if (!sourceFile) {
      console.warn(`extract-design: no source file at ${sourcePath} for section ${section.name}`);
      continue;
    }
    const demoName = `${section.name}Demo`;
    const initializer = findExportedConstInitializer(sourceFile, demoName);
    if (!initializer) continue;

    if (isArrayLiteralExpression(initializer)) {
      for (const elem of initializer.elements) {
        if (isObjectLiteralExpression(elem)) {
          demo.push({ type: section.name, props: literalToValue(elem) });
        }
      }
    } else if (isObjectLiteralExpression(initializer)) {
      demo.push({ type: section.name, props: literalToValue(initializer) });
    } else {
      console.warn(
        `extract-design: ${demoName} must be an object literal or an array of object literals`,
      );
    }
  }
  return demo;
}

function findExportedConstInitializer(sourceFile, name) {
  for (const statement of sourceFile.statements) {
    if (!isVariableStatement(statement)) continue;
    const hasExport = (statement.modifiers ?? []).some(
      (m) => m.kind === SyntaxKind.ExportKeyword,
    );
    if (!hasExport) continue;
    for (const decl of statement.declarationList.declarations) {
      if (isIdentifier(decl.name) && decl.name.text === name && decl.initializer) {
        return decl.initializer;
      }
    }
  }
  return null;
}

function literalToValue(node) {
  if (isStringLiteral(node) || isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (isNumericLiteral(node)) return Number(node.text);
  if (node.kind === SyntaxKind.TrueKeyword) return true;
  if (node.kind === SyntaxKind.FalseKeyword) return false;
  if (node.kind === SyntaxKind.NullKeyword) return null;
  if (
    node.kind === SyntaxKind.UndefinedKeyword ||
    (isIdentifier(node) && node.text === 'undefined')
  ) {
    return null;
  }
  if (
    isPrefixUnaryExpression(node) &&
    node.operator === SyntaxKind.MinusToken &&
    isNumericLiteral(node.operand)
  ) {
    return -Number(node.operand.text);
  }
  if (isArrayLiteralExpression(node)) {
    return node.elements.map((el) => literalToValue(el));
  }
  if (isObjectLiteralExpression(node)) {
    const obj = {};
    for (const prop of node.properties) {
      if (isPropertyAssignment(prop)) {
        const key = isIdentifier(prop.name)
          ? prop.name.text
          : isStringLiteral(prop.name)
            ? prop.name.text
            : null;
        if (!key) continue;
        obj[key] = literalToValue(prop.initializer);
      }
    }
    return obj;
  }
  if (isAsExpression(node) || isTypeAssertion(node)) {
    return literalToValue(node.expression);
  }
  if (isParenthesizedExpression(node)) return literalToValue(node.expression);
  throw new Error(
    `*Demo exports must be static literals (no function calls, identifiers, or template ` +
      `interpolations). Got: ${formatSyntaxKind(node.kind)}`,
  );
}

// ── README ────────────────────────────────────────────────────────────

function parseReadme() {
  let text;
  try {
    text = readFileSync(README, 'utf8');
  } catch {
    return { name: '', description: '', compositionRationale: '' };
  }
  const lines = text.split('\n');
  let name = '';
  const descLines = [];
  let i = 0;

  while (i < lines.length) {
    const m = lines[i].match(/^# (.+)/);
    if (m) {
      name = m[1].trim();
      i++;
      break;
    }
    i++;
  }

  while (i < lines.length && !lines[i].match(/^## /)) {
    descLines.push(lines[i]);
    i++;
  }

  // Look for a "## Composition" block. Its entire body is the rationale —
  // the chain itself comes from the section barrel's export order.
  let compositionRationale = '';
  while (i < lines.length) {
    const h2 = lines[i].match(/^## (.+)/);
    if (h2 && /^(composition|recommended order)$/i.test(h2[1].trim())) {
      i++;
      const body = [];
      while (i < lines.length && !lines[i].match(/^## /)) {
        body.push(lines[i]);
        i++;
      }
      compositionRationale = body.join('\n').trim();
      break;
    }
    i++;
  }

  return {
    name,
    description: descLines.join('\n').trim(),
    compositionRationale,
  };
}

await main();

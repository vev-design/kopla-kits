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
//     JSDoc on each prop         → prop description ("@kind url|image|richtext" overrides)
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
import ts from 'typescript';

import { collectTokensFromCss } from './lib/tokens.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SECTIONS_INDEX = resolve(ROOT, 'src/sections/index.ts');
const README = resolve(ROOT, 'README.md');
const GLOBALS_CSS = resolve(ROOT, 'src/globals.css');
const DESIGN_JSON = resolve(ROOT, 'design.json');

const SPECIALIZED_STRING_KINDS = new Set(['url', 'image', 'richtext']);

function main() {
  const program = ts.createProgram({
    rootNames: [SECTIONS_INDEX],
    options: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      jsx: ts.JsxEmit.ReactJSX,
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      noEmit: true,
      allowJs: false,
      baseUrl: ROOT,
      paths: { '@/*': ['src/*'] },
    },
  });
  const checker = program.getTypeChecker();

  const indexSource = program.getSourceFile(SECTIONS_INDEX);
  if (!indexSource) throw new Error(`could not load ${SECTIONS_INDEX}`);

  const sections = collectSections(indexSource, checker, program);
  if (sections.length === 0) {
    throw new Error('no section components exported from src/sections/index.ts');
  }

  const readmeInfo = parseReadme();
  const demo = collectDemo(sections);
  const chain = sections.map((s) => s.name).join(' → ');
  const tokens = collectTokens();

  const designJson = {
    name: readmeInfo.name,
    description: readmeInfo.description,
    sections: sections.map(({ name, description, props, hydrate }) => ({
      name,
      description,
      props,
      // Preserve the computed hydrate flag — hosts read
      // design.json.sections[].hydrate to decide whether a page ships
      // client JS. Dropping it here forced every page static, so motion
      // sections never animated in production.
      ...(hydrate ? { hydrate: true } : {}),
    })),
    recommendedOrder: { chain, rationale: readmeInfo.compositionRationale },
    demo,
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
  console.log(
    `extract-design: ${sections.length} section${sections.length === 1 ? '' : 's'} ` +
      `(${sections.map((s) => s.name).join(', ')}), ${demo.length} demo entr${demo.length === 1 ? 'y' : 'ies'}${tokenNote}`,
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

// ── Sections ──────────────────────────────────────────────────────────

function collectSections(indexSource, checker, program) {
  const moduleSymbol = checker.getSymbolAtLocation(indexSource);
  if (!moduleSymbol) return [];
  const exports = checker.getExportsOfModule(moduleSymbol);

  const sections = [];
  for (const exp of exports) {
    if (!/^[A-Z]/.test(exp.name)) continue;
    // Skip *Demo exports — they're consumed by collectDemo, not as sections.
    if (exp.name.endsWith('Demo')) continue;

    let target = exp;
    if (target.flags & ts.SymbolFlags.Alias) target = checker.getAliasedSymbol(target);
    const decl = target.valueDeclaration ?? target.declarations?.[0];
    if (!decl) continue;
    const signatureNode = resolveSignatureNode(decl);
    if (!signatureNode || signatureNode.parameters.length === 0) continue;

    const propsType = resolvePropsTypeAtSignature(signatureNode, checker);
    if (!propsType) {
      throw new Error(
        `could not resolve props type for section '${exp.name}'. ` +
          `Sections must be React components with a typed props parameter.`,
      );
    }
    const description = readPropsInterfaceJSDoc(propsType, checker) ?? '';
    const props = propsTypeToSchema(propsType, checker);
    // A section needs client JS in production (→ `hydrate: true`) if it
    // imports an animation/interactivity lib (motion) or opts in via a
    // `@hydrate` JSDoc tag on its Props. Otherwise it ships as static
    // HTML. The production builder reads this to decide per-page.
    const hydrate = sectionNeedsHydration(decl, propsType, checker);
    sections.push({ name: exp.name, description, props, ...(hydrate ? { hydrate: true } : {}) });
  }
  // Preserve declaration order from src/sections/index.ts — that order
  // is the recommended composition chain.
  return sections;
}

function resolveSignatureNode(decl) {
  if (
    ts.isFunctionDeclaration(decl) ||
    ts.isFunctionExpression(decl) ||
    ts.isArrowFunction(decl)
  ) {
    return decl;
  }
  if (ts.isVariableDeclaration(decl) && decl.initializer) {
    if (
      ts.isArrowFunction(decl.initializer) ||
      ts.isFunctionExpression(decl.initializer)
    ) {
      return decl.initializer;
    }
  }
  return null;
}

function resolvePropsTypeAtSignature(signatureNode, checker) {
  const param = signatureNode.parameters[0];
  const paramSymbol = checker.getSymbolAtLocation(param.name) ?? param.symbol;
  if (paramSymbol) return checker.getTypeOfSymbolAtLocation(paramSymbol, signatureNode);
  return checker.getTypeAtLocation(param);
}

/** Does this section need client JS in production? True if its source
 *  file imports an animation/interactivity lib (`motion`, `@/motion`) or
 *  its Props JSDoc carries a `@hydrate` tag. Static otherwise. */
function sectionNeedsHydration(componentDecl, propsType, checker) {
  // Explicit opt-in via @hydrate on the Props interface.
  const symbol = propsType.aliasSymbol ?? propsType.symbol;
  for (const d of symbol?.declarations ?? []) {
    for (const tag of ts.getJSDocCommentsAndTags(d)) {
      const text = ts.isJSDoc(tag) ? (tag.comment ?? '') : '';
      if (typeof text === 'string' && /@hydrate\b/.test(text)) return true;
    }
  }
  // Heuristic: the component's source file imports motion → it animates.
  const sourceText = componentDecl.getSourceFile?.().text ?? '';
  return /from\s+['"](motion\b|motion\/|@\/motion)/.test(sourceText);
}

function readPropsInterfaceJSDoc(propsType, checker) {
  // Use the type's own symbol (the interface or type alias declaration).
  const symbol = propsType.aliasSymbol ?? propsType.symbol;
  if (!symbol) return null;
  const decls = symbol.declarations ?? [];
  for (const decl of decls) {
    const tags = ts.getJSDocCommentsAndTags(decl);
    for (const tag of tags) {
      if (ts.isJSDoc(tag)) {
        const text = typeof tag.comment === 'string'
          ? tag.comment
          : ts.displayPartsToString(
              tag.comment?.map((c) => ({ text: c.text ?? '', kind: 'text' })) ?? [],
            );
        if (text.trim()) return text.trim();
      }
    }
  }
  return null;
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
function isLibraryType(type) {
  const sym = type.aliasSymbol ?? type.symbol;
  for (const d of sym?.declarations ?? []) {
    if ((d.getSourceFile?.().fileName ?? '').includes('/node_modules/')) return true;
  }
  return false;
}

/** React render content (`ReactNode`, `ReactElement`, `JSX.Element`, …) — a
 *  rich-content slot, not structured data. Surface as richtext, stop recursing. */
function isReactContentType(type) {
  const a = type.aliasSymbol?.name;
  const s = type.symbol?.name;
  return Boolean((a && REACT_CONTENT_NAMES.has(a)) || (s && REACT_CONTENT_NAMES.has(s)));
}

/** A prop declared in node_modules is inherited framework surface (everything
 *  `extends React.ComponentProps<…>` pulls in), not an authored field. */
function isLibraryProp(prop) {
  const decl = prop.valueDeclaration ?? prop.declarations?.[0];
  return (decl?.getSourceFile?.().fileName ?? '').includes('/node_modules/');
}

/** Function-typed prop (event handler, render prop) — not an authoring field. */
function isFunctionType(type, checker) {
  return checker.getSignaturesOfType(type, ts.SignatureKind.Call).length > 0;
}

function propsTypeToSchema(type, checker) {
  const out = {};
  for (const prop of checker.getPropertiesOfType(type)) {
    if (isLibraryProp(prop)) continue;
    const decl = prop.valueDeclaration ?? prop.declarations?.[0];
    if (!decl) continue;
    const propType = checker.getTypeOfSymbolAtLocation(prop, decl);
    if (isFunctionType(propType, checker)) continue;
    const optional = (prop.flags & ts.SymbolFlags.Optional) !== 0;
    const { description, kindOverride } = readJSDoc(prop, checker);
    let entry = typeToPropType(propType, checker, kindOverride, 0);
    if (optional) entry = wrapNullable(entry);
    if (description) entry = { ...entry, description };
    out[prop.name] = entry;
  }
  return out;
}

function typeToPropType(type, checker, kindOverride, depth = 0) {
  // ReactNode is itself an aliased union, so check before isUnion().
  if (isReactContentType(type)) return { kind: 'richtext' };
  if (depth > MAX_PROP_DEPTH) return { kind: 'string' };
  if (type.isUnion()) {
    const nonNullish = type.types.filter(
      (t) => !(t.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined)),
    );
    const hadNullish = nonNullish.length !== type.types.length;
    let inner;
    if (nonNullish.length === 0) inner = { kind: 'string' };
    else if (nonNullish.length === 1) inner = typeToPropType(nonNullish[0], checker, kindOverride, depth);
    else inner = unionToPropType(nonNullish, checker, kindOverride, depth);
    return hadNullish ? wrapNullable(inner) : inner;
  }
  return atomicTypeToPropType(type, checker, kindOverride, depth);
}

function unionToPropType(types, checker, kindOverride, depth = 0) {
  // A union that includes React content (e.g. `ReactNode` flattened with
  // `undefined`) is a render slot — surface it as richtext, not a grab-bag.
  if (types.some((t) => isReactContentType(t))) return { kind: 'richtext' };
  const allStringLiterals = types.every((t) => t.isStringLiteral());
  if (allStringLiterals) {
    return { kind: 'enum', values: types.map((t) => t.value) };
  }
  return { kind: 'union', options: types.map((t) => typeToPropType(t, checker, kindOverride, depth + 1)) };
}

function atomicTypeToPropType(type, checker, kindOverride, depth = 0) {
  if (kindOverride && type.flags & ts.TypeFlags.StringLike) {
    if (SPECIALIZED_STRING_KINDS.has(kindOverride)) return { kind: kindOverride };
  }
  if (type.isStringLiteral()) return { kind: 'literal', value: type.value };
  if (type.isNumberLiteral()) return { kind: 'literal', value: type.value };
  if (type.flags & ts.TypeFlags.BooleanLiteral) {
    return { kind: 'literal', value: checker.typeToString(type) === 'true' };
  }
  if (type.flags & ts.TypeFlags.String) return { kind: 'string' };
  if (type.flags & ts.TypeFlags.Number) return { kind: 'number' };
  if (type.flags & ts.TypeFlags.Boolean) return { kind: 'boolean' };

  if (checker.isArrayType?.(type) || checker.isTupleType?.(type)) {
    const typeArgs = checker.getTypeArguments(type);
    const inner = typeArgs[0] ? typeToPropType(typeArgs[0], checker, undefined, depth + 1) : { kind: 'string' };
    return { kind: 'array', of: inner };
  }

  if (type.flags & ts.TypeFlags.Object) {
    // Don't walk framework objects (CSSProperties, DOM elements, ReactElement)
    // or function types — terminal instead of exploding their internals.
    if (isFunctionType(type, checker) || isLibraryType(type)) return { kind: 'string' };
    const fields = {};
    for (const prop of checker.getPropertiesOfType(type)) {
      if (isLibraryProp(prop)) continue;
      const decl = prop.valueDeclaration ?? prop.declarations?.[0];
      if (!decl) continue;
      const fieldType = checker.getTypeOfSymbolAtLocation(prop, decl);
      if (isFunctionType(fieldType, checker)) continue;
      const optional = (prop.flags & ts.SymbolFlags.Optional) !== 0;
      const { description, kindOverride: childOverride } = readJSDoc(prop, checker);
      let entry = typeToPropType(fieldType, checker, childOverride, depth + 1);
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

function readJSDoc(symbol, checker) {
  const tags = symbol.getJsDocTags?.(checker) ?? [];
  const docs = symbol.getDocumentationComment?.(checker) ?? [];
  const description = ts.displayPartsToString(docs).trim() || null;
  let kindOverride = null;
  for (const tag of tags) {
    if (tag.name === 'kind') {
      kindOverride = ts.displayPartsToString(tag.text).trim() || null;
    }
  }
  return { description, kindOverride };
}

// ── Demo ──────────────────────────────────────────────────────────────

function collectDemo(sections) {
  // For each section X, look for a value export `XDemo` whose initializer
  // is an object literal (single instance) or an array literal of object
  // literals (multiple instances). Demo entries appear in section order.
  // Re-using the section program would be cleaner; we re-parse here so
  // each section's source file is scanned once for its sibling Demo.
  const demo = [];
  for (const section of sections) {
    const sourcePath = resolve(ROOT, `src/sections/${section.name}.tsx`);
    let sourceText;
    try {
      sourceText = readFileSync(sourcePath, 'utf8');
    } catch {
      console.warn(`extract-design: no source file at ${sourcePath} for section ${section.name}`);
      continue;
    }
    const sourceFile = ts.createSourceFile(
      sourcePath,
      sourceText,
      ts.ScriptTarget.ES2022,
      true,
      ts.ScriptKind.TSX,
    );
    const demoName = `${section.name}Demo`;
    const initializer = findExportedConstInitializer(sourceFile, demoName);
    if (!initializer) continue;

    if (ts.isArrayLiteralExpression(initializer)) {
      for (const elem of initializer.elements) {
        if (ts.isObjectLiteralExpression(elem)) {
          demo.push({ type: section.name, props: literalToValue(elem) });
        }
      }
    } else if (ts.isObjectLiteralExpression(initializer)) {
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
    if (!ts.isVariableStatement(statement)) continue;
    const hasExport = (statement.modifiers ?? []).some(
      (m) => m.kind === ts.SyntaxKind.ExportKeyword,
    );
    if (!hasExport) continue;
    for (const decl of statement.declarationList.declarations) {
      if (ts.isIdentifier(decl.name) && decl.name.text === name && decl.initializer) {
        return decl.initializer;
      }
    }
  }
  return null;
}

function literalToValue(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (
    node.kind === ts.SyntaxKind.UndefinedKeyword ||
    (ts.isIdentifier(node) && node.text === 'undefined')
  ) {
    return null;
  }
  if (
    ts.isPrefixUnaryExpression(node) &&
    node.operator === ts.SyntaxKind.MinusToken &&
    ts.isNumericLiteral(node.operand)
  ) {
    return -Number(node.operand.text);
  }
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map((el) => literalToValue(el));
  }
  if (ts.isObjectLiteralExpression(node)) {
    const obj = {};
    for (const prop of node.properties) {
      if (ts.isPropertyAssignment(prop)) {
        const key = ts.isIdentifier(prop.name)
          ? prop.name.text
          : ts.isStringLiteral(prop.name)
            ? prop.name.text
            : null;
        if (!key) continue;
        obj[key] = literalToValue(prop.initializer);
      }
    }
    return obj;
  }
  if (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)) {
    return literalToValue(node.expression);
  }
  if (ts.isParenthesizedExpression(node)) return literalToValue(node.expression);
  throw new Error(
    `*Demo exports must be static literals (no function calls, identifiers, or template ` +
      `interpolations). Got: ${ts.SyntaxKind[node.kind]}`,
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

main();

#!/usr/bin/env bun
// Is every picture in this system POINTABLE?
//
// The host editor doesn't read the schema to find the image a person is
// hovering — it hit-tests the cursor and walks the paint stack. Two class
// choices make a picture unreachable that way, and both are invisible in a
// screenshot:
//
//   1. `pointer-events-none` ON THE MEDIA ELEMENT. It isn't hit-testable, so it
//      never appears in the stack at all. Not even a click can select it; only
//      keyboard Tab reaches it, which nobody discovers.
//   2. A decorative layer over it WITHOUT `pointer-events-none`. A gradient
//      scrim, a colour wash, a hover tint at `absolute inset-0` is the standard
//      way to keep overlaid text legible — and it swallows the pointer, so the
//      image below never learns it was hovered.
//
// Either way the "Change image" affordance never appears and the picture reads
// as uneditable — worst on exactly the full-bleed heroes where the image IS the
// section. See AGENTS.md → the `pointer-events-none` rule.
//
// This runs on the ASSEMBLED workspace, beside extract-design.mjs, so it covers
// an AI-authored system as well as a shipped kit — the container runs this same
// build. It WARNS by default and fails only under `--strict`, and that split is
// the point: a class heuristic must never fail somebody's design turn (a warning
// in the turn's log is the right weight for "your hero image won't be clickable"),
// while the kits repo owns the shipped set and can hold it to the rule. CI sets
// KOPLA_MEDIA_STRICT=1, which reaches here through build-kit.mjs's inherited env.
//
// It is build tooling, so it must work against a workspace materialized at an
// OLDER ref (CONTRACT.md → "The toolchain travels; the design source does not").
// It reads only what is ON DISK — an absent `src/` yields no findings rather
// than an error — and `check:media` in package.json is GUARDED on this file
// existing, so a workspace this file never reached builds as it did before.
//
// It parses with the STAGED extraction toolchain's TypeScript (`./lib/ts.mjs`,
// CONTRACT.md → "The toolchain travels"): TypeScript 7 has no in-process
// parser, so the syntax tree comes from the same out-of-process compiler the
// extractor uses. A workspace where nothing staged that toolchain gets a
// SKIPPED notice rather than a crash — except under `--strict`, where a
// missing toolchain would silently drop the gate and must fail instead.
//
//   bun scripts/check-media-editable.mjs [--strict]

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'src');
const TSCONFIG = resolve(ROOT, 'tsconfig.json');
const STRICT = process.argv.includes('--strict') || !!process.env.KOPLA_MEDIA_STRICT;

let tsAsync, tsAst;
try {
  ({ tsAsync, tsAst } = await import('./lib/ts.mjs'));
} catch (err) {
  const note = `check-media-editable: extraction toolchain not staged (${err?.message ?? err})`;
  if (STRICT) {
    console.error(`${note} — strict mode refuses to skip the gate.`);
    process.exit(1);
  }
  console.log(`${note} — skipped.`);
  process.exit(0);
}
const { API } = tsAsync;
const {
  isBinaryExpression,
  isConditionalExpression,
  isJsxAttribute,
  isJsxElement,
  isJsxExpression,
  isJsxFragment,
  isJsxOpeningElement,
  isJsxSelfClosingElement,
  isNoSubstitutionTemplateLiteral,
  isParenthesizedExpression,
  isStringLiteral,
  isTemplateExpression,
} = tsAst;

/** A class list that paints over the whole of its positioned ancestor — the
 *  shape every scrim, wash and tint in this repo takes. `inset-0` alone is
 *  enough; the `absolute`/`fixed` may sit in a `cn()` branch we can't read. */
function coversParent(classes) {
  return /\binset-0\b/.test(classes);
}

/** Does this element DISPLAY a picture or a video? Three tells, matching what
 *  the host's own media binder looks for: the tag, a cover-fit background, or an
 *  inline `backgroundImage`.
 *
 *  The tag test allows a namespace prefix (`Foo.img`) rather than naming one:
 *  the shape this repo used to have was `motion.img`, and while JS animation
 *  libraries are now out (AGENTS.md → Motion), any wrapper that forwards to a
 *  real `<img>` should still be checked. What it deliberately CANNOT see is a
 *  custom component (`<Figure>`, `<MediaBlock>`) — the class list is the only
 *  evidence available here, so a component that hides its own scrim is the known
 *  blind spot. */
function isMediaElement(tag, classes, attrText) {
  if (/(^|\.)(img|video)$/.test(tag)) return true;
  if (/\b(bg-cover|bg-contain)\b/.test(classes)) return true;
  return /backgroundImage/.test(attrText);
}

function hasPointerEventsNone(classes) {
  return /\bpointer-events-none\b/.test(classes);
}

/** The source text of a node — TS7 handles carry positions, not text, so the
 *  file's own text is the source of truth. `pos` includes leading trivia. */
function sliceOf(node, text) {
  return text.slice(node.pos, node.end);
}

/** Every string literal in a `className` — including the branches of a `cn()`
 *  call and a template literal's static chunks, since a scrim's utilities are
 *  often spread across them. */
function classNameOf(node, text) {
  const attr = node.attributes.properties.find(
    (p) => isJsxAttribute(p) && sliceOf(p.name, text).trim() === 'className',
  );
  if (!attr?.initializer) return '';
  const out = [];
  const visit = (n) => {
    if (isStringLiteral(n) || isNoSubstitutionTemplateLiteral(n)) out.push(n.text);
    else if (isTemplateExpression(n)) {
      out.push(n.head.text, ...n.templateSpans.map((s) => s.literal.text));
    }
    n.forEachChild(visit);
  };
  visit(attr.initializer);
  return out.join(' ');
}

function tagNameOf(node, text) {
  return sliceOf(node.tagName, text).trim();
}

/** JSX element children of `node`, skipping whitespace and text. Fragments and
 *  `{cond ? <a/> : <b/>}` expressions are flattened: for our purposes a scrim
 *  rendered conditionally is still a sibling of the image. */
function jsxChildren(node) {
  const children = isJsxElement(node) ? node.children : [];
  const out = [];
  const collect = (n) => {
    if (isJsxElement(n)) {
      out.push(n.openingElement);
      return; // its own children are a level down, checked when we visit it
    }
    if (isJsxSelfClosingElement(n)) {
      out.push(n);
      return;
    }
    if (isJsxFragment(n) || isJsxExpression(n) || isConditionalExpression(n) ||
        isBinaryExpression(n) || isParenthesizedExpression(n)) {
      n.forEachChild(collect);
    }
  };
  children.forEach(collect);
  return out;
}

function describe(el, file, text) {
  // Line of the node's first non-trivia character (pos points at the end of
  // the previous token, so skip the leading whitespace/comments ourselves).
  const lead = /^\s*/.exec(text.slice(el.pos, el.end))[0].length;
  const line = text.slice(0, el.pos + lead).split('\n').length;
  return `${relative(ROOT, file)}:${line}`;
}

function checkFile(file, source, text, findings) {
  const walk = (node) => {
    // Rule 1 — a media element that refuses the pointer.
    if (isJsxSelfClosingElement(node) || isJsxOpeningElement(node)) {
      const classes = classNameOf(node, text);
      const tag = tagNameOf(node, text);
      if (isMediaElement(tag, classes, sliceOf(node, text)) && hasPointerEventsNone(classes)) {
        findings.push({
          where: describe(node, file, text),
          message:
            `<${tag}> displays media and carries \`pointer-events-none\`, so the editor's ` +
            'hit test cannot find it — the image cannot be selected or swapped. Move the class ' +
            'to the decorative layers above it.',
        });
      }
    }
    // Rule 2 — a sibling that covers a media element and eats the pointer.
    if (isJsxElement(node)) {
      const kids = jsxChildren(node);
      const media = kids.filter((k) =>
        isMediaElement(tagNameOf(k, text), classNameOf(k, text), sliceOf(k, text)),
      );
      if (media.length > 0) {
        for (const kid of kids) {
          if (media.includes(kid)) continue;
          const classes = classNameOf(kid, text);
          if (!coversParent(classes) || hasPointerEventsNone(classes)) continue;
          findings.push({
            where: describe(kid, file, text),
            message:
              `<${tagNameOf(kid, text)}> covers a sibling media element (\`inset-0\`) without ` +
              '`pointer-events-none`, so it swallows the hover and the "Change image" ' +
              'affordance never appears. Add `pointer-events-none aria-hidden`.',
          });
        }
      }
    }
    node.forEachChild(walk);
  };
  walk(source);
}

function tsxFilesUnder(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...tsxFilesUnder(full));
    else if (entry.name.endsWith('.tsx')) out.push(full);
  }
  return out;
}

const files = tsxFilesUnder(SRC);
const findings = [];
if (files.length > 0) {
  const api = new API({ cwd: ROOT });
  try {
    const snapshot = await api.updateSnapshot({ openProjects: [TSCONFIG] });
    const project = await snapshot.getProject(TSCONFIG);
    if (!project) throw new Error(`could not load ${TSCONFIG}`);
    for (const file of files) {
      const source = await project.program.getSourceFile(file);
      if (!source) continue; // outside the project's include — nothing to say
      checkFile(file, source, readFileSync(file, 'utf8'), findings);
    }
  } finally {
    await api.close();
  }
}

if (findings.length === 0) {
  console.log('check-media-editable: every media element is pointable ✓');
  process.exit(0);
}

const label = STRICT ? 'error' : 'warning';
for (const f of findings) {
  console.error(`check-media-editable: ${label}: ${f.where} — ${f.message}`);
}
console.error(
  `check-media-editable: ${findings.length} media element(s) unreachable by pointer. ` +
    'See AGENTS.md → "Never put `pointer-events-none` on a media element".',
);
process.exit(STRICT ? 1 : 0);

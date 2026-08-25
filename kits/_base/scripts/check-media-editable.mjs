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
// Two things follow. It reads only what is ON DISK — an absent `src/` yields no
// findings rather than an error — and `check:media` in package.json is GUARDED on
// this file existing, because package.json and `scripts/` reach an existing
// workspace by different routes: the host refreshes a fixed list of framework
// files, and syncs package.json only when its DEPENDENCY surface drifted. A
// package.json that calls a script the refresh never delivered would fail every
// existing system's build, which is the exact class of bug that rule exists to
// stop. Absent checker ⇒ the build is what it was before this shipped.
//
//   bun scripts/check-media-editable.mjs [--strict]

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import ts from 'typescript';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'src');
const STRICT = process.argv.includes('--strict') || !!process.env.KOPLA_MEDIA_STRICT;

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

/** Every string literal in a `className` — including the branches of a `cn()`
 *  call and a template literal's static chunks, since a scrim's utilities are
 *  often spread across them. */
function classNameOf(node) {
  const attr = node.attributes.properties.find(
    (p) => ts.isJsxAttribute(p) && p.name.getText() === 'className',
  );
  if (!attr?.initializer) return '';
  const out = [];
  const visit = (n) => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) out.push(n.text);
    else if (ts.isTemplateExpression(n)) {
      out.push(n.head.text, ...n.templateSpans.map((s) => s.literal.text));
    }
    n.forEachChild(visit);
  };
  visit(attr.initializer);
  return out.join(' ');
}

function tagNameOf(node) {
  return node.tagName.getText();
}

/** JSX element children of `node`, skipping whitespace and text. Fragments and
 *  `{cond ? <a/> : <b/>}` expressions are flattened: for our purposes a scrim
 *  rendered conditionally is still a sibling of the image. */
function jsxChildren(node) {
  const children = ts.isJsxElement(node) ? node.children : [];
  const out = [];
  const collect = (n) => {
    if (ts.isJsxElement(n)) {
      out.push(n.openingElement);
      return; // its own children are a level down, checked when we visit it
    }
    if (ts.isJsxSelfClosingElement(n)) {
      out.push(n);
      return;
    }
    if (ts.isJsxFragment(n) || ts.isJsxExpression(n) || ts.isConditionalExpression(n) ||
        ts.isBinaryExpression(n) || ts.isParenthesizedExpression(n)) {
      n.forEachChild(collect);
    }
  };
  children.forEach(collect);
  return out;
}

function describe(el, file, source) {
  const { line } = source.getLineAndCharacterOfPosition(el.getStart());
  return `${relative(ROOT, file)}:${line + 1}`;
}

function checkFile(file, findings) {
  const text = readFileSync(file, 'utf8');
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  const walk = (node) => {
    // Rule 1 — a media element that refuses the pointer.
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const classes = classNameOf(node);
      const tag = tagNameOf(node);
      if (isMediaElement(tag, classes, node.getText()) && hasPointerEventsNone(classes)) {
        findings.push({
          where: describe(node, file, source),
          message:
            `<${tag}> displays media and carries \`pointer-events-none\`, so the editor's ` +
            'hit test cannot find it — the image cannot be selected or swapped. Move the class ' +
            'to the decorative layers above it.',
        });
      }
    }
    // Rule 2 — a sibling that covers a media element and eats the pointer.
    if (ts.isJsxElement(node)) {
      const kids = jsxChildren(node);
      const media = kids.filter((k) =>
        isMediaElement(tagNameOf(k), classNameOf(k), k.getText()),
      );
      if (media.length > 0) {
        for (const kid of kids) {
          if (media.includes(kid)) continue;
          const classes = classNameOf(kid);
          if (!coversParent(classes) || hasPointerEventsNone(classes)) continue;
          findings.push({
            where: describe(kid, file, source),
            message:
              `<${tagNameOf(kid)}> covers a sibling media element (\`inset-0\`) without ` +
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

const findings = [];
for (const file of tsxFilesUnder(SRC)) checkFile(file, findings);

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

// Run with Bun. The optional first argument is the adopted workspace root.
// Server-renders every showcase case: the section must produce a root
// <section> carrying its id, no invalid numbers, and — with every slot empty —
// its neutral form, which is what a brand that has filled nothing yet ships.
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(process.argv[2] ? resolve(process.argv[2], 'package.json') : import.meta.url);
const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const NAME = 'ProposalHero';
const moduleUrl = process.argv[2]
  ? pathToFileURL(resolve(process.argv[2], `src/sections/${NAME}.tsx`)).href
  : new URL(`./${NAME}.tsx`, import.meta.url).href;
const mod = await import(moduleUrl);
const Section = mod[NAME];
// The showcase lives in the catalog beside this file and has no value imports, so it loads from anywhere.
const showcase = (await import(new URL('./showcase.ts', import.meta.url).href))[`${NAME}Showcase`];
const cases = [{ label: 'Demo', props: mod[`${NAME}Demo`] }, ...showcase];
assert.ok(typeof Section === 'function', `${NAME}: missing export`);
let count = 0;
for (const { label, props } of cases) {
  const html = renderToStaticMarkup(createElement(Section, props));
  // React 19 hoists an image preload <link> ahead of the markup; skip hoisted head elements.
  assert.match(html.replace(/^(<link\b[^>]*>)+/, ''), /^<section\b/, `${label}: root must be a <section>`);
  if (props.id) assert.ok(html.includes(`id="${props.id}"`), `${label}: root must carry its id`);
  assert.ok(!/NaN|Infinity|undefined<\//.test(html), `${label}: invalid output`);
  
  count++;
}
const hostile = renderToStaticMarkup(createElement(Section, { ...cases[0].props, title: '<script>alert(1)</script>' }));
assert.ok(!hostile.includes('<script>'), 'content must be escaped');
console.log(`${NAME}: ${count} showcase case(s) render without JavaScript`);

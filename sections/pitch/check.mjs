// Run with Bun. The optional first argument is the adopted workspace root.
//
// What a pitch section must hold whatever the brand composed: it renders
// through the frame (header, main, footer), exactly one part leads, every
// word of its content is on the page, and nothing the parts do not draw has
// crept in — no buttons, no numbering, no inline colour outside the theme.
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
const root = process.argv[2] ? resolve(process.argv[2]) : null;
// The mains may draw catalog components through the workspace's components
// barrel, so this check only runs inside an adopted workspace — which is
// where hosts and the catalog build run it.
if (!root) {
  console.error('Pitch: pass the adopted workspace root — bun check.mjs <workspace>');
  process.exit(2);
}
const require = createRequire(resolve(root, 'package.json'));
const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const url = (file) => pathToFileURL(resolve(root, 'src/sections', file)).href;
const mains = { Fees: (await import(url('Fees.tsx'))).Fees };
const { PitchShowcase } = await import(url('pitch-showcase.ts'));
const { pitchTheme } = await import(url('pitch-composition.tsx'));

const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ');
let count = 0;
for (const { label, main, props } of PitchShowcase) {
  const html = renderToStaticMarkup(createElement(mains[main], props));
  count++;
  // The frame, in order.
  const frame = html.match(/<section[^>]*data-pitch-frame=""[\s\S]*<\/section>/);
  assert.ok(frame, `${label}: renders through PitchFrame`);
  const order = ['data-pitch-header', 'data-pitch-main', 'data-pitch-footer'].map((k) => html.indexOf(k));
  assert.ok(order[0] > 0 && order[0] < order[1] && order[1] < order[2], `${label}: header, main, footer in order`);
  const takeawayAt = html.indexOf('data-pitch-takeaway');
  if (takeawayAt >= 0) assert.ok(takeawayAt > order[1] && takeawayAt < order[2], `${label}: the takeaway region sits between main and footer`);
  // One lead, never more; a main with nothing ranked is a main with no point.
  const leads = (html.match(/data-rank="lead"/g) ?? []).length;
  assert.equal(leads, 1, `${label}: exactly one lead (found ${String(leads)})`);
  // Every word of the content is on the page.
  const words = text(html);
  for (const row of props.rows ?? []) {
    assert.ok(words.includes(row.label), `${label}: row label missing: ${row.label}`);
    assert.ok(words.includes(row.value), `${label}: row value missing: ${row.value}`);
  }
  for (const note of props.notes ?? []) assert.ok(words.includes(note), `${label}: note missing: ${note.slice(0, 40)}`);
  assert.ok(words.includes(props.title), `${label}: title missing`);
  if (props.kicker) assert.ok(words.includes(props.kicker), `${label}: kicker missing`);
  if (props.takeaway) {
    assert.ok(html.includes('data-pitch-band=""') && words.includes(props.takeaway), `${label}: takeaway drawn in the band`);
    assert.ok(takeawayAt >= 0 && html.indexOf('data-pitch-band') > takeawayAt && html.indexOf('data-pitch-band') < order[2], `${label}: the band lives in the takeaway region, not the footer`);
    // Visibly the conclusion: the lead-in word is always there, styled by the brand.
    assert.ok(html.includes('data-pitch-band-lead-in=""'), `${label}: the takeaway has no lead-in word — nothing says it is the conclusion`);
    // Set apart by its region, never by a box of its own.
    const bandStyle = html.match(/<p[^>]*data-pitch-band=""[^>]*style="([^"]*)"/);
    assert.ok(bandStyle && !/background/.test(bandStyle[1]), `${label}: the band paints its own background — set the region's surface (takeawaySurface) instead`);
  } else {
    assert.ok(!html.includes('data-pitch-band=""'), `${label}: no band without a takeaway`);
    assert.ok(!html.includes('data-pitch-takeaway=""'), `${label}: no takeaway region without a takeaway — a rule above nothing is decoration`);
  }
  if (props.page && html.includes('data-pitch-page')) assert.ok(words.includes(String(props.page.index)), `${label}: page number drawn`);
  // Nothing the brief did not supply.
  assert.ok(!/<button|<a /.test(html), `${label}: no controls in a pitch section`);
  // Numbering is a tell ("01 02 03"); test the words, not the markup — a chart's SVG is full of digits.
  assert.ok(!/<ol\b/.test(html) && !/(^|\s)0[1-9](\s|$)/.test(words), `${label}: no numbering`);
  assert.ok(!/\b(Learn more|Explore|Get started)\b/i.test(words), `${label}: no invented call to action`);
  // A mark in the header sits in a row's right group, never above or before the kicker.
  const header = html.slice(html.indexOf('data-pitch-header'), html.indexOf('data-pitch-main'));
  if (header.includes('data-pitch-logo')) {
    const right = header.indexOf('data-pitch-row-right'), mark = header.indexOf('data-pitch-logo');
    assert.ok(right >= 0 && mark > right, `${label}: the mark sits at the start of the header — it crowds the kicker and title; put it in a row's right group or in the footer`);
  }
  // The takeaway closes the main and must not fuse with the footer: either its
  // surface differs from the page, or the footer opens with a rule between them.
  const takeawayStyle = html.match(/<div[^>]*data-pitch-takeaway=""[^>]*style="([^"]*)"/);
  if (takeawayStyle && takeawayStyle[1].includes(`background:${pitchTheme.page}`) && pitchTheme.page !== pitchTheme.field) {
    const footer = html.slice(html.indexOf('data-pitch-footer'));
    const firstPart = footer.search(/data-pitch-(rule|band|footnote|logo|page|kicker|title)=/);
    assert.ok(firstPart >= 0 && footer.slice(firstPart).startsWith('data-pitch-rule'), `${label}: the takeaway region sits on the page like the footer with nothing between them — give it its own surface, or open the footer with a rule`);
  }
  // The field is the theme's: a main never paints its own background.
  const field = html.match(/<div[^>]*data-pitch-main=""[^>]*style="([^"]*)"/);
  assert.ok(field && field[1].includes(`background:${pitchTheme.field}`), `${label}: main sits on the theme's field`);
}
console.log(`Pitch: ${String(count)} showcase SSR states, frame order, one lead, content coverage and no invented controls passed`);

// Run with Bun. The optional first argument is the adopted workspace root.
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(process.argv[2] ? resolve(process.argv[2], 'package.json') : import.meta.url);
const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const moduleUrl = process.argv[2] ? pathToFileURL(resolve(process.argv[2], 'src/components/Chart.tsx')).href : new URL('./Chart.tsx', import.meta.url).href;
const { Chart, ChartShowcase } = await import(moduleUrl);
let count = 0;
for (const { label, props } of ChartShowcase) {
  const html = renderToStaticMarkup(createElement(Chart, props));
  assert.ok(html.includes('<table'), `${label}: accessible source table missing`);
  assert.ok(html.includes('<figcaption'), `${label}: figure caption missing`);
  if (props.series.length) {
    assert.ok(html.includes('<svg') && html.includes('<path'), `${label}: SSR plot marks missing`);
    assert.ok(!/NaN|Infinity/.test(html), `${label}: invalid geometry`);
  }
  count++;
}
const render = (props) => renderToStaticMarkup(createElement(Chart, { title: 'Check', series: [], ...props }));
assert.match(render({ series: [{ name: 'Invalid', values: [NaN, Infinity, null] }] }), /No finite observations/);
assert.match(render({ variant: 'pie', series: [{ name: 'Negative', values: [-1, 2] }] }), /require nonnegative/);
assert.match(render({ variant: 'donut', series: [{ name: 'Zero', values: [0, 0] }] }), /No positive values/);
assert.match(render({ series: [{ name: 'Duplicates', values: [{ x: 'A', y: 1 }, { x: 'A', y: 2 }] }] }), /one observation per category/);
assert.match(render({ frame: createElement('div', { 'data-brand-frame': true }), series: [{ name: 'One', values: [1, 2] }] }), /data-brand-frame="true"><div/);
const hostile = render({ title: '<script>alert(1)</script>', categories: ['<img src=x onerror=alert(1)>'], series: [{ name: 'Escaped', values: [1] }] });
assert.ok(!hostile.includes('<script>') && !hostile.includes('<img src=x'), 'Source content must be escaped');
// A valid circle without readable category/share labels is still a failed chart.
// Inspect SVG text, not the source table or the separate key below the plot.
for (const variant of ['pie', 'donut']) {
  const html = render({ variant, categories: ['Enterprise', 'Mid-market', 'Small business'], series: [{ name: 'Revenue', values: [960000, 465000, 275000] }] });
  const plots = html.match(/<svg\b[\s\S]*?<\/svg>/g) ?? [];
  assert.ok(plots.length > 0, `${variant}: missing plot`);
  for (const svg of plots) {
    // Wrapped lines are tspans inside one text; read the words, not the markup.
    const labels = [...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map((match) => match[1].replace(/<[^>]+>/g, '')).join(' ').replace(/\s+/g, '');
    for (const label of ['Enterprise', 'Mid-market', 'Small business', '56.5%', '27.4%', '16.2%'])
      assert.ok(labels.includes(label.replace(/\s+/g, '')), `${variant}: visible slice label missing: ${label}`);
  }
  // The default composition draws no key under a small pie — the labels on the
  // circle already say name and share — so the exact value lives in the source
  // table, which every composition keeps.
  assert.ok(html.split('<details')[1]?.includes('960000'), `${variant}: source value missing from the table`);
}
const axes = render({ categories: ['First', 'Second'], series: [{ name: 'Sales', values: [900000, 1800000] }] });
assert.ok(axes.includes('container-name:kopla-cartesian'), 'Cartesian layouts must respond to their container');
for (const svg of axes.match(/<svg\b[\s\S]*?<\/svg>/g) ?? []) {
  assert.match(svg, /<text\b[^>]*>1,800,000<\/text>/, 'Million-value axis label missing');
}
// THE COMPOSITION GUARD. The parts in chart-primitives.tsx exist so a brand's
// composition can draw its guide's idiom; this proves two real idioms are
// expressible and that a leader ends where the text starts — the gap between
// the two was the bug that motivated the parts.
const primitivesUrl = process.argv[2] ? pathToFileURL(resolve(process.argv[2], 'src/components/chart-primitives.tsx')).href : new URL('./chart-primitives.tsx', import.meta.url).href;
const P = await import(primitivesUrl);
const TAU = Math.PI * 2;
function context(shares, compact) {
  const width = compact ? 320 : 520; let angle = 0;
  const slices = shares.map((share, index) => { const start = angle; angle += share * TAU; return { index, name: ['Positive', 'Neutral', 'Negative', 'No response'][index], value: share * 1000, share, color: '#333', start, end: angle, mid: (start + angle) / 2, shareLabel: `${Math.round(share * 1000) / 10}%`, valueLabel: String(share * 1000) }; });
  return { slices, donut: false, compact, width, outer: compact ? 64 : 120, cx: width / 2, cy: (compact ? 300 : 340) / 2, type: { fontFamily: 'sans-serif', labelSize: 12, titleSize: 20, titleWeight: 600 }, textColor: '#111' };
}
for (const compact of [false, true]) {
  const c = context([0.624, 0.216, 0.12, 0.04], compact);
  // Idiom A: values inside a ring, names outside on short leaders.
  const inside = P.insideLabels(c, { text: (s) => s.shareLabel, ring: 0.58, weight: 700, minShare: 0.05 });
  const a = renderToStaticMarkup(P.canvas(c, [P.slices(c, { ring: 0.58 }), inside, P.outsideLabels(c, { lines: (s) => [s.name], leaders: 'short' })]));
  const aWords = a.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  assert.ok(aWords.includes('62.4%') && aWords.includes('No response'), `inside+short (${compact ? 'compact' : 'wide'}): labels missing`);
  assert.ok(a.includes('font-weight="700"'), 'inside labels carry their weight');
  // Idiom B: stacked bold name + share beside the sector, no leaders at all.
  const b = renderToStaticMarkup(P.canvas(c, [P.slices(c), P.outsideLabels(c, { lines: (s) => [s.name, s.shareLabel], leaders: 'none', firstLine: { weight: 700 } })]));
  assert.ok(!b.includes('<polyline'), 'leaders: none draws no leader');
  assert.ok(b.includes('>Neutral<') && b.includes('>21.6%<'), 'stacked lines render as tspans');
  // The leader meets the WORDS: on the left the text reads from x=6 rightward,
  // so the leader must end past x=6 by about the text's width — never at the
  // column edge (the old gap) and never short of the text. Mirror on the right.
  const col = renderToStaticMarkup(P.canvas(c, [P.slices(c), P.outsideLabels(c, { lines: (s) => [s.name, s.shareLabel], leaders: 'column' })]));
  for (const m of col.matchAll(/<polyline points="[^"]* ([\d.]+),([\d.]+)"[^>]*><\/polyline><text x="([\d.]+)" [^>]*text-anchor="(start|end)"/g)) {
    const end = Number(m[1]), x = Number(m[3]);
    const reach = m[4] === 'start' ? end - x : x - end;
    assert.ok(reach > 20 && reach < 140, `column leader ends ${String(reach)}px from the text edge at x=${m[3]}`);
  }
  assert.ok((col.match(/<polyline/g) ?? []).length === 4, 'one column leader per sector');
}
console.log(`Chart: ${count} showcase SSR states, 6 edge/accessibility checks, 2 direct-label checks and responsive axes passed`);

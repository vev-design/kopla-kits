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
console.log(`Chart: ${count} showcase SSR states and 6 edge/accessibility checks passed`);

#!/usr/bin/env node
// Rebuild the audited SVG-only renderer: node scripts/vendor-chart.mjs.
import { mkdtemp, mkdir, writeFile, copyFile, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'components/Chart/Chart.vendor');
const work = await mkdtemp(resolve(tmpdir(), 'chart-vendor-'));
try {
  await mkdir(out, { recursive: true });
  execFileSync('npm', ['install', '--prefix', work, '--no-audit', '--no-fund', '--ignore-scripts', 'echarts@6.0.0', 'zrender@6.0.0', 'tslib@2.3.0'], { stdio: 'inherit' });
  await writeFile(resolve(work, 'entry.js'), `import { init, use } from 'echarts/core';
import { BarChart, LineChart, PieChart, ScatterChart } from 'echarts/charts';
import { GridComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import { vNodeToString } from 'zrender/lib/svg/core.js';
import { DEFAULT_FONT, DEFAULT_FONT_SIZE, DEFAULT_TEXT_WIDTH_MAP, setPlatformAPI } from 'zrender/lib/core/platform.js';

// Canvas rejects CSS-variable font families, silently keeping its previous
// font (often 10px sans-serif). It also cannot measure a font before it loads.
// Use the same conservative approximation in SSR and browsers instead; the
// visible SVG still uses the authored CSS font. This is a layout safety budget,
// not exact metrics for an arbitrary brand font: known fallback glyph widths
// receive 20% extra space and Chart also insets its outer bounds. Unknown glyphs
// keep the upstream full-em estimate. In particular, zrender measures '国' to
// derive line height, which must stay at one em rather than inflating with width.
export function measureStaticText(text, font = DEFAULT_FONT) {
  const size = /((?:\\d+)?\\.?\\d*)px/.exec(font);
  const fontSize = size && +size[1] || DEFAULT_FONT_SIZE;
  let width = 0;
  for (const character of String(text ?? '')) {
    const advance = DEFAULT_TEXT_WIDTH_MAP[character];
    width += font.includes('mono') || advance == null ? fontSize : advance * fontSize * 1.2;
  }
  return { width };
}
// Register before any chart is created: zrender caches measurements by font.
setPlatformAPI({ measureText: measureStaticText });
use([BarChart, LineChart, PieChart, ScatterChart, GridComponent, SVGRenderer]);
export { init };
// renderToString forces one-decimal compression in this pinned release.
// Four-decimal paths preserve near-full arcs at small chart radii.
export function renderStaticSVG(chart) {
  return vNodeToString(chart.getZr().painter.renderToVNode({ animation: false, emphasis: false, willUpdate: false, compress: false, useViewBox: true }), { newline: true });
}
`);
  execFileSync('bun', ['build', resolve(work, 'entry.js'), '--target=browser', '--format=esm', '--minify', `--outfile=${resolve(out, 'renderer.js')}`], { stdio: 'inherit' });
  for (const [pkg, file, dest] of [
    ['echarts', 'LICENSE', 'LICENSE.echarts'], ['echarts', 'NOTICE', 'NOTICE.echarts'],
    ['zrender', 'LICENSE', 'LICENSE.zrender'], ['tslib', 'LICENSE.txt', 'LICENSE.tslib'],
    ['tslib', 'CopyrightNotice.txt', 'NOTICE.tslib'],
  ]) await copyFile(resolve(work, 'node_modules', pkg, file), resolve(out, dest));
} finally {
  await rm(work, { recursive: true, force: true });
}

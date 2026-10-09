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
  await writeFile(resolve(work, 'entry.js'), `import { init, use } from 'echarts/core';\nimport { BarChart, LineChart, PieChart, ScatterChart } from 'echarts/charts';\nimport { GridComponent } from 'echarts/components';\nimport { SVGRenderer } from 'echarts/renderers';\nuse([BarChart, LineChart, PieChart, ScatterChart, GridComponent, SVGRenderer]);\nexport { init };\n`);
  execFileSync('bun', ['build', resolve(work, 'entry.js'), '--target=browser', '--format=esm', '--minify', `--outfile=${resolve(out, 'renderer.js')}`], { stdio: 'inherit' });
  for (const [pkg, file, dest] of [
    ['echarts', 'LICENSE', 'LICENSE.echarts'], ['echarts', 'NOTICE', 'NOTICE.echarts'],
    ['zrender', 'LICENSE', 'LICENSE.zrender'], ['tslib', 'LICENSE.txt', 'LICENSE.tslib'],
    ['tslib', 'CopyrightNotice.txt', 'NOTICE.tslib'],
  ]) await copyFile(resolve(work, 'node_modules', pkg, file), resolve(out, dest));
} finally {
  await rm(work, { recursive: true, force: true });
}

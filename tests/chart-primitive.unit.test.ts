import { describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Chart, ChartShowcase, type QuantitativeChartProps } from '../components/Chart/Chart';
import { chartTheme } from '../components/Chart/composition';
const render = (props: Partial<QuantitativeChartProps> = {}) => renderToStaticMarkup(createElement(Chart, {
  title: 'Comparison', categories: ['One', 'Two'], series: [{ name: 'Current', values: [12, 20] }], ...props,
}));

describe('finished Chart primitive', () => {
  test('renderer geometry is identical with and without a browser canvas', () => {
    const renderer = new URL('../components/Chart/Chart.vendor/renderer.js', import.meta.url).href;
    const run = (browser: boolean) => {
      const source = `${browser ? `globalThis.document = { documentElement: { style: {} }, createElement() { throw new Error('Static chart must not measure with canvas'); } };` : ''}
        const { init } = await import(${JSON.stringify(renderer)});
        const chart = init(null, undefined, { renderer: 'svg', ssr: true, width: 320, height: 320 });
        chart.setOption({ animation: false, textStyle: { fontFamily: 'var(--font-sans)' }, grid: { outerBounds: { left: 8, right: 8, top: 8, bottom: 8 } }, xAxis: { type: 'category', data: ['First', 'Second'] }, yAxis: { type: 'value', axisLabel: { fontFamily: 'var(--font-sans)', fontSize: 14 } }, series: [{ type: 'bar', data: [900000, 1800000] }] });
        console.log(JSON.stringify([...chart.renderToSVGString().matchAll(/<text\\b[^>]*>[\\s\\S]*?<\\/text>/g)].map(match => match[0])));
        chart.dispose();`;
      const result = Bun.spawnSync([process.execPath, '-e', source]);
      expect(result.exitCode).toBe(0);
      return result.stdout.toString().trim();
    };
    expect(run(true)).toBe(run(false));
  });
  test('million-value ticks reserve loaded-font room at every layout and theme size', () => {
    const before = { ...chartTheme.typography };
    try {
      chartTheme.typography.fontFamily = 'var(--font-sans)';
      for (const size of [14, 20, 24]) {
        chartTheme.typography.labelSize = size;
        const html = render({ categories: ['First', 'Second'], series: [{ name: 'Sales', values: [900000, 1800000] }] });
        const ticks = [...html.matchAll(/<text\b[^>]*transform="translate\(([-\d.]+) [^"]+"[^>]*>1,800,000<\/text>/g)];
        expect(ticks.length).toBe(4);
        for (const tick of ticks) {
          expect(tick[0]).toContain(`font-size:${size}px`);
          expect(tick[0]).toContain('font-family:var(--font-sans)');
          // Recorded loaded-font browser width at 14px; the former canvas path
          // placed this at x47.49 and clipped almost 20px from the label's start.
          expect(Number(tick[1]) - 67.477 * size / 14).toBeGreaterThanOrEqual(8);
        }
      }
    } finally { Object.assign(chartTheme.typography, before); }
  });
  test('Cartesian layouts preserve type size and short date labels without hydration', () => {
    const html = render({ categories: ['Q1 2025', 'Q2 2025'], series: [{ name: 'Sales', values: [12, 20] }] });
    expect([...html.matchAll(/<svg width="(\d+)"/g)].map((match) => Number(match[1]))).toEqual([320, 480, 640, 800]);
    for (const plot of html.match(/<svg\b[\s\S]*?<\/svg>/g) ?? []) {
      expect(plot).toContain(`font-size:${chartTheme.typography.labelSize}px`);
      expect(plot).toMatch(/<text\b[^>]*>Q1 2025<\/text>/);
      expect(plot).toMatch(/<text\b[^>]*>Q2 2025<\/text>/);
    }
    expect(html).toContain('container-name:kopla-cartesian');
    expect(html).toContain('min-width:320px');
    expect(html).toContain('width:320px;min-width:320px;margin-inline:auto');
    expect(html).toContain('max-width:800px');
  });
  test('dense categories wrap their labels to the width, then scroll with a visible hint, retaining every tick', () => {
    const categories = Array.from({ length: 8 }, (_, i) => `Q${i + 1} 2025`);
    const html = render({ categories, series: [{ name: 'Sales', values: categories.map((_, i) => 1000000 + i * 100000) }] });
    const plots = html.match(/<svg\b[\s\S]*?<\/svg>/g) ?? [];
    expect(plots.length).toBeGreaterThan(0);
    for (const plot of plots) {
      // Never narrower than the per-category floor (the longest word, 48px at
      // least) plus the axis budget; at that width a label wraps at its space
      // ("Q1" over "2025") rather than the plot scrolling, and never inside a word.
      expect(Number(plot.match(/width="(\d+)"/)?.[1])).toBeGreaterThanOrEqual(8 * 48 + 112);
      const words = plot.replace(/<[^>]+>/g, ' ');
      for (const category of categories) for (const word of category.split(' ')) expect(words).toContain(word);
    }
    expect(html).toContain('Scroll to see the full chart.');
    expect(html).toContain('tabindex="0" role="region" aria-label="Comparison chart;');
    expect(html).toContain('max-w-full overflow-x-auto');
  });
  test('extreme category density has bounded SVG width and preserves full source labels', () => {
    const categories = Array.from({ length: 100 }, (_, i) => `A very long category with complete source wording ${i}`);
    const html = render({ categories, series: [{ name: 'Sales', values: categories.map((_, i) => i + 1) }] });
    expect([...html.matchAll(/<svg width="(\d+)"/g)].map((match) => Number(match[1]))).toEqual([2400]);
    const table = html.split('<details')[1] ?? '';
    for (const category of categories) expect(table).toContain(category);
    expect(table.match(/scope="row"/g)?.length).toBe(100);
  });
  test('numeric observations do not trigger categorical scrolling', () => {
    const html = render({ variant: 'scatter', categories: undefined, series: [{ name: 'Samples', values: Array.from({ length: 100 }, (_, i) => ({ x: i, y: i * i })) }] });
    expect([...html.matchAll(/<svg width="(\d+)"/g)].map((match) => Number(match[1]))).toEqual([320, 480, 640, 800]);
  });
  test('large numeric x/y labels have separate line boxes at the origin', () => {
    const before = chartTheme.typography.labelSize;
    try {
      chartTheme.typography.labelSize = 24;
      const html = render({ variant: 'bubble', categories: undefined, series: [{ name: 'First', values: [{ x: 740000, y: 860000, size: 820 }] }, { name: 'Second', values: [{ x: 1210000, y: 1700000, size: 1320 }] }] });
      for (const plot of html.match(/<svg\b[\s\S]*?<\/svg>/g) ?? []) {
        const zero = plot.match(/<text\b[^>]*text-anchor="end"[^>]*transform="translate\([-\d.]+ ([-\d.]+)\)"[^>]*>0<\/text>/);
        expect(zero).not.toBeNull();
        const xLabels = [...plot.matchAll(/<text\b[^>]*text-anchor="middle"[^>]*y="([-\d.]+)"[^>]*transform="translate\([-\d.]+ ([-\d.]+)\)"[^>]*>/g)];
        expect(xLabels.length).toBeGreaterThan(0);
        for (const label of xLabels) {
          // This loaded-font line box is taller than the nominal 24px. The old
          // fixed 8px margin let the two perpendicular axes' labels intersect.
          expect(Number(label[1]) + Number(label[2]) - Number(zero![1])).toBeGreaterThan(28.6);
        }
      }
    } finally { chartTheme.typography.labelSize = before; }
  });
  test('long circular labels reserve their actual wrapped heights with larger typography', () => {
    const fixture = ChartShowcase.find((state) => state.label === 'Dense circular labels')!;
    const before = chartTheme.typography.labelSize;
    try {
      for (const size of [12, 14, 20, 24]) {
        chartTheme.typography.labelSize = size;
        const html = render(fixture.props as QuantitativeChartProps);
        const plots = html.match(/<svg\b[\s\S]*?<\/svg>/g) ?? [];
        expect(plots.length).toBe(2);
        for (const plot of plots) {
          // Each outside label is one <text> of tspans; its block is the first
          // line's top to the last line's bottom. Same-side blocks never overlap
          // and every block sits inside the canvas, at every type size.
          const bounds = [...plot.matchAll(/<text x="([\d.]+)" y="([\d.]+)"[^>]*font-size="(\d+)"[^>]*>([\s\S]*?)<\/text>/g)]
            .map((match) => { const lines = (match[4].match(/<tspan/g) ?? []).length || 1; const top = Number(match[2]) - Number(match[3]) * 0.85; return { x: Number(match[1]), top, bottom: top + lines * Math.ceil(Number(match[3]) * 1.4) }; });
          expect(bounds.length).toBe(10);
          const height = Number(plot.match(/height="(\d+)"/)?.[1]);
          for (const [i, box] of bounds.entries()) {
            expect(box.top).toBeGreaterThanOrEqual(0);
            expect(box.bottom).toBeLessThanOrEqual(height);
            for (const other of bounds.slice(i + 1)) if (box.x === other.x)
              expect(box.top >= other.bottom || box.bottom <= other.top).toBe(true);
          }
        }
      }
    } finally { chartTheme.typography.labelSize = before; }
  });
  for (const state of ChartShowcase) test(`SSR ${state.label}`, () => {
    const html = render(state.props as QuantitativeChartProps);
    expect(html).toContain('<table');
    expect(html).toContain('scope="col"');
    expect(html).toContain('<figcaption');
    if (state.props.series.length) {
      expect(html).toContain('<svg');
      expect(html).toContain('<path');
    }
    expect(html).not.toMatch(/NaN|Infinity/);
  });
  test('keeps arbitrary explicit x categories and source observations', () => {
    const html = render({ categories: ['One'], series: [{ name: 'Data', values: [{ x: 'One', y: 1 }, { x: 'Unexpected', y: 9 }] }] });
    expect(html).toContain('Unexpected');
    expect(html.match(/scope="row"/g)?.length).toBe(2);
  });
  test('invalid values are gaps and never invalid SVG coordinates', () => {
    const html = render({ variant: 'line', categories: undefined, series: [{ name: 'Data', values: [{ x: 0, y: 2 }, { x: 1, y: null }, { x: 2, y: 5 }, { x: Infinity, y: 3 }, { x: 3, y: NaN }] }] });
    expect(html).toContain('<svg');
    expect(html).not.toMatch(/NaN|Infinity/);
    expect(html.match(/scope="row"/g)?.length).toBe(5);
    expect(html).toContain('—');
  });
  test('pie rejects negative values and zero-only data has no misleading circle', () => {
    expect(render({ variant: 'pie', series: [{ name: 'Data', values: [1, -1] }] })).toContain('require nonnegative');
    const zero = render({ variant: 'donut', series: [{ name: 'Data', values: [0, 0] }] });
    expect(zero).toContain('No positive values');
    expect(zero).not.toContain('<svg');
  });
  test('duplicates fail visibly while preserving the source table', () => {
    const html = render({ series: [{ name: 'Data', values: [{ x: 'One', y: 1 }, { x: 'One', y: 2 }] }] });
    expect(html).toContain('one observation per category');
    expect(html.match(/scope="row"/g)?.length).toBe(2);
  });
  test('brand frame wraps the plot and keeps source data accessible', () => {
    const html = render({ frame: createElement('aside', { 'data-frame': 'brand' }) });
    expect(html).toContain('<aside data-frame="brand"><div');
    expect(html).toContain('</aside><details');
  });
  test('role palette comes only from the separate brand theme', () => {
    const before = chartTheme.seriesRoles.focus;
    try {
      chartTheme.seriesRoles.focus = '#123456';
      expect(render({ series: [{ name: 'Focus', role: 'focus', values: [1, 2] }] })).toContain('fill="#123456"');
    } finally { chartTheme.seriesRoles.focus = before; }
  });
  test('empty categorical palette falls back to focus without invalid paint', () => {
    const before = chartTheme.seriesRoles.categorical;
    try {
      chartTheme.seriesRoles.categorical = [];
      const html = render();
      expect(html).not.toContain('fill="undefined"');
      expect(html).toContain('<svg');
    } finally { chartTheme.seriesRoles.categorical = before; }
  });
  test('labels and data cannot inject markup into SVG or the table', () => {
    const html = render({ title: '<script>bad()</script>', categories: ['<img src=x onerror=bad()>'], series: [{ name: '<script>bad()</script>', values: [1] }] });
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img src=x');
  });
  for (const variant of ['pie', 'donut'] as const) test(`${variant} identifies every slice in the visible SSR plot`, () => {
    const html = render({ variant, categories: ['Enterprise', 'Mid-market', 'Small business'], series: [{ name: 'Revenue', values: [960000, 465000, 275000] }] });
    const plots = html.match(/<svg\b[\s\S]*?<\/svg>/g) ?? [];
    expect(plots.length).toBeGreaterThan(0);
    for (const plot of plots) {
      const visibleText = [...plot.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map((match) => match[1].replace(/<[^>]+>/g, ' ')).join(' ').replace(/\s+/g, '');
      for (const text of ['Enterprise', 'Mid-market', 'Small business', '56.5%', '27.4%', '16.2%']) expect(visibleText).toContain(text.replace(/\s+/g, ''));
    }
    // The default composition draws no key under a small pie — the circle
    // already says name and share — and the source table keeps every value.
    const [visibleFigure, table] = html.split('<details');
    expect(visibleFigure).not.toContain('data-chart-key');
    expect(table).toContain('960000');
    expect(table).toContain('465000');
  });
  test('donut center content is authored and escaped', () => {
    const html = render({ variant: 'donut', centerValue: '56.5%', centerLabel: 'Enterprise share' });
    const plotRegion = html.split('<details')[0] ?? '';
    expect(plotRegion).toContain('56.5%');
    expect(plotRegion).toContain('Enterprise share');
    const hostile = render({ variant: 'donut', centerValue: '<script>bad()</script>', centerLabel: '<img src=x onerror=bad()>' });
    expect(hostile).not.toContain('<script>');
    expect(hostile).not.toContain('<img src=x');
    expect(render({ variant: 'donut' })).not.toContain('Enterprise share');
  });
  test('formats pie values and shares using the requested locale', () => {
    const html = render({ variant: 'pie', locale: 'de-DE', categories: ['Enterprise', 'Other'], series: [{ name: 'Revenue', values: [960000, 740000] }] });
    // The share on the circle is locale-formatted; the exact value lives in the table.
    expect(html.split('<details')[0]).toContain('56,5');
    expect(html.split('<details')[1]).toContain('960000');
  });
  test('tiny, zero and missing shares remain truthful', () => {
    const html = render({ variant: 'donut', categories: ['Main category', 'Tiny category', 'Zero', 'Missing'], series: [{ name: 'Data', values: [9999, 1, 0, null] }] });
    for (const plot of html.match(/<svg\b[\s\S]*?<\/svg>/g) ?? []) {
      const text = [...plot.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map((match) => match[1].replace(/<[^>]+>/g, '')).join(' ');
      expect(text).toContain('Tiny');
      expect(text).toContain('&lt;0.1%');
      expect(text).toContain('&gt;99.9%');
    }
    expect(html).toContain('Missing');
    expect(html).toContain('—');
    expect(html).not.toMatch(/NaN|Infinity/);
  });
  test('the source table retains precise values, and a key formats them without losing digits', () => {
    const html = render({ variant: 'pie', categories: ['Large', 'Small'], series: [{ name: 'Data', values: [1000000000000001, 0.1234567890123456] }] });
    const table = html.split('<details')[1];
    expect(table).toContain('1000000000000001');
    expect(table).toContain('0.1234567890123456');
    // Ten sectors and up draw the key; its values keep every digit.
    const many = render({ variant: 'pie', categories: Array.from({ length: 10 }, (_, i) => `C${String(i)}`), series: [{ name: 'Data', values: [1000000000000001, 0.1234567890123456, 1, 1, 1, 1, 1, 1, 1, 1] }] });
    const figure = many.split('<details')[0];
    expect(figure).toContain('data-chart-key');
    expect(figure).toContain('1,000,000,000,000,001');
    expect(figure).toContain('0.1234567890123456');
  });
  test('finite large circular values do not overflow the share calculation', () => {
    const html = render({ variant: 'pie', categories: ['First', 'Second'], series: [{ name: 'Data', values: [1e308, 1e308] }] });
    const plots = html.match(/<svg\b[\s\S]*?<\/svg>/g) ?? [];
    expect(plots.length).toBeGreaterThan(0);
    for (const plot of plots) expect(plot).toContain('50%');
    expect(html).not.toMatch(/NaN|Infinity/);
  });
  test('positive slices keep labels when their relative size underflows', () => {
    const html = render({ variant: 'donut', categories: ['Large', 'Tiny'], series: [{ name: 'Data', values: [1e308, 1e-300] }] });
    const plots = html.match(/<svg\b[\s\S]*?<\/svg>/g) ?? [];
    expect(plots.length).toBeGreaterThan(0);
    for (const plot of plots) {
      const text = [...plot.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map((match) => match[1].replace(/<[^>]+>/g, '')).join(' ');
      expect(text).toContain('Tiny');
      expect(text).toContain('&lt;0.1%');
      expect(text).toContain('&gt;99.9%');
    }
  });
  test('near-full donut sectors keep noncollapsed outer and inner arcs at both layout sizes', () => {
    for (const values of [[9999, 1], [999999, 1], [1e308, 1e-300], [1, 0]]) {
      const html = render({ variant: 'donut', categories: ['Dominant', 'Tiny'], series: [{ name: 'Data', values }] });
      const plots = html.match(/<svg\b[\s\S]*?<\/svg>/g) ?? [];
      expect(plots.length).toBe(2);
      for (const plot of plots) {
        const sectors = [...plot.matchAll(/<path d="([^"]*)" fill="(?!none)[^"]*"/g)].map((match) => match[1]);
        // The dominant sector draws as a near-full ring (one large-arc sweep
        // with distinct endpoints) or, past the point an arc can express it,
        // as two half arcs — never as a collapsed arc whose endpoints coincide.
        const dominant = sectors.find((d) => /A[\d.]+ [\d.]+ 0 1 1/.test(d));
        expect(dominant).toBeDefined();
        const arcs = [...dominant!.matchAll(/([ML])(-?[\d.]+) (-?[\d.]+) ?A([\d.]+) ([\d.]+) 0 ([01]) ([01]) (-?[\d.]+) (-?[\d.]+)/g)];
        expect(arcs.length).toBeGreaterThanOrEqual(2);
        for (const arc of arcs) {
          const distance = Math.hypot(Number(arc[8]) - Number(arc[2]), Number(arc[9]) - Number(arc[3]));
          expect(distance).toBeGreaterThan(0);
        }
        // Both contours of the ring are present: an outer radius and a smaller inner one.
        const radii = new Set(arcs.map((arc) => Number(arc[4])));
        expect(radii.size).toBe(2);
      }
    }
  });
  test('every circular panel computes its own shares', () => {
    const html = render({ variant: 'donut', categories: ['2025', '2026'], series: [{ name: 'First', values: [1, 3] }, { name: 'Second', values: [3, 1] }] });
    const plots = html.match(/<svg\b[\s\S]*?<\/svg>/g) ?? [];
    expect(plots.length).toBeGreaterThanOrEqual(2);
    for (const plot of plots) {
      expect(plot).toContain('25%');
      expect(plot).toContain('75%');
      expect(plot).toContain('First');
      expect(plot).toContain('Second');
    }
  });

});

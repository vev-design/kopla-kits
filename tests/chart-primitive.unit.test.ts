import { describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Chart, ChartShowcase, type QuantitativeChartProps } from '../components/Chart/Chart';
import { chartTheme } from '../components/Chart/theme';
const render = (props: Partial<QuantitativeChartProps> = {}) => renderToStaticMarkup(createElement(Chart, {
  title: 'Comparison', categories: ['One', 'Two'], series: [{ name: 'Current', values: [12, 20] }], ...props,
}));

describe('finished Chart primitive', () => {
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
      const visibleText = [...plot.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map((match) => match[1]).join(' ');
      for (const text of ['Enterprise', 'Mid-market', 'Small business', '56.5%', '27.4%', '16.2%']) expect(visibleText).toContain(text);
    }
    const visibleFigure = html.split('<details')[0] ?? '';
    expect(visibleFigure).toContain('960,000');
    expect(visibleFigure).toContain('465,000');
    expect(visibleFigure).not.toContain(': 960000');
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
    expect(html).toContain('960.000');
    expect(html).toContain('56,5');
  });
  test('tiny, zero and missing shares remain truthful', () => {
    const html = render({ variant: 'donut', categories: ['Main category', 'Tiny category', 'Zero', 'Missing'], series: [{ name: 'Data', values: [9999, 1, 0, null] }] });
    for (const plot of html.match(/<svg\b[\s\S]*?<\/svg>/g) ?? []) {
      const text = [...plot.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map((match) => match[1]).join(' ');
      expect(text).toContain('Tiny');
      expect(text).toContain('&lt;0.1%');
      expect(text).toContain('&gt;99.9%');
    }
    expect(html).toContain('Missing');
    expect(html).toContain('—');
    expect(html).not.toMatch(/NaN|Infinity/);
  });
  test('formatted circular keys retain precise values and source observations', () => {
    const html = render({ variant: 'pie', categories: ['Large', 'Small'], series: [{ name: 'Data', values: [1000000000000001, 0.1234567890123456] }] });
    const [figure, table] = html.split('<details');
    expect(figure).toContain('1,000,000,000,000,001');
    expect(figure).toContain('0.1234567890123456');
    expect(table).toContain('1000000000000001');
    expect(table).toContain('0.1234567890123456');
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
      const text = [...plot.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map((match) => match[1]).join(' ');
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
        const dominant = [...plot.matchAll(/<path\b[^>]*>/g)].map((match) => match[0]).find((path) => / d="[^"]*A/.test(path));
        expect(dominant).toBeDefined();
        expect(dominant).not.toContain('fill="none"');
        const path = dominant!.match(/ d="([^"]*)"/)![1]!;
        // A large arc whose endpoint rounds back to its start draws nothing.
        // Check the actual outer and inner contours, not merely an SVG/path tag.
        const arcs = [...path.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)A([\d.]+) ([\d.]+) ([\d.]+) ([01]) ([01]) (-?[\d.]+) (-?[\d.]+)/g)];
        expect(arcs.length).toBe(2);
        for (const arc of arcs) {
          expect(arc[6]).toBe('1');
          const distance = Math.hypot(Number(arc[8]) - Number(arc[1]), Number(arc[9]) - Number(arc[2]));
          expect(distance).toBeGreaterThan(0);
          expect(distance).toBeLessThan(1);
        }
        expect(arcs[0]![7]).toBe('1');
        expect(arcs[1]![7]).toBe('0');
        expect(Number(arcs[1]![3])).toBeLessThan(Number(arcs[0]![3]));
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

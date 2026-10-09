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
});

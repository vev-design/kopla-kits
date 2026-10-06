import { describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BarChart, PieChart, LineChart, createBrandedCharts, defaultChartBrand, type ChartBrand,
  type BarChartProps, type PieChartProps, type LineChartProps } from '../components/Charts/Charts';

const bar = (props: Partial<BarChartProps> = {}) => renderToStaticMarkup(createElement(BarChart, {
  title: 'Comparison', series: [{ id: 'a', label: 'Alpha' }, { id: 'b', label: 'Beta' }],
  data: [{ id: 'one', label: 'One', values: { a: 12, b: -8 } }], ...props,
}));
const pie = (props: Partial<PieChartProps> = {}) => renderToStaticMarkup(createElement(PieChart, {
  title: 'Shares', data: [{ id: 'a', label: 'Alpha', value: 75 }, { id: 'b', label: 'Beta', value: 25 }], ...props,
}));
const line = (props: Partial<LineChartProps> = {}) => renderToStaticMarkup(createElement(LineChart, {
  title: 'Trend', series: [{ id: 'a', label: 'Alpha' }], data: [
    { id: 'one', label: 'One', values: { a: 12 } }, { id: 'two', label: 'Two', values: { a: 20 } },
  ], ...props,
}));
const marks = (html: string, name: string) => [...html.matchAll(new RegExp(`<[^>]+ data-${name}=""[^>]*>`, 'g'))].map((m) => m[0]);
const attr = (mark: string, name: string) => new RegExp(`(?:^| )${name}="([^"]*)"`).exec(mark)?.[1];
const n = (mark: string, name: string) => Number(attr(mark, name));
const base = defaultChartBrand.surfaces!.default!;
const red = { color: '#c00030', labelColor: '#ffffff' };
const purple = { color: '#420035', labelColor: '#ffffff' };
const brand: ChartBrand = { version: 1, seriesOrder: ['a', 'b'], surfaces: { default: {
  ...base, categorical: [red, purple], emphasis: { focus: red, context: [purple] },
  semantic: { positive: red, negative: purple, neutral: purple, other: purple },
} } };

describe('chart brand rules', () => {
  test('persistent palette registry survives filtering and sorting', () => {
    const full = marks(bar({ brand }), 'bar');
    const filtered = marks(bar({ brand, series: [{ id: 'b', label: 'Beta' }] }), 'bar');
    const reordered = marks(bar({ brand, series: [{ id: 'b', label: 'Beta' }, { id: 'a', label: 'Alpha' }] }), 'bar');
    expect(attr(full[1]!, 'fill')).toBe('#420035');
    expect(attr(filtered[0]!, 'fill')).toBe(attr(full[1]!, 'fill'));
    expect(attr(reordered[0]!, 'fill')).toBe(attr(full[1]!, 'fill'));
  });
  test('highlight uses the emphasis palette; semantic meaning has its own colors', () => {
    expect(attr(marks(bar({ brand, highlight: ['b'] }), 'bar')[1]!, 'fill')).toBe('#c00030');
    const semantic = marks(bar({ brand, colorMode: 'semantic', highlight: ['b'], series: [
      { id: 'a', label: 'Alpha', role: 'positive' }, { id: 'b', label: 'Beta', role: 'negative' },
    ] }), 'bar');
    expect(attr(semantic[1]!, 'fill')).toBe('#420035');
  });
  test('explicit assignments override categorical palette positions', () => {
    const html = bar({ brand: { ...brand, surfaces: { default: { ...base, series: { a: red } } } } });
    expect(attr(marks(html, 'bar')[0]!, 'fill')).toBe('#c00030');
  });
  test('a prohibited surface renders a visible table instead of an unapproved chart', () => {
    const html = bar({ brand: { version: 1, surfaces: { default: { ...base, allowedCharts: ['donut'] } } } });
    expect(html).not.toContain('<svg');
    expect(html).toContain('data-chart-unavailable');
    expect(html).toContain('<table');
    expect(html).not.toContain('class="sr-only"');
  });
  test('unknown surfaces, versions, and empty palettes fail explicitly', () => {
    expect(() => bar({ surface: 'missing' })).toThrow('not defined');
    expect(() => bar({ brand: { version: 2 } as unknown as ChartBrand })).toThrow('version');
    expect(() => bar({ brand: { version: 1, surfaces: { default: { ...base, categorical: [] } } } })).toThrow('nonempty');
  });
  test('bound brands remain isolated across repeated renders', () => {
    const first = createBrandedCharts(brand);
    const second = createBrandedCharts({ version: 1 });
    const props: PieChartProps = { title: 'One', data: [{ id: 'a', label: 'A', value: 1 }] };
    const renderFirst = () => renderToStaticMarkup(createElement(first.PieChart, props));
    const before = renderFirst();
    expect(renderToStaticMarkup(createElement(second.PieChart, props))).not.toContain('fill="#c00030"');
    expect(renderFirst()).toBe(before);
  });
  test('brand motion defaults can be disabled at the chart', () => {
    const animated = { ...brand, motion: { enabled: true, durationMs: 9000 } };
    expect(bar({ brand: animated })).toContain('data-animate="true"');
    expect(bar({ brand: animated })).toContain('--kk-chart-duration:2000ms');
    expect(bar({ brand: animated, animation: 'none' })).not.toContain('data-animate="true"');
  });
});

describe('truthful chart geometry and data', () => {
  test('stacked bars grow on separate sides of zero in both orientations', () => {
    for (const orientation of ['vertical', 'horizontal'] as const) {
      const html = bar({ orientation, layout: 'stacked', series: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }],
        data: [{ id: 'one', label: 'One', values: { a: 12, b: -8, c: -4 } }] });
      const [positive, negative, next] = marks(html, 'bar');
      const baseline = marks(html, 'baseline')[0]!;
      if (orientation === 'vertical') {
        expect(n(positive!, 'y') + n(positive!, 'height')).toBeCloseTo(n(baseline, 'y1'));
        expect(n(negative!, 'y')).toBeCloseTo(n(baseline, 'y1'));
        expect(n(next!, 'y')).toBeCloseTo(n(negative!, 'y') + n(negative!, 'height'));
      } else {
        expect(n(positive!, 'x')).toBeCloseTo(n(baseline, 'x1'));
        expect(n(negative!, 'x') + n(negative!, 'width')).toBeCloseTo(n(baseline, 'x1'));
        expect(n(next!, 'x') + n(next!, 'width')).toBeCloseTo(n(negative!, 'x'));
      }
    }
  });
  test('missing line observations split paths and isolated values remain visible', () => {
    const html = line({ data: [
      { id: '1', label: '1', values: { a: 10 } }, { id: '2', label: '2', values: { a: 20 } },
      { id: '3', label: '3', values: { a: null } }, { id: '4', label: '4', values: { a: 30 } },
    ] });
    expect(marks(html, 'line')).toHaveLength(2);
    expect(n(marks(html, 'point')[2]!, 'r')).toBeGreaterThan(0);
    expect(html).toContain('No data');
  });
  test('stack totals report each side of zero independently', () => {
    const html = bar({ layout: 'stacked', totals: true });
    expect(marks(html, 'stack-total')).toHaveLength(2);
    expect(html).toMatch(/data-stack-total=""[^>]*>12<\/text>/);
    expect(html).toMatch(/data-stack-total=""[^>]*>-8<\/text>/);
  });
  test('full circles use two arcs and zero shares never draw a fake slice', () => {
    for (const variant of ['pie', 'donut'] as const) {
      const html = pie({ variant, data: [{ id: 'a', label: 'A', value: 100 }, { id: 'b', label: 'B', value: 0 }] });
      const slices = marks(html, 'slice');
      expect(slices).toHaveLength(1);
      expect(attr(slices[0]!, 'd')?.match(/ A/g)?.length).toBe(variant === 'pie' ? 2 : 4);
      expect(html).toContain('100%');
    }
  });
  test('zero, empty and missing inputs produce honest states', () => {
    expect(pie({ data: [{ id: 'a', label: 'A', value: 0 }] })).toContain('No data to display');
    expect(bar({ data: [] })).not.toContain('<svg');
    expect(line({ data: [{ id: 'a', label: 'A', values: { a: null } }] })).not.toContain('<svg');
    expect(bar({ data: [{ id: 'a', label: 'A', values: { a: 0, b: 0 } }] })).toContain('<svg');
  });
  test('rejects invalid values and ambiguous duplicate IDs', () => {
    expect(() => pie({ data: [{ id: 'a', label: 'A', value: -1 }] })).toThrow('nonnegative');
    expect(() => pie({ data: [{ id: 'a', label: 'A', value: Infinity }] })).toThrow('finite');
    expect(() => bar({ data: [{ id: 'a', label: 'A', values: { a: NaN } }] })).toThrow('Invalid value');
    expect(() => bar({ series: [{ id: 'a', label: 'A' }, { id: 'a', label: 'B' }] })).toThrow('unique');
    expect(() => bar({ layout: 'stacked', data: [{ id: 'a', label: 'A', values: { a: 1e308, b: 1e308 } }] })).toThrow('Rescale');
  });
  test('large and tiny finite values retain finite geometry', () => {
    for (const value of [1e-200, 1e200, 1e308]) {
      const html = bar({ data: [{ id: 'a', label: 'A', values: { a: value, b: -value } }] });
      for (const mark of marks(html, 'bar')) for (const key of ['x', 'y', 'width', 'height']) expect(Number.isFinite(n(mark, key))).toBe(true);
      const circular = pie({ data: [{ id: 'a', label: 'A', value }, { id: 'b', label: 'B', value }] });
      for (const mark of marks(circular, 'slice')) expect(attr(mark, 'd')).not.toMatch(/NaN|Infinity/);
    }
    const constant = line({ includeZero: false, data: [
      { id: 'a', label: 'A', values: { a: Number.MAX_VALUE } }, { id: 'b', label: 'B', values: { a: Number.MAX_VALUE } },
    ] });
    expect(attr(marks(constant, 'line')[0]!, 'd')).not.toMatch(/NaN|Infinity/);
  });
  test('formatting is explicit and complete labels survive abbreviation', () => {
    const html = bar({ locale: 'de-DE', numberFormat: { maximumFractionDigits: 1 }, suffix: ' kg', data: [
      { id: 'a', label: 'A deliberately long category label that must remain accessible', values: { a: 1234.5 } },
    ] });
    expect(html).toContain('1.234,5 kg');
    expect(html).toContain('A deliberately long category label that must remain accessible');
    expect(html).toContain('scope="row"');
  });
  test('fraction precision defaults respect a supplied minimum in every chart', () => {
    for (const render of [bar, pie, line]) {
      const html = render({ numberFormat: { minimumFractionDigits: 3 }, suffix: ' kg' });
      expect(html).toContain('.000 kg');
      expect(render({ numberFormat: { minimumFractionDigits: 3, maximumFractionDigits: 4 } })).toContain('.000');
    }
    expect(bar({ data: [{ id: 'one', label: 'One', values: { a: 1.23456 } }] })).toContain('1.23');
    expect(bar({ numberFormat: { minimumFractionDigits: 3 }, data: [
      { id: 'one', label: 'One', values: { a: 1.2 } },
    ] })).toContain('1.200');
  });
});

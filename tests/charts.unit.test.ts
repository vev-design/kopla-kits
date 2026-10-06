import { describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BarChart, PieChart, LineChart, ScatterChart, BubbleChart, createBrandedCharts, defaultChartBrand, type ChartBrand,
  type BarChartProps, type PieChartProps, type LineChartProps, type ScatterChartProps, type BubbleChartProps } from '../components/Charts/Charts';

const bar = (props: Partial<BarChartProps> = {}) => renderToStaticMarkup(createElement(BarChart, {
  sizing: 'scroll', title: 'Comparison', series: [{ id: 'a', label: 'Alpha' }, { id: 'b', label: 'Beta' }],
  data: [{ id: 'one', label: 'One', values: { a: 12, b: -8 } }], ...props,
}));
const pie = (props: Partial<PieChartProps> = {}) => renderToStaticMarkup(createElement(PieChart, {
  sizing: 'scroll', title: 'Shares', data: [{ id: 'a', label: 'Alpha', value: 75 }, { id: 'b', label: 'Beta', value: 25 }], ...props,
}));
const line = (props: Partial<LineChartProps> = {}) => renderToStaticMarkup(createElement(LineChart, {
  sizing: 'scroll', title: 'Trend', series: [{ id: 'a', label: 'Alpha' }], data: [
    { id: 'one', label: 'One', values: { a: 12 } }, { id: 'two', label: 'Two', values: { a: 20 } },
  ], ...props,
}));
const scatter = (props: Partial<ScatterChartProps> = {}) => renderToStaticMarkup(createElement(ScatterChart, {
  sizing: 'scroll', title: 'Relationship', series: [{ id: 'a', label: 'Alpha' }], data: [
    { id: 'one', label: 'One', seriesId: 'a', x: 0, y: 10 },
    { id: 'two', label: 'Two', seriesId: 'a', x: 10, y: 20 },
    { id: 'three', label: 'Three', seriesId: 'a', x: 40, y: 50 },
  ], ...props,
}));
const bubbles = (props: Partial<BubbleChartProps> = {}) => renderToStaticMarkup(createElement(BubbleChart, {
  sizing: 'scroll', title: 'Opportunities', series: [{ id: 'a', label: 'Alpha' }], data: [
    { id: 'one', label: 'One', seriesId: 'a', x: 10, y: 20, size: 25 },
    { id: 'two', label: 'Two', seriesId: 'a', x: 40, y: 50, size: 100 },
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
    expect(html).toMatch(/data-stack-total=""[^>]*>12<title>12<\/title><\/text>/);
    expect(html).toMatch(/data-stack-total=""[^>]*>-8<title>-8<\/title><\/text>/);
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

describe('scatter and bubble measurements', () => {
  test('numeric distances preserve irregular spacing and source order does not move a point', () => {
    const points = marks(scatter(), 'scatter-point');
    const first = n(points[1]!, 'cx') - n(points[0]!, 'cx');
    const second = n(points[2]!, 'cx') - n(points[1]!, 'cx');
    expect(second / first).toBeCloseTo(3, 4);
    const reversed = marks(scatter({ data: [
      { id: 'three', label: 'Three', seriesId: 'a', x: 40, y: 50 },
      { id: 'two', label: 'Two', seriesId: 'a', x: 10, y: 20 },
      { id: 'one', label: 'One', seriesId: 'a', x: 0, y: 10 },
    ] }), 'scatter-point');
    expect(n(reversed[0]!, 'cx')).toBe(n(points[2]!, 'cx'));
    expect(n(reversed[0]!, 'cy')).toBe(n(points[2]!, 'cy'));
  });
  test('circle area, not radius, encodes size; rings have the same outer areas', () => {
    for (const treatment of ['solid', 'rings'] as const) {
      const circles = marks(bubbles({ treatment }), 'bubble');
      // Larger circles are painted first to keep smaller coincident observations visible.
      expect(n(circles[0]!, 'r') ** 2 / n(circles[1]!, 'r') ** 2).toBeCloseTo(4, 8);
      expect(n(circles[0]!, 'r')).toBe(44);
    }
    expect(marks(bubbles({ treatment: 'rings' }), 'bubble-ring')).toHaveLength(14);
  });
  test('shared sizeMax keeps radius stable when a chart is filtered', () => {
    const full = marks(bubbles({ sizeMax: 200 }), 'bubble');
    const filtered = marks(bubbles({ sizeMax: 200, data: [
      { id: 'one', label: 'One', seriesId: 'a', x: 10, y: 20, size: 25 },
    ] }), 'bubble');
    expect(n(full[1]!, 'r')).toBe(n(filtered[0]!, 'r'));
    const references = marks(bubbles({ sizeMax: 200 }), 'size-reference');
    expect(references.map((mark) => n(mark, 'data-size'))).toEqual([50, 100, 200]);
    expect(n(references[2]!, 'r') ** 2 / n(references[0]!, 'r') ** 2).toBeCloseTo(4, 8);
  });
  test('null coordinates and zero or missing sizes remain data, not invented marks', () => {
    const html = bubbles({ data: [
      { id: 'zero', label: 'Zero', seriesId: 'a', x: 0, y: 0, size: 0 },
      { id: 'null', label: 'Missing size', seriesId: 'a', x: 2, y: 3, size: null },
      { id: 'x', label: 'Missing X', seriesId: 'a', x: null, y: 3, size: 20 },
      { id: 'valid', label: 'Valid', seriesId: 'a', x: 2, y: 3, size: 20 },
    ] });
    expect(marks(html, 'bubble')).toHaveLength(1);
    expect(html).toContain('Missing size');
    expect(html).toContain('Missing X');
    expect(html).toContain('No data');
    expect(bubbles({ data: [{ id: 'zero', label: 'Zero', seriesId: 'a', x: 0, y: 0, size: 0 }] })).not.toContain('<svg');
    expect(scatter({ data: [] })).toContain('No data to display');
  });
  test('negative and constant numeric domains remain finite, including huge values', () => {
    for (const value of [-1e308, -30, 0, 1e-300, 1e308]) {
      const html = scatter({ xAxis: { includeZero: false }, yAxis: { includeZero: false }, data: [
        { id: 'only', label: 'Only', seriesId: 'a', x: value, y: value },
      ] });
      const point = marks(html, 'scatter-point')[0]!;
      for (const key of ['cx', 'cy', 'r']) expect(Number.isFinite(n(point, key))).toBe(true);
    }
    for (const size of [1e-300, 1e308]) {
      const circles = marks(bubbles({ data: [
        { id: 'one', label: 'One', seriesId: 'a', x: -1e308, y: 1e308, size },
        { id: 'two', label: 'Two', seriesId: 'a', x: 1e308, y: -1e308, size: size / 4 },
      ] }), 'bubble');
      expect(n(circles[0]!, 'r') / n(circles[1]!, 'r')).toBeCloseTo(2, 8);
    }
  });
  test('bad IDs, sizes, coordinates, ceilings and domains fail explicitly', () => {
    const point = { id: 'one', label: 'One', seriesId: 'a', x: 10, y: 20, size: 25 };
    expect(() => scatter({ data: [{ ...point, seriesId: 'unknown' }] })).toThrow('Unknown series');
    expect(() => scatter({ data: [point, point] })).toThrow('unique');
    expect(() => scatter({ data: [{ ...point, x: Infinity }] })).toThrow('finite x');
    expect(() => scatter({ data: [{ ...point, y: NaN }] })).toThrow('finite y');
    expect(() => bubbles({ data: [{ ...point, size: -1 }] })).toThrow('nonnegative');
    expect(() => bubbles({ data: [{ ...point, size: Infinity }] })).toThrow('finite');
    for (const sizeMax of [0, -1, 50, Infinity, NaN]) expect(() => bubbles({ sizeMax })).toThrow('sizeMax');
    expect(() => scatter({ xAxis: { domain: [5, 5] } })).toThrow('increasing');
    expect(() => scatter({ xAxis: { domain: [5, 50] } })).toThrow('include every');
    expect(() => scatter({ yAxis: { domain: [0, Infinity] } })).toThrow('finite');
  });
  test('trend fits are per series, stop at observations, and omit vertical/underspecified fits', () => {
    const html = scatter({ trendLine: 'linear' });
    const fit = marks(html, 'trend-line')[0]!;
    const points = marks(html, 'scatter-point');
    expect(n(fit, 'x1')).toBe(n(points[0]!, 'cx'));
    expect(n(fit, 'y1')).toBe(n(points[0]!, 'cy'));
    expect(n(fit, 'x2')).toBe(n(points[2]!, 'cx'));
    expect(n(fit, 'y2')).toBe(n(points[2]!, 'cy'));
    expect(marks(scatter({ trendLine: 'linear', data: [
      { id: 'a', label: 'A', seriesId: 'a', x: 10, y: 20 }, { id: 'b', label: 'B', seriesId: 'a', x: 10, y: 40 },
    ] }), 'trend-line')).toHaveLength(0);
    expect(marks(scatter({ trendLine: 'linear', series: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], data: [
      { id: 'a1', label: 'A1', seriesId: 'a', x: 1, y: 2 }, { id: 'a2', label: 'A2', seriesId: 'a', x: 2, y: 4 },
      { id: 'b1', label: 'B1', seriesId: 'b', x: 1, y: 8 }, { id: 'b2', label: 'B2', seriesId: 'b', x: 2, y: 5 },
    ] }), 'trend-line')).toHaveLength(2);
  });
  test('series colors stay attached after bubble size sorting; semantic and emphasis rules apply', () => {
    const data = [
      { id: 'one', label: 'One', seriesId: 'a', x: 10, y: 20, size: 25 },
      { id: 'two', label: 'Two', seriesId: 'b', x: 40, y: 50, size: 100 },
    ];
    const series = [{ id: 'a', label: 'Alpha', role: 'positive' as const }, { id: 'b', label: 'Beta', role: 'negative' as const }];
    expect(marks(bubbles({ brand, data, series }), 'bubble').map((mark) => attr(mark, 'fill'))).toEqual(['#420035', '#c00030']);
    expect(attr(marks(bubbles({ brand, data, series, highlight: ['b'] }), 'bubble')[0]!, 'fill')).toBe('#c00030');
    expect(attr(marks(bubbles({ brand, data, series, colorMode: 'semantic', highlight: ['b'] }), 'bubble')[0]!, 'fill')).toBe('#420035');
  });
  test('both new kinds honor surface restrictions and bound brand settings', () => {
    const restricted: ChartBrand = { version: 1, surfaces: { default: { ...base, allowedCharts: ['bar'] } } };
    for (const render of [scatter, bubbles]) {
      expect(render({ brand: restricted })).not.toContain('<svg');
      expect(render({ brand: restricted })).toContain('data-chart-unavailable');
    }
    const configured = createBrandedCharts({ ...brand, scatter: { radius: 7 }, bubble: { maxRadius: 60, treatment: 'rings', ringCount: 4 } });
    const data = [{ id: 'one', label: 'One', seriesId: 'a', x: 1, y: 2, size: 4 }];
    const common = { sizing: 'scroll' as const, title: 'Bound', series: [{ id: 'a', label: 'A' }], data };
    expect(n(marks(renderToStaticMarkup(createElement(configured.ScatterChart, common)), 'scatter-point')[0]!, 'r')).toBe(7);
    const circle = renderToStaticMarkup(createElement(configured.BubbleChart, common));
    expect(n(marks(circle, 'bubble')[0]!, 'r')).toBe(60);
    expect(marks(circle, 'bubble-ring')).toHaveLength(3);
  });
  test('X, Y and size have independent units and formats in the accessible table', () => {
    const html = bubbles({ locale: 'en-US', xAxis: { label: 'Revenue', numberFormat: { style: 'currency', currency: 'USD' } },
      yAxis: { label: 'Margin', suffix: '%' }, sizeLabel: 'Customers', sizeSuffix: ' people', sizeNumberFormat: { minimumFractionDigits: 3 },
    });
    expect(html).toContain('$10.00');
    expect(html).toContain('20%');
    expect(html).toContain('25.000 people');
    expect(html).toContain('Customers');
  });
});


describe('responsive formatting', () => {
  test('compact axes keep full fractional values in the data table', () => {
    const html = bar({ numberFormat: { notation: 'compact' }, data: [{ id: 'one', label: 'Precise', values: { a: 1700000.12345 } }] });
    expect(html).toContain('1.7M');
    expect(html).toContain('<td>1,700,000.12345</td>');
  });
  test('tiny nonzero and extreme axes use scientific notation instead of zero or enormous strings', () => {
    const tiny = scatter({ xAxis: { includeZero: false }, data: [
      { id: 'one', label: 'One', seriesId: 'a', x: .00001, y: .00001 },
      { id: 'two', label: 'Two', seriesId: 'a', x: .00004, y: .00004 },
    ] });
    expect(tiny).toContain('1E-5');
    const huge = line({ data: [{ id: 'one', label: 'One', values: { a: 1e18 } }] });
    expect(huge).toContain('1E18');
  });
});


test('overlapping bubbles retain true coordinates but defer inside labels to the table', () => {
  const html = bubbles({ data: [
    { id: 'one', label: 'One', seriesId: 'a', x: 10, y: 20, size: 25 },
    { id: 'two', label: 'Two', seriesId: 'a', x: 10, y: 20, size: 100 },
  ] });
  const circles = marks(html, 'bubble');
  expect(circles).toHaveLength(2);
  expect(n(circles[0]!, 'cx')).toBe(n(circles[1]!, 'cx'));
  expect(marks(html, 'bubble-label')).toHaveLength(0);
  expect(html).toContain('<td>25</td>');
  expect(html).toContain('<td>100</td>');
});

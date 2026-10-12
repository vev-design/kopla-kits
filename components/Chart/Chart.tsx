import { cloneElement, isValidElement, type ReactNode } from 'react';
import { init, renderStaticSVG } from './Chart.vendor/renderer.js';
import { chartTheme } from './chart-theme';
export { ChartShowcase } from './chart-showcase';

/** The role is chosen from the source meaning, never from the value's sign. */
export type SeriesRole = 'focus' | 'context' | 'categorical' | 'positive' | 'negative' | 'other';

/** JSON-only brand chart rules. Structural rules use frameDevice + the frame slot.
 * Provenance may be stored alongside this data; it does not affect rendering. */
export interface ChartTheme {
  seriesRoles: { focus: string; context: string; positive: string; negative: string; other: string; categorical: string[] };
  typography: { fontFamily: string; titleSize: number; labelSize: number; noteSize: number; titleWeight: number };
  grid: { color: string; width: number };
  line: { width: number };
  backgrounds: { default: string; muted: string };
  textColor: string;
  /** Rules needing author judgement; plain prose is never interpreted as executable configuration. */
  neverDo: string[];
  /** Component name an author can supply through frame; never dynamically imported. */
  frameDevice: string | null;
  /** Exact implemented chart-rule titles, retained for component provenance. */
  brandRules?: string[];
}

export interface ChartDataSeries {
  /** Legend label from the data, normally 1–5 words. */
  name: string;
  /** Semantic color from the brand's palette rule; omitted means categorical. */
  role?: SeriesRole;
  /** One finite value per category, or explicit x/y observations. Null and invalid y remain gaps, never zeroes. Bubble size is nonnegative area. */
  values: (number | null)[] | { x: string | number; y: number | null; size?: number }[];
}

/** Quantitative comparisons, trends, shares, and x/y observations using one data model.
 * Use a Stat or an illustration for decorative numbers. This renderer is complete:
 * change chart-theme.ts for brand values, and frame for a structural brand device.
 * Server-rendered SVG and a semantic source table contain all information without
 * JavaScript. There is no tooltip-only content or animation. Native disclosure and
 * table-scroll keyboard behavior is unchanged; no keyboard keys are rebound. */
interface ChartProps {
  /** Sentence-case title from the intended finding, normally 3–10 words. */
  title: string;
  /** Geometry selected for the relationship in the data; all share the same series model. */
  variant?: 'bar' | 'stacked-bar' | 'line' | 'pie' | 'donut' | 'scatter' | 'bubble';
  /** Named observations from the supplied data; roles come from the brand's chart palette rules. */
  series: ChartDataSeries[];
  /** Category order from the source. Unlisted explicit categories are appended so observations are never lost. */
  categories?: string[];
  /** Approved background token, derived from the brand's chart background rules. */
  background?: 'default' | 'muted';
  /** Horizontal axis unit from the data, normally 1–5 words. */
  xLabel?: string;
  /** Vertical axis unit from the data, normally 1–5 words. */
  yLabel?: string;
  /** Attribution or qualification from the source, normally 3–20 words. */
  source?: string;
  /** Explicit number-format locale; defaults to en-US so server and browser agree. No currency or unit is inferred from prose. */
  locale?: string;
  /** Authored focal value inside a donut, normally 1–8 characters. Omit for an empty center; no total or takeaway is invented. */
  centerValue?: string;
  /** Authored supporting label inside a donut, normally 1–4 words. Used only with centerValue and only for a single donut panel. */
  centerLabel?: string;
  /** Optional brand device element that accepts children. The plot is inserted as its children; choose the device named by chartTheme.frameDevice. */
  frame?: ReactNode;
  /** Layout classes from the surrounding section; do not use to redefine chart marks. */
  className?: string;
}

export type { ChartProps as QuantitativeChartProps };

type Point = { x: string | number; y: number | null; size?: number };
type Option = Record<string, unknown>;

// Keep SVG dimensions for layout calculation, then scale the resulting viewBox.
// SSR mode disables the animation loop and DOM events; always dispose, even if
// invalid input makes the renderer throw, so long-lived servers retain no charts.
function Plot({ option, height = 320, width = 640, precise = false }: { option: Option; height?: number; width?: number; precise?: boolean }) {
  const chart = init(null, undefined, { renderer: 'svg', ssr: true, width, height });
  let svg: string;
  try {
    chart.setOption(option);
    // The default SVG compressor rounds small charts to one decimal. A
    // near-full sector can then have identical arc endpoints and vanish.
    svg = precise ? renderStaticSVG(chart) : chart.renderToSVGString();
    if (!svg.includes('viewBox=')) svg = svg.replace('<svg ', `<svg viewBox="0 0 ${width} ${height}" `);
  } finally {
    chart.dispose();
  }
  // The plot is opaque, static SVG. ECharts assigns renderer/class counters
  // globally, so identical SSR and browser renders have different internal IDs.
  // Preserve the server SVG when a preview app hydrates this static component;
  // React still verifies every authored label, key and source-table cell around it.
  return <div aria-hidden="true" suppressHydrationWarning className="min-w-0 w-full [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />;
}

function color(role: SeriesRole | undefined, index: number) {
  const palette = chartTheme.seriesRoles;
  return role && role !== 'categorical' ? palette[role] : palette.categorical[index % Math.max(1, palette.categorical.length)] ?? palette.focus;
}

type Slice = { name: string; value: number; color: string };

// Keep keys stable across SSR and the browser. Twenty-one significant digits
// preserve every finite Number's round-trip decimal digits; formatting adds
// locale separators while the source table keeps its original numeric cells.
function numberFormat(locale: string) {
  const number = new Intl.NumberFormat(locale, { maximumSignificantDigits: 21 });
  return {
    full: (value: number | null | undefined) => value == null || !Number.isFinite(value) ? '—' : number.format(value),
  };
}

// SVG keeps concise wrapped names; the adjacent HTML key always keeps the full
// name. Break unspaced words too, so a URL-like category cannot leave the plot.
function wrapLabel(text: string, columns: number, maxLines = 3) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.trim().split(/\s+/)) {
    if (line && line.length + word.length + 1 > columns) { lines.push(line); line = ''; }
    for (const character of word) {
      if (line.length >= columns) { lines.push(line); line = ''; }
      line += character;
    }
    line += ' ';
  }
  if (line.trim()) lines.push(line.trim());
  const visible = lines.slice(0, maxLines).map((value) => value.trim());
  if (lines.length > maxLines) visible[maxLines - 1] = visible[maxLines - 1].slice(0, columns - 1).trimEnd() + '…';
  return visible.join('\n');
}

function CircularPlot({ slices, donut, locale, theme, base, centerValue, centerLabel }: {
  slices: Slice[]; donut: boolean; locale: string; theme: ChartTheme; base: Option;
  centerValue?: string; centerLabel?: string;
}) {
  // Normalization avoids an infinite denominator when several finite values are
  // near Number.MAX_VALUE. The source values remain unchanged in the HTML key.
  const maximum = slices.reduce((max, slice) => Math.max(max, slice.value), 0);
  // An extreme positive ratio can underflow to zero. Preserve its positive
  // meaning for labels without imposing a false minimum sector angle.
  const weights = slices.map((slice) => slice.value > 0 ? Math.max(Number.MIN_VALUE, slice.value / maximum) : 0);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const shares = weights.map((weight) => weight > 0 ? Math.max(Number.MIN_VALUE, weight / total) : 0);
  const positiveCount = weights.filter((weight) => weight > 0).length;
  const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 });
  const shareLabel = (share: number) => share > 0 && share < 0.001 ? `<${percent.format(0.001)}`
    : share > 0.999 && (share < 1 || positiveCount > 1) ? `>${percent.format(0.999)}` : percent.format(share);
  const format = numberFormat(locale);
  const hasValues = maximum > 0;

  function layout(compact: boolean) {
    const width = compact ? 320 : 520;
    const fontSize = Math.max(theme.typography.labelSize, compact ? 12 : 14);
    const lineHeight = Math.ceil(fontSize * 1.4);
    const labelWidth = compact ? 74 : 116;
    const labels = slices.map((slice, i) => `${wrapLabel(slice.name, Math.max(5, Math.floor(labelWidth / (fontSize * 0.6))))}\n${shareLabel(shares[i])}`);
    let angle = 0;
    const sideHeights = [0, 0];
    shares.forEach((share, i) => {
      if (share > 0) sideHeights[Math.sin((angle + share / 2) * Math.PI * 2) >= 0 ? 1 : 0] += labels[i].split('\n').length * lineHeight + 10;
      angle += share;
    });
    const height = Math.max(compact ? 300 : 340, Math.max(...sideHeights) + 32);
    // Radius is bounded independently of available width and label height: a
    // wide desktop section must not turn a three-slice donut into a giant ring.
    // The compact label column ends at x=80; a 64px radius leaves 16px
    // before the ring even at its equator, so leaders remain visible.
    const outer = compact ? 64 : 120;
    const inner = donut ? outer * 0.68 : 0;
    const option: Option = { ...base, series: [{
      type: 'pie', radius: [inner, outer], center: ['50%', '50%'],
      avoidLabelOverlap: true, minShowLabelAngle: 0, stillShowZeroSum: false,
      label: {
        show: true, position: 'outside', alignTo: 'edge', edgeDistance: 6,
        width: labelWidth, overflow: 'break', distanceToLabelLine: 4,
        color: theme.textColor, fontFamily: theme.typography.fontFamily,
        fontSize, lineHeight,
        formatter: ({ dataIndex }: { dataIndex: number }) => labels[dataIndex],
      },
      labelLine: { show: true, length: 10, length2: 8, minTurnAngle: 45, lineStyle: { color: theme.textColor, width: 1 } },
      data: slices.map((slice, i) => ({
        name: slice.name, value: weights[i],
        itemStyle: { color: slice.color },
        // A zero has no sector to point at. Keep it in the visible HTML key;
        // do not draw a false minimum-sized slice merely to anchor its label.
        label: { show: shares[i] > 0 }, labelLine: { show: shares[i] > 0 },
      })),
      emphasis: { disabled: true },
    }] };
    return <div className={compact ? 'kopla-chart-circular-compact' : 'kopla-chart-circular-wide'} style={{ position: 'relative', maxWidth: width, marginInline: 'auto' }}>
      <Plot width={width} height={height} option={option} precise />
      {donut && centerValue && <div data-chart-center="" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: `${inner * 1.6 / width * 100}%`, textAlign: 'center', overflowWrap: 'anywhere', lineHeight: 1.25 }}>
        <div style={{ fontSize: Math.max(14, Math.min(theme.typography.titleSize + 6, inner * 1.5 / Math.max(1, Array.from(centerValue).length) / 0.65)), fontWeight: theme.typography.titleWeight }}>{centerValue}</div>
        {centerLabel && <div style={{ marginTop: 4, fontSize: Math.max(11, Math.min(theme.typography.labelSize, compact ? 12 : 14)) }}>{centerLabel}</div>}
      </div>}
    </div>;
  }
  return <>
    {hasValues ? <div className="kopla-chart-circular-layout" style={{ containerType: 'inline-size', containerName: 'chart-circular' }}>
      {/* Container queries choose actual layouts, not shrunken desktop text.
          Both SVGs are SSR content; no measurement hook or hydration is needed. */}
      <style>{`.kopla-chart-circular-wide{display:none}@container chart-circular (min-width:480px){.kopla-chart-circular-compact{display:none}.kopla-chart-circular-wide{display:block}}`}</style>
      {layout(true)}{layout(false)}
    </div> : <p className="py-16 text-center">No positive values</p>}
    <ul data-chart-key="" className="mt-4 grid gap-x-6 gap-y-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,180px),1fr))', fontSize: Math.max(12, theme.typography.labelSize), lineHeight: 1.5 }}>
      {slices.map((slice, i) => <li key={i} className="flex min-w-0 items-start gap-2">
        <span aria-hidden="true" className="mt-1.5 size-3 shrink-0" style={{ background: slice.color }} />
        <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}><span className="font-medium">{slice.name}</span><br />{format.full(slice.value)} <span>({hasValues ? shareLabel(shares[i]) : '—'})</span></span>
      </li>)}
    </ul>
  </>;
}

export function Chart({ title, variant = 'bar', series, categories, background = 'default', xLabel, yLabel, source, locale = 'en-US', centerValue, centerLabel, frame, className }: ChartProps) {
  const theme: ChartTheme = chartTheme;
  const observations = series.map((s) => ({ ...s, points: s.values.map((value, i): Point =>
    value !== null && typeof value === 'object' ? value : { x: categories?.[i] ?? i + 1, y: value },
  ) }));
  const numericX = !categories?.length && observations.every((s) => s.points.every((p) => typeof p.x === 'number'));
  const names = Array.from(new Set([...(categories ?? []), ...observations.flatMap((s) => s.points.filter((p) => typeof p.x !== 'number' || Number.isFinite(p.x)).map((p) => String(p.x)))]));
  if (numericX) names.sort((a, b) => Number(a) - Number(b));
  // Keep nulls in line data to break paths. Removing them would draw a fabricated
  // trend through missing observations, even though the source table says unknown.
  const valid = observations.map((s) => ({ ...s, points: s.points.filter((p) => typeof p.x !== 'number' || Number.isFinite(p.x)).map((p) => ({ ...p, y: Number.isFinite(p.y) ? p.y : null })) }));
  const circular = variant === 'pie' || variant === 'donut';
  const positional = variant === 'scatter' || variant === 'bubble' || (variant === 'line' && numericX);
  const duplicate = (!positional || !numericX) && valid.some((s) => new Set(s.points.map((p) => String(p.x))).size !== s.points.length);
  const empty = !valid.some((s) => s.points.some((p) => p.y !== null));
  const negativePie = circular && valid.some((s) => s.points.some((p) => p.y !== null && p.y < 0));
  const issue = negativePie ? 'Pie and donut charts require nonnegative values. The source data is available below.'
    : duplicate ? 'Use one observation per category in each series. The full source data is available below.'
    : empty ? 'No finite observations are available.' : null;
  const colors = series.map((s, i) => color(s.role, i));
  const base = { animation: false, textStyle: { fontFamily: theme.typography.fontFamily, color: theme.textColor } };
  const axis = { axisLine: { show: true, lineStyle: { color: theme.textColor, width: theme.line.width } }, axisTick: { show: false }, axisLabel: { color: theme.textColor, fontSize: theme.typography.labelSize, fontFamily: theme.typography.fontFamily, hideOverlap: true }, splitLine: { show: false } };
  const maxSize = Math.max(1, ...valid.flatMap((s) => s.points.map((p) => Number.isFinite(p.size) ? Math.max(0, p.size ?? 1) : 1)));
  const option: Option = {
    ...base,
    grid: { left: 48, right: variant === 'bubble' ? 32 : 16, top: variant === 'bubble' ? 32 : 16, bottom: 40 },
    xAxis: { ...axis, type: positional && numericX ? 'value' : 'category', data: positional && numericX ? undefined : names, axisLabel: { ...axis.axisLabel, overflow: 'truncate', width: 80 } },
    yAxis: { ...axis, type: 'value', axisLine: { show: false }, splitLine: { show: theme.grid.width > 0, lineStyle: { color: theme.grid.color, width: theme.grid.width } } },
    series: valid.map((s, i) => ({
      name: s.name, type: variant === 'line' ? 'line' : variant === 'scatter' || variant === 'bubble' ? 'scatter' : 'bar',
      stack: variant === 'stacked-bar' ? 'total' : undefined, stackStrategy: 'samesign',
      itemStyle: { color: colors[i] }, lineStyle: { color: colors[i], width: theme.line.width, type: i >= 5 ? 'dashed' : 'solid' },
      symbol: variant === 'bubble' ? 'circle' : ['circle', 'rect', 'triangle'][i % 3],
      symbolSize: variant === 'bubble' ? (point: number[]) => Math.sqrt(Math.max(0, point[2] ?? 1) / maxSize) * 56 : 6,
      connectNulls: false,
      data: positional ? s.points.map((p) => [numericX ? p.x : String(p.x), p.y, Number.isFinite(p.size) ? Math.max(0, p.size ?? 1) : 1]) : names.map((x) => s.points.find((p) => String(p.x) === x)?.y ?? null),
      emphasis: { disabled: true },
    })),
  };
  const panels = series.length > 1 ? names.map((x) => ({ name: x, slices: valid.flatMap((s, i) => {
    const p = s.points.find((p) => String(p.x) === x);
    return p?.y != null ? [{ name: s.name, value: p.y, color: colors[i] }] : [];
  }) })) : valid.map((s) => ({ name: s.name, slices: s.points.flatMap((p, j) => p.y === null ? [] : [{ name: String(p.x), value: p.y, color: color(s.role, j) }]) }));
  const plot = issue ? <p role="status" className="py-8">{issue}</p> : circular ? (
    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))' }}>
      {panels.map((panel, i) => <div key={i} style={{ minWidth: 0, width: '100%', maxWidth: 600, marginInline: 'auto' }}>
        {panels.length > 1 && <p className="mb-2 font-medium">{panel.name}</p>}
        <CircularPlot slices={panel.slices} donut={variant === 'donut'} locale={locale} theme={theme} base={base}
          centerValue={panels.length === 1 ? centerValue : undefined} centerLabel={panels.length === 1 ? centerLabel : undefined} />
      </div>)}
    </div>
  ) : <>
    {yLabel && <p className="mb-2" style={{ fontSize: theme.typography.labelSize }}>{yLabel}</p>}
    <Plot option={option} />
    {xLabel && <p className="mt-2 text-center" style={{ fontSize: theme.typography.labelSize }}>{xLabel}</p>}
    <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3" style={{ fontSize: theme.typography.labelSize }}>
      {series.map((s, i) => <li key={i} className="flex items-center gap-2"><span aria-hidden="true" className="size-3 shrink-0" style={{ background: colors[i] }} />{s.name}</li>)}
    </ul>
  </>;
  const formatted = (value: number | null | undefined) => value == null || !Number.isFinite(value) ? '—' : value;
  return <figure className={`min-w-0 p-5 sm:p-8 ${className ?? ''}`} style={{ background: theme.backgrounds[background], color: theme.textColor, fontFamily: theme.typography.fontFamily }}>
    <figcaption className="mb-6" style={{ fontSize: theme.typography.titleSize, fontWeight: theme.typography.titleWeight }}>{title}</figcaption>
    {isValidElement(frame) ? cloneElement(frame, undefined, plot) : plot}
    {source && <p className="mt-6 leading-relaxed" style={{ fontSize: theme.typography.noteSize }}>{source}</p>}
    <details className="mt-6 border-t pt-4">
      <summary className="min-h-11 cursor-pointer py-3 font-medium" style={{ fontSize: theme.typography.labelSize }}>View source data</summary>
      <div className="mt-4 max-w-full overflow-x-auto" tabIndex={0} role="region" aria-label={`${title} source data`}>
        <table className="w-full text-left" style={{ fontSize: theme.typography.labelSize }}>
          <caption className="sr-only">{title} source data</caption>
          <thead><tr>{['Series', 'Category / x', 'Value / y', 'Bubble area'].map((label) => <th key={label} scope="col" className="p-2">{label}</th>)}</tr></thead>
          <tbody>{observations.flatMap((s, i) => s.points.map((p, j) => <tr key={`${i}-${j}`} className="border-t"><th scope="row" className="p-2 font-medium">{s.name}</th><td className="p-2">{typeof p.x === 'number' ? formatted(p.x) : p.x}</td><td className="p-2">{formatted(p.y)}</td><td className="p-2">{formatted(p.size)}</td></tr>))}</tbody>
        </table>
      </div>
    </details>
  </figure>;
}

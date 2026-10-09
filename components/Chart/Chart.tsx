import { cloneElement, isValidElement, type ReactNode } from 'react';
import { init } from './Chart.vendor/renderer.js';
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
function Plot({ option, height = 320, width = 640 }: { option: Option; height?: number; width?: number }) {
  const chart = init(null, undefined, { renderer: 'svg', ssr: true, width, height });
  let svg: string;
  try {
    chart.setOption(option);
    svg = chart.renderToSVGString();
    if (!svg.includes('viewBox=')) svg = svg.replace('<svg ', `<svg viewBox="0 0 ${width} ${height}" `);
  } finally {
    chart.dispose();
  }
  return <div aria-hidden="true" className="min-w-0 w-full [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />;
}

function color(role: SeriesRole | undefined, index: number) {
  const palette = chartTheme.seriesRoles;
  return role && role !== 'categorical' ? palette[role] : palette.categorical[index % Math.max(1, palette.categorical.length)] ?? palette.focus;
}

export function Chart({ title, variant = 'bar', series, categories, background = 'default', xLabel, yLabel, source, frame, className }: ChartProps) {
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
    <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))]">
      {panels.map((panel, i) => <div key={i}>
        <p className="mb-2 font-medium">{panel.name}</p>
        {panel.slices.some((p) => p.value > 0) ? <Plot width={320} height={260} option={{ ...base, series: [{ type: 'pie', radius: variant === 'donut' ? ['50%', '78%'] : '78%', center: ['50%', '50%'], label: { show: false }, data: panel.slices.map((p) => ({ name: p.name, value: p.value, itemStyle: { color: p.color } })), emphasis: { disabled: true } }] }} /> : <p className="py-16 text-center">No positive values</p>}
        <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2" style={{ fontSize: theme.typography.labelSize }}>
          {panel.slices.map((p, j) => <li key={j} className="flex items-center gap-2"><span aria-hidden="true" className="size-3 shrink-0" style={{ background: p.color }} />{p.name}: {p.value}</li>)}
        </ul>
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

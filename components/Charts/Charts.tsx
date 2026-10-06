// Copy-in chart mechanics. No hooks, runtime dependencies or client boundary:
// complete SVG geometry and the data table render on the server. The native
// scroll region is keyboard accessible; no keys are rebound. SVG has an image
// role and a name; its redundant marks are accompanied by a semantic table.
// All brand decisions live in ChartBrand, never in the data or CSS selectors.
import { Children, cloneElement, isValidElement, type CSSProperties, type ReactNode, type ReactElement } from 'react';

export type ChartRole = 'positive' | 'neutral' | 'negative' | 'other';
export type ChartKind = 'bar' | 'pie' | 'donut' | 'line' | 'scatter' | 'bubble';

/** A mark's color and the approved text color when a label is inside it. */
export interface ChartInk { color: string; labelColor: string }

/** An approved treatment for one named background. Colors may be CSS variables. */
export interface ChartSurface {
  background: string;
  text: string;
  /** Focal statistics may use a different approved color than ordinary labels. */
  focalText?: string;
  mutedText: string;
  axis: string;
  grid: string;
  /** Optional approved trend-line ink; otherwise each fit uses its series color. */
  trend?: string;
  categorical: ChartInk[];
  emphasis: { focus: ChartInk; context: ChartInk[] };
  semantic: Record<ChartRole, ChartInk>;
  /** Explicit, persistent series/category assignments take priority over the palette. */
  series?: Record<string, ChartInk>;
  /** Omit to allow every kind. An empty list disallows every kind. */
  allowedCharts?: ChartKind[];
}

/** JSON-serializable rules saved once per brand. No functions or font fetching.
 * Each supplied surface is complete: never guess colors for a dark background. */
export interface ChartBrand {
  version: 1;
  defaultSurface?: string;
  surfaces?: Record<string, ChartSurface>;
  /** A brand-wide registry keeps palette assignments stable across filtering and reordering. */
  seriesOrder?: string[];
  typography?: {
    labelFamily?: string; valueFamily?: string; displayFamily?: string;
    labelSize?: number; valueSize?: number; titleSize?: number; displaySize?: number;
    labelWeight?: number; valueWeight?: number; titleWeight?: number; displayWeight?: number;
  };
  bar?: { radius?: number; gap?: number; groupGap?: number; separatorWidth?: number; totals?: boolean; valueLabels?: 'inside' | 'outside' | 'none' };
  line?: { width?: number; pointRadius?: number; dashPatterns?: string[] };
  pie?: { innerRadius?: number; startAngle?: number; separatorWidth?: number; labels?: 'inside' | 'outside' | 'none'; insideLabel?: 'percent' | 'value' | 'label-percent'; categoryLabels?: 'inside' | 'outside' | 'none'; valueLabels?: 'inside' | 'outside' | 'none'; valueContent?: 'percent' | 'value'; legend?: boolean };
  scatter?: { radius?: number; strokeWidth?: number; fillOpacity?: number; trendWidth?: number; labels?: 'none' | 'outside' };
  bubble?: { maxRadius?: number; strokeWidth?: number; fillOpacity?: number; ringCount?: number; labelHaloWidth?: number; treatment?: 'solid' | 'rings'; labels?: 'none' | 'inside' | 'outside'; sizeLegend?: boolean };
  defaults?: { grid?: boolean; legend?: boolean; legendPosition?: 'bottom' | 'right'; values?: boolean; lineLabels?: 'end' | 'none' };
  motion?: { enabled?: boolean; durationMs?: number; easing?: string };
}

const primary: ChartInk = { color: 'var(--chart-1, var(--primary))', labelColor: 'var(--primary-foreground)' };
const secondary: ChartInk = { color: 'var(--chart-2, var(--muted-foreground))', labelColor: 'var(--background)' };
const tertiary: ChartInk = { color: 'var(--chart-3, var(--foreground))', labelColor: 'var(--background)' };

/** The unconfigured kit uses its own tokens. Brands replace these rules once. */
export const defaultChartBrand: ChartBrand = {
  version: 1,
  defaultSurface: 'default',
  surfaces: {
    default: {
      background: 'var(--background)', text: 'var(--foreground)', mutedText: 'var(--muted-foreground)',
      axis: 'var(--border)', grid: 'var(--border)', categorical: [primary, secondary, tertiary],
      emphasis: { focus: primary, context: [secondary, tertiary] },
      // Neutral defaults deliberately make no universal red/green claim.
      semantic: { positive: primary, neutral: secondary, negative: tertiary, other: secondary },
    },
  },
};

const TYPE = {
  labelFamily: 'var(--font-sans, sans-serif)', valueFamily: 'var(--font-sans, sans-serif)',
  displayFamily: 'var(--font-display, var(--font-sans, sans-serif))',
  labelSize: 12, valueSize: 12, titleSize: 18, displaySize: 30,
  labelWeight: 400, valueWeight: 500, titleWeight: 600, displayWeight: 600,
};
const BAR = { radius: 0, gap: 4, groupGap: 0.28, separatorWidth: 0, totals: false };
const LINE = { width: 2, pointRadius: 0, dashPatterns: [] as string[] };
const PIE = { innerRadius: 0.6, startAngle: -90, separatorWidth: 0, labels: 'outside' as 'inside' | 'outside' | 'none', insideLabel: 'percent' as 'percent' | 'value' | 'label-percent' };
const SCATTER = { radius: 4, strokeWidth: 0, fillOpacity: 1, trendWidth: 1.5, labels: 'none' as 'none' | 'outside' };
const BUBBLE = { maxRadius: 44, strokeWidth: 1, fillOpacity: 0.8, ringCount: 8, labelHaloWidth: 0,
  treatment: 'solid' as 'solid' | 'rings', labels: 'inside' as 'none' | 'inside' | 'outside', sizeLegend: true };
const DEFAULTS = { grid: false, legend: true, values: false, lineLabels: 'end' as 'end' | 'none' };

export interface ChartSeries {
  /** Stable machine ID, shared across charts. */
  id: string;
  /** Human-readable legend/series label. */
  label: string;
  /** Explicit meaning; a negative number alone does not imply a negative outcome. */
  role?: ChartRole;
}

export interface ChartRow {
  id: string;
  label: string;
  /** Null/missing values are gaps, never invented zeros. */
  values: Record<string, number | null>;
}

export interface PieDatum extends ChartSeries { value: number }

/** Shared content and brand inputs for all chart components. */
export interface ChartProps {
  /** Chart title and accessible name. */
  title: string;
  /** Optional explanation, rendered as real text. */
  description?: string;
  /** Shared saved brand configuration. Use createBrandedCharts to bind it once. */
  brand?: ChartBrand;
  /** Named approved background; defaults to the brand's defaultSurface. */
  surface?: string;
  /** IDs to emphasize. Semantic mode keeps semantic colors; it never silently reassigns meanings. */
  highlight?: string[];
  /** Categorical, focus/context, or explicit positive/neutral/negative/other roles. */
  colorMode?: 'categorical' | 'emphasis' | 'semantic';
  /** Override the brand's animation default. CSS runs once when inserted. */
  animation?: 'none' | 'enter';
  /** Locale is explicit so server and browser format identically. Default en-US. */
  locale?: string;
  /** Number-format options; values are never changed for display. */
  numberFormat?: Intl.NumberFormatOptions;
  /** Literal value suffix, such as % or tonnes. */
  suffix?: string;
  /** Override the brand's legend default. */
  legend?: boolean;
  /** Preferred legend placement. Right-side legends move below on narrow containers. */
  legendPosition?: 'bottom' | 'right';
  /** Keep a screen-reader table, or display it below the chart. */
  dataTable?: 'hidden' | 'visible';
  /** Responsive by default. Use scroll to retain a wide, detailed plot deliberately. */
  sizing?: 'responsive' | 'scroll';
  /** Plot height in CSS pixels. Labels may add height. Default 320. */
  height?: number;
  /** Section-owned layout classes; no card/chrome is imposed. */
  className?: string;
}

/** A comparison chart with a truthful zero baseline and separate positive/negative stacks. */
export interface BarChartProps extends ChartProps {
  /** Named measurements with stable IDs. */
  series: ChartSeries[];
  /** Categories in reading order. */
  data: ChartRow[];
  /** Direction of the value axis. */
  orientation?: 'vertical' | 'horizontal';
  /** Compare side-by-side or add segments within each category. */
  layout?: 'grouped' | 'stacked';
  /** Show values on marks; small stacked segments defer to the table. */
  values?: boolean;
  /** Explicit mark-value placement; takes priority over values and the brand default. */
  valueLabels?: 'inside' | 'outside' | 'none';
  /** Show positive/negative totals at the ends of stacked bars. Defaults to the brand. */
  totals?: boolean;
}

/** A part-to-whole chart. Negative/non-finite values are rejected, zero slices stay in the table. */
export interface PieChartProps extends ChartProps {
  /** Nonnegative categories, in source order. */
  data: PieDatum[];
  /** Full pie or a ring with optional center content. */
  variant?: 'pie' | 'donut';
  /** Label placement; defaults to the brand. */
  labels?: 'inside' | 'outside' | 'none';
  /** Category-name placement, independently of the numeric label. */
  categoryLabels?: 'inside' | 'outside' | 'none';
  /** Numeric-label placement, independently of the category name. */
  valueLabels?: 'inside' | 'outside' | 'none';
  /** Show shares or original values in numeric labels. */
  valueContent?: 'percent' | 'value';
  /** Focal number or short statistic in a donut. */
  centerValue?: string;
  /** Supporting center label in a donut. */
  centerLabel?: string;
}

/** An ordered-category trend chart. Null values split paths; straight lines do not invent curves. */
export interface LineChartProps extends ChartProps {
  /** Named measurements with stable IDs. */
  series: ChartSeries[];
  /** Equally spaced ordered categories; use explicit missing rows for missing time intervals. */
  data: ChartRow[];
  /** Include zero in the value domain. Default true. */
  includeZero?: boolean;
  /** Override the brand's endpoint labels. */
  labels?: 'end' | 'none';
}

/** A continuous numeric axis. Explicit domains must include every plotted point. */
export interface ChartAxis {
  label?: string;
  numberFormat?: Intl.NumberFormatOptions;
  suffix?: string;
  /** Default true. Explicit domain takes precedence. */
  includeZero?: boolean;
  domain?: [number, number];
}

export interface ScatterDatum {
  /** Stable observation ID, unique within the chart. */
  id: string;
  label: string;
  /** Must reference a declared series. Color/meaning belongs to that series. */
  seriesId: string;
  /** Null coordinates stay in the data table but do not create a point at zero. */
  x: number | null;
  y: number | null;
}

export interface BubbleDatum extends ScatterDatum {
  /** Nonnegative measurement encoded by the outer disk's area. Null means missing. */
  size: number | null;
}

/** Numeric X/Y inputs shared by scatter and bubble charts. */
export interface XYChartProps extends ChartProps {
  /** Shared series identities, labels and semantic roles. */
  series: ChartSeries[];
  /** X label, units, formatting and optional fixed domain. */
  xAxis?: ChartAxis;
  /** Y label, units, formatting and optional fixed domain. */
  yAxis?: ChartAxis;
}

/** Numeric X/Y observations with equal-sized markers and optional per-series least-squares fits. */
export interface ScatterChartProps extends XYChartProps {
  /** Observations positioned by their numeric coordinates, never by array order. */
  data: ScatterDatum[];
  /** Optional direct labels in a collision-free rail; points retain their true positions. */
  labels?: 'none' | 'outside';
  /** Descriptive least-squares fit per series, limited to observed X values. Default none. */
  trendLine?: 'none' | 'linear';
}

/** Numeric X/Y observations whose circle areas represent a third measurement. */
export interface BubbleChartProps extends XYChartProps {
  /** Zero/missing sizes stay in the table but draw no bubble. Negative sizes are invalid. */
  data: BubbleDatum[];
  /** Optional constant size ceiling shared across related charts or filters. Must cover the data. */
  sizeMax?: number;
  /** Name of the size measurement, used in the legend and table. Default Size. */
  sizeLabel?: string;
  /** Independent size formatting; defaults to numberFormat. */
  sizeNumberFormat?: Intl.NumberFormatOptions;
  /** Independent size suffix; defaults to suffix. */
  sizeSuffix?: string;
  /** Override the brand's outer-circle treatment. Rings are decorative, not another measurement. */
  treatment?: 'solid' | 'rings';
  /** Inside shows the size in display type; outside identifies observations in a label rail. */
  labels?: 'none' | 'inside' | 'outside';
  /** Show reference areas and their size values. Defaults to the brand. */
  sizeLegend?: boolean;
}

function bounded(value: number | undefined, fallback: number, min: number, max: number) {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value!)) : fallback;
}

function themeFor(props: ChartProps, kind: ChartKind) {
  const brand = props.brand ?? defaultChartBrand;
  if (brand.version !== 1) throw new Error('Unsupported chart brand version. Expected 1.');
  const surfaces = brand.surfaces ?? defaultChartBrand.surfaces!;
  const name = props.surface ?? brand.defaultSurface ?? 'default';
  const surface = Object.hasOwn(surfaces, name) ? surfaces[name] : undefined;
  if (!surface) throw new Error(`Chart surface "${name}" is not defined in this brand.`);
  if (!surface.categorical.length || !surface.emphasis.context.length) {
    throw new Error(`Chart surface "${name}" requires nonempty categorical and context palettes.`);
  }
  const typography = { ...TYPE, ...brand.typography };
  for (const key of ['labelSize', 'valueSize', 'titleSize', 'displaySize'] as const) {
    typography[key] = bounded(typography[key], TYPE[key], 8, 72);
  }
  return {
    brand, name, surface, typography,
    allowed: !surface.allowedCharts || surface.allowedCharts.includes(kind),
    bar: { ...BAR, ...brand.bar }, line: { ...LINE, ...brand.line }, pie: { ...PIE, ...brand.pie },
    scatter: { ...SCATTER, ...brand.scatter }, bubble: { ...BUBBLE, ...brand.bubble },
    defaults: { ...DEFAULTS, ...brand.defaults },
    animate: props.animation ? props.animation === 'enter' : brand.motion?.enabled === true,
    duration: bounded(brand.motion?.durationMs, 700, 0, 2000),
    easing: brand.motion?.easing ?? 'ease-out',
  };
}
type Theme = ReturnType<typeof themeFor>;

function inkFor(item: ChartSeries, index: number, props: ChartProps, theme: Theme): ChartInk {
  const surface = theme.surface;
  const mode = props.colorMode ?? (props.highlight?.length ? 'emphasis' : 'categorical');
  if (mode === 'semantic') return surface.semantic[item.role ?? 'other'];
  const registryIndex = theme.brand.seriesOrder?.indexOf(item.id) ?? -1;
  const position = registryIndex < 0 ? index : registryIndex;
  if (mode === 'emphasis') {
    return props.highlight?.includes(item.id) ? surface.emphasis.focus
      : surface.emphasis.context[position % surface.emphasis.context.length]!;
  }
  return (surface.series && Object.hasOwn(surface.series, item.id) ? surface.series[item.id] : undefined)
    ?? surface.categorical[position % surface.categorical.length]!;
}

function formatFor(props: ChartProps) {
  // A supplied minimum may exceed our default precision. Only an explicitly
  // supplied maximum should be allowed to conflict with it.
  const formatter = new Intl.NumberFormat(props.locale ?? 'en-US', {
    ...props.numberFormat, notation: 'standard',
    maximumFractionDigits: props.numberFormat?.maximumFractionDigits
      ?? Math.max(20, props.numberFormat?.minimumFractionDigits ?? 0),
  });
  return (value: number) => `${formatter.format(Object.is(value, -0) ? 0 : value)}${props.suffix ?? ''}`;
}

// Axis notation is independent of the accessible table's precision. Intl keeps
// currency, percent, locale and unit semantics; only the compact suffix changes.
function compactFor(props: Pick<ChartProps, 'locale' | 'numberFormat' | 'suffix'>) {
  const formatter = new Intl.NumberFormat(props.locale ?? 'en-US', {
    ...props.numberFormat, notation: 'compact', compactDisplay: 'short',
    minimumFractionDigits: 0, maximumFractionDigits: 1,
  });
  const scientific = new Intl.NumberFormat(props.locale ?? 'en-US', {
    ...props.numberFormat, notation: 'scientific', minimumFractionDigits: 0, maximumFractionDigits: 1,
  });
  return (value: number) => {
    const magnitude = Math.abs(value) * (props.numberFormat?.style === 'percent' ? 100 : 1);
    const selected = magnitude > 0 && (magnitude < .01 || magnitude >= 1e15) ? scientific : formatter;
    return `${selected.format(Object.is(value, -0) ? 0 : value)}${props.suffix ?? ''}`;
  };
}
// Fonts load outside this file. Budget a full em per code point, including bold
// and wide fallback glyphs, rather than assuming a narrow font was available.
function textWidth(text: string, size: number) { return Array.from(text).length * size; }
function fitText(text: string, width: number, size: number) {
  const chars = Math.max(1, Math.floor(width / size));
  const glyphs = Array.from(text);
  return glyphs.length <= chars ? text : `${glyphs.slice(0, Math.max(0, chars - 1)).join('')}…`;
}
function axisSpace(ticks: number[], format: (n: number) => string, size: number) {
  return Math.max(...ticks.map((tick) => textWidth(format(tick), size))) + 16;
}
function ticksFor(ticks: number[], space: number, labelWidth: number) {
  const count = Math.max(2, Math.min(ticks.length, Math.floor(space / (labelWidth + 12)) + 1));
  // Keep both ends of the domain even when only two labels fit. A stride that
  // exceeds the tick count silently left a financial X axis labelled only 0.
  return Array.from({ length: count }, (_, index) => ticks[Math.round(index * (ticks.length - 1) / (count - 1))]!);
}
function wrappedText(text: string, width: number, size: number): string[] {
  const words = text.split(/\s+/);
  if (words.length < 2) return [fitText(text, width, size)];
  let first = words.shift()!;
  while (words.length > 1 && textWidth(`${first} ${words[0]}`, size) <= width) first += ` ${words.shift()}`;
  return [fitText(first, width, size), fitText(words.join(' '), width, size)];
}

function unique(items: { id: string }[], name: string) {
  const ids = new Set<string>();
  for (const item of items) {
    if (!item.id || ids.has(item.id)) throw new Error(`${name} IDs must be nonempty and unique: "${item.id}".`);
    ids.add(item.id);
  }
}

function validateRows(data: ChartRow[], series: ChartSeries[]) {
  unique(data, 'Category'); unique(series, 'Series');
  for (const row of data) for (const item of series) {
    const value = row.values[item.id];
    if (value != null && (typeof value !== 'number' || !Number.isFinite(value))) {
      throw new Error(`Invalid value for "${row.id}" / "${item.id}". Use null for missing data.`);
    }
  }
}

// Normalize before scaling. A zero-only domain still has a meaningful baseline,
// and tiny values must not be rounded to zero by a hardcoded minimum step.
function scaleFor(values: number[], includeZero = true) {
  let min = includeZero ? 0 : Infinity;
  let max = includeZero ? 0 : -Infinity;
  for (const value of values) { min = Math.min(min, value); max = Math.max(max, value); }
  if (!Number.isFinite(min) || !Number.isFinite(max)) { min = 0; max = 1; }
  const magnitude = Math.max(Math.abs(min), Math.abs(max)) || 1;
  let a = min / magnitude, b = max / magnitude;
  if (a === b) {
    // Pad in normalized space; adding 10% to a near-MAX_VALUE observation
    // overflows even though every input is finite. Keep endpoints representable.
    if (a === 0) b = 1;
    else if (a > 0) a -= 0.1;
    else b += 0.1;
  }
  const span = b - a;
  return {
    min, max,
    at: (value: number) => (value / magnitude - a) / span,
    ticks: [0, 0.25, 0.5, 0.75, 1].map((fraction) => (a + span * fraction) * magnitude),
  };
}

const CSS = `
  [data-kk-chart] { container: kk-chart / inline-size; width: 100%; min-width: 0; max-width: 100%; margin: 0; }
  [data-kk-chart] [data-chart-scroll] { max-width: 100%; overflow-x: auto; }
  [data-kk-chart] > [data-chart-scroll] > svg { display: block; width: 100%; height: auto; }
  [data-chart-plot-region] { container: kk-plot / inline-size; min-width: 0; }
  [data-chart-body] { min-width: 0; }
  @container kk-chart (min-width: 600px) {
    [data-chart-body][data-legend-position="right"] { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, min(24%, 240px)); gap: 24px; align-items: center; }
    [data-chart-body][data-legend-position="right"] [data-chart-legend] { flex-direction: column; }
  }
  [data-chart-layout] { display: none; }
  [data-chart-layout="280"] { display: block; }
  @container kk-plot (min-width: 600px) {
    [data-chart-layout="280"] { display: none; }
    [data-chart-layout="600"] { display: block; }
  }
  @container kk-plot (min-width: 1000px) {
    [data-chart-layout="600"] { display: none; }
    [data-chart-layout="1000"] { display: block; }
  }
  [data-kk-chart] [data-chart-legend] { display: flex; flex-wrap: wrap; gap: .5em 1.5em; padding: 0; list-style: none; }
  [data-kk-chart] [data-chart-legend] li { display: flex; gap: .5em; align-items: baseline; min-width: 0; max-width: 100%; overflow-wrap: anywhere; }
  [data-kk-chart] [data-chart-legend] li > span:last-child { min-width: 0; overflow-wrap: anywhere; }
  [data-kk-chart] [data-chart-key] { display: inline-block; flex-shrink: 0; width: .8em; height: .8em; }
  [data-kk-chart] figcaption { overflow-wrap: anywhere; }
  [data-kk-chart] [data-chart-table] { border-collapse: collapse; width: 100%; text-align: start; }
  [data-kk-chart] [data-chart-table] th, [data-kk-chart] [data-chart-table] td { padding: .5em; text-align: start; overflow-wrap: anywhere; }
  @keyframes kk-chart-bar { from { transform: scaleY(0); } to { transform: scaleY(1); } }
  @keyframes kk-chart-bar-x { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @keyframes kk-chart-line { from { stroke-dashoffset: 1; stroke-dasharray: 1; } to { stroke-dashoffset: 0; stroke-dasharray: 1; } }
  @keyframes kk-chart-reveal { from { opacity: 0; } to { opacity: 1; } }
  @media (prefers-reduced-motion: no-preference) {
    [data-kk-chart][data-animate] [data-bar] { animation: kk-chart-bar var(--kk-chart-duration) var(--kk-chart-easing) backwards; }
    [data-kk-chart][data-animate][data-horizontal] [data-bar] { animation-name: kk-chart-bar-x; }
    [data-kk-chart][data-animate] [data-line][data-solid] { animation: kk-chart-line var(--kk-chart-duration) var(--kk-chart-easing) backwards; }
    [data-kk-chart][data-animate] [data-slice], [data-kk-chart][data-animate] [data-point],
    [data-kk-chart][data-animate] [data-line]:not([data-solid]) { animation: kk-chart-reveal var(--kk-chart-duration) var(--kk-chart-easing) backwards; }
  }
  @media print { [data-kk-chart] * { animation: none !important; } }
`;

function Frame({ props, theme, kind, children, series, table, empty, horizontal = false }: {
  props: ChartProps; theme: Theme; kind: ChartKind; children: ReactNode;
  series: ChartSeries[]; table: ReactNode; empty: boolean; horizontal?: boolean;
}) {
  const { typography: type, surface } = theme;
  const showTable = props.dataTable === 'visible' || !theme.allowed;
  const showLegend = props.legend ?? ((kind === 'pie' || kind === 'donut') ? theme.pie.legend : undefined) ?? theme.defaults.legend;
  return (
    <figure data-kk-chart={kind} data-surface={theme.name} data-animate={theme.animate || undefined}
      data-horizontal={horizontal || undefined} className={props.className}
      style={{ background: surface.background, color: surface.text, fontFamily: type.labelFamily,
        fontSize: type.labelSize, fontWeight: type.labelWeight,
        '--kk-chart-duration': `${theme.duration}ms`, '--kk-chart-easing': theme.easing } as CSSProperties}>
      <style>{CSS}</style>
      <figcaption>
        <div style={{ fontSize: type.titleSize, fontWeight: type.titleWeight }}>{props.title}</div>
        {props.description && <p style={{ color: surface.mutedText }}>{props.description}</p>}
      </figcaption>
      {!theme.allowed ? <p data-chart-unavailable="">This chart style is not approved for this background. The data is shown below.</p>
        : empty ? <p data-chart-empty="">No data to display.</p>
        : <div data-chart-body="" data-legend-position={showLegend ? (props.legendPosition ?? theme.defaults.legendPosition ?? 'bottom') : undefined}>
          <div data-chart-scroll="" data-chart-plot-region="" role="region" aria-label={`${props.title} plot`} tabIndex={0}>{children}</div>
          {showLegend && <ul data-chart-legend="" aria-label="Legend">
            {series.map((item, index) => <li key={item.id}>
              <span data-chart-key="" aria-hidden="true" style={{ background: inkFor(item, index, props, theme).color }} />
              <span>{item.label}</span>
            </li>)}
          </ul>}
        </div>}
      <div className={showTable ? undefined : 'sr-only'} data-chart-scroll={showTable ? '' : undefined}
        role={showTable ? 'region' : undefined} aria-label={showTable ? `${props.title} data` : undefined}
        tabIndex={showTable ? 0 : undefined}>{table}</div>
    </figure>
  );
}

function RowTable({ props }: { props: BarChartProps | LineChartProps }) {
  const format = formatFor(props);
  return <table data-chart-table=""><caption>{props.title} — data</caption>
    <thead><tr><th scope="col">Category</th>{props.series.map((s) => <th scope="col" key={s.id}>{s.label}</th>)}</tr></thead>
    <tbody>{props.data.map((row) => <tr key={row.id}><th scope="row">{row.label}</th>
      {props.series.map((s) => <td key={s.id}>{row.values[s.id] == null ? 'No data' : format(row.values[s.id]!)}</td>)}
    </tr>)}</tbody></table>;
}

function short(text: string, length: number) { return text.length <= length ? text : `${text.slice(0, length - 1)}…`; }

// Only the plot is repeated. One caption, legend and data table serve all
// layouts; display:none removes inactive SVGs from the accessibility tree.
function ResponsivePlots({ props, render }: { props: ChartProps; render: (width?: number) => ReactNode }) {
  return props.sizing === 'scroll' ? render() : <>{[280, 600, 1000].map((width) =>
    <div key={width} data-chart-layout={width}>{render(width)}</div>)}</>;
}

// Stretch horizontal positions, never typography or circle radii. Paths live in
// their own coordinate viewport; text and circles remain in CSS pixels. This
// avoids both 8px phone labels and huge desktop labels from scaling an SVG.
function fluidNodes(children: ReactNode, width: number, height: number): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const node = child as ReactElement<Record<string, unknown> & { children?: ReactNode; style?: CSSProperties }>;
    const p = node.props;
    if (node.type === 'path') return <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none" overflow="visible" aria-hidden="true">
      {cloneElement(node, { vectorEffect: 'non-scaling-stroke' })}</svg>;
    const next: Record<string, unknown> = {};
    for (const key of ['x', 'x1', 'x2', 'cx', ...(node.type === 'rect' ? ['width'] : [])]) {
      if (typeof p[key] === 'number') next[key] = `${p[key] / width * 100}%`;
    }
    if (p.style?.transformOrigin) next.style = { ...p.style,
      transformOrigin: String(p.style.transformOrigin).replace(/^([\d.e+-]+)px /, (_, x) => `${Number(x) / width * 100}% `) };
    return cloneElement(node, next, fluidNodes(p.children, width, height));
  });
}

function Plot({ title, width, height, theme, fluid = false, fixed = false, children }: {
  title: string; width: number; height: number; theme: Theme; fluid?: boolean; fixed?: boolean; children: ReactNode;
}) {
  return <svg data-chart-plot="" data-coordinate-width={width} xmlns="http://www.w3.org/2000/svg"
    viewBox={fluid ? undefined : `0 0 ${width} ${height}`} role="img" aria-label={title}
    style={{ display: 'block', width: '100%', minWidth: width, height: fluid ? height : 'auto', maxWidth: fluid ? undefined : width,
      fontFamily: theme.typography.labelFamily, fontSize: theme.typography.labelSize,
      fontWeight: theme.typography.labelWeight, color: theme.surface.text }}>
    <title>{title}</title>{!fluid ? children : fixed
      ? <svg x="50%" width={width} height={height} overflow="visible"><g transform={`translate(${-width / 2},0)`}>{children}</g></svg>
      : fluidNodes(children, width, height)}
  </svg>;
}

export function BarChart(props: BarChartProps) {
  validateRows(props.data, props.series);
  const theme = themeFor(props, 'bar');
  const { surface, typography: type } = theme;
  const horizontal = props.orientation === 'horizontal';
  const stacked = props.layout === 'stacked';
  const format = formatFor(props);
  const compact = compactFor(props);
  const all = props.data.flatMap((row) => props.series.map((s) => row.values[s.id]).filter((v): v is number => v != null));
  const domain = stacked ? props.data.flatMap((row) => {
    const values = props.series.map((s) => row.values[s.id] ?? 0);
    const positive = values.reduce((sum, value) => sum + Math.max(0, value), 0);
    const negative = values.reduce((sum, value) => sum + Math.min(0, value), 0);
    if (!Number.isFinite(positive) || !Number.isFinite(negative)) throw new Error('Stacked total exceeds the numeric range. Rescale the input units.');
    return [positive, negative];
  }) : all;
  const scale = scaleFor(domain);
  function renderPlot(layoutWidth?: number) {
    const tickSpace = axisSpace(scale.ticks, compact, type.labelSize);
    const valueSpace = axisSpace(domain, compact, type.valueSize);
    const count = stacked ? 1 : Math.max(1, props.series.length);
    const width = Math.max(layoutWidth ?? 640, tickSpace + 100,
      !horizontal && props.data.length > 12 ? tickSpace + props.data.length * Math.max(32, count * 12) : 0);
    const height = horizontal ? Math.max(bounded(props.height, 320, 200, 1200), props.data.length * Math.max(48, count * (type.valueSize + 8), type.labelSize * 1.6) + 80)
      : Math.max(bounded(props.height, 320, 200, 1200), type.labelSize * 8 + type.valueSize * 3);
    const left = horizontal ? Math.max(tickSpace / 2, Math.min(width * .35, Math.max(...props.data.map((row) => textWidth(row.label, type.labelSize)), 60))) + 12 : tickSpace;
    const top = Math.max(24, type.valueSize * 1.5), bottom = height - type.labelSize * (horizontal ? 2 : 3.5) - type.valueSize * 1.5 - 12;
    const right = width - (horizontal ? Math.max(tickSpace / 2, valueSpace) : Math.max(16, type.labelSize));
    const plotWidth = right - left, plotHeight = bottom - top;
    const valueAt = (v: number) => horizontal ? left + scale.at(v) * plotWidth : bottom - scale.at(v) * plotHeight;
    const band = (horizontal ? plotHeight : plotWidth) / Math.max(1, props.data.length);
    const groupWidth = band * (1 - bounded(theme.bar.groupGap, BAR.groupGap, 0, 0.8));
    const gap = bounded(theme.bar.gap, BAR.gap, 0, groupWidth / count / 2);
    const thickness = Math.max(0.5, (groupWidth - gap * (count - 1)) / count);
    const placement = props.valueLabels ?? (props.values === false ? 'none' : theme.bar.valueLabels)
      ?? ((props.values ?? theme.defaults.values) ? (stacked ? 'inside' : 'outside') : 'none');
    const insideValues = placement === 'inside';
    const categoryStride = horizontal ? 1 : Math.max(1, Math.ceil(type.labelSize * 4.5 / band));
    return <Plot title={props.title} width={width} height={height} theme={theme} fluid={layoutWidth !== undefined}>
        {ticksFor(scale.ticks, horizontal ? plotWidth : plotHeight, horizontal ? tickSpace : type.labelSize).map((tick, i) => <g key={i}>
          {theme.defaults.grid && <line x1={horizontal ? valueAt(tick) : left} y1={horizontal ? top : valueAt(tick)}
            x2={horizontal ? valueAt(tick) : right} y2={horizontal ? bottom : valueAt(tick)} stroke={surface.grid} />}
          <text x={horizontal ? valueAt(tick) : left - 10} y={horizontal ? bottom + type.labelSize + type.valueSize + 10 : valueAt(tick) + 4}
            fill={surface.mutedText} textAnchor={horizontal ? 'middle' : 'end'}>{compact(tick)}<title>{format(tick)}</title></text>
        </g>)}
        <line data-baseline="" x1={horizontal ? valueAt(0) : left} y1={horizontal ? top : valueAt(0)}
          x2={horizontal ? valueAt(0) : right} y2={horizontal ? bottom : valueAt(0)} stroke={surface.axis} />
        {props.data.map((row, rowIndex) => {
          let positive = 0, negative = 0;
          const groupStart = (horizontal ? top : left) + rowIndex * band + (band - groupWidth) / 2;
          return <g key={row.id}>
            {rowIndex % categoryStride === 0 && <text data-category-label="" x={horizontal ? left - 12 : left + (rowIndex + 0.5) * band}
              y={horizontal ? top + (rowIndex + 0.5) * band + 4 : bottom + type.labelSize + type.valueSize + 10}
              textAnchor={horizontal ? 'end' : 'middle'} fill={surface.text}>
              {horizontal ? fitText(row.label, left - 20, type.labelSize) : wrappedText(row.label, band * categoryStride - 8, type.labelSize).map((line, index) =>
                <tspan key={index} x={left + (rowIndex + .5) * band} dy={index ? type.labelSize * 1.2 : 0}>{line}</tspan>)}<title>{row.label}</title>
            </text>}
            {props.series.map((series, index) => {
              const value = row.values[series.id];
              if (value == null) return null;
              const start = stacked ? (value >= 0 ? positive : negative) : 0;
              const end = start + value;
              if (value >= 0) positive = end; else negative = end;
              const ink = inkFor(series, index, props, theme);
              const length = Math.abs(valueAt(end) - valueAt(start));
              const cross = groupStart + (stacked ? 0 : index * (thickness + gap));
              const along = Math.min(valueAt(start), valueAt(end));
              return <g key={series.id}>
                <rect data-bar="" data-series={series.id} data-category={row.id} data-value={value}
                  x={horizontal ? along : cross} y={horizontal ? cross : along}
                  width={horizontal ? length : thickness} height={horizontal ? thickness : length}
                  rx={stacked ? 0 : bounded(theme.bar.radius, 0, 0, Math.min(thickness, length) / 2)}
                  fill={ink.color} stroke={surface.background} strokeWidth={bounded(theme.bar.separatorWidth, 0, 0, 8)}
                  style={{ transformOrigin: horizontal ? `${valueAt(0)}px 0px` : `0px ${valueAt(0)}px` }}>
                  <title>{`${row.label} — ${series.label}: ${format(value)}`}</title>
                </rect>
                {placement !== 'none' && (horizontal ? thickness >= type.valueSize * 1.2 : thickness >= textWidth(compact(value), type.valueSize)) && (!insideValues || length > type.valueSize * (horizontal ? 4 : 1.5)) && <text
                  x={horizontal ? (insideValues ? along + length / 2 : valueAt(end) + (value < 0 ? -6 : 6)) : cross + thickness / 2}
                  y={horizontal ? cross + thickness / 2 + type.valueSize / 3 : (insideValues ? along + length / 2 + type.valueSize / 3 : valueAt(end) + (value < 0 ? type.valueSize + 4 : -6))}
                  textAnchor={horizontal && !insideValues ? (value < 0 ? 'end' : 'start') : 'middle'}
                  fill={insideValues ? ink.labelColor : surface.text} fontFamily={type.valueFamily} fontSize={type.valueSize} fontWeight={type.valueWeight}>{compact(value)}<title>{format(value)}</title></text>}
              </g>;
            })}
            {stacked && (horizontal || groupWidth >= valueSpace) && (props.totals ?? theme.bar.totals) && [positive, negative].filter((total) => total !== 0).map((total) =>
              <text key={total > 0 ? 'positive' : 'negative'} data-stack-total=""
                x={horizontal ? valueAt(total) + (total < 0 ? -6 : 6) : groupStart + groupWidth / 2}
                y={horizontal ? groupStart + groupWidth / 2 + type.valueSize / 3 : valueAt(total) + (total < 0 ? type.valueSize + 4 : -6)}
                textAnchor={horizontal ? (total < 0 ? 'end' : 'start') : 'middle'} fill={surface.text}
                fontFamily={type.valueFamily} fontSize={type.valueSize} fontWeight={type.valueWeight}>{compact(total)}<title>{format(total)}</title></text>)}
          </g>;
        })}
      </Plot>;
  }
  return <Frame props={props} theme={theme} kind="bar" horizontal={horizontal} series={props.series}
    empty={!all.length} table={<RowTable props={props} />}>
    <ResponsivePlots props={props} render={renderPlot} />
  </Frame>;
}

// Label relaxation is deterministic on the server; endpoint and pie labels
// keep their real anchor via leader lines when moved to avoid a collision.
function spreadLabels<T extends { y: number }>(items: T[], min: number, max: number, gap: number): (T & { labelY: number })[] {
  if (!items.length) return [];
  const sorted = [...items].sort((a, b) => a.y - b.y);
  const actualGap = Math.min(gap, (max - min) / Math.max(1, items.length - 1));
  const output = sorted.map((item, i) => ({ ...item, labelY: Math.max(min + i * actualGap, item.y) }));
  for (let i = 1; i < output.length; i++) output[i]!.labelY = Math.max(output[i]!.labelY, output[i - 1]!.labelY + actualGap);
  output[output.length - 1]!.labelY = Math.min(max, output[output.length - 1]!.labelY);
  for (let i = output.length - 2; i >= 0; i--) output[i]!.labelY = Math.min(output[i]!.labelY, output[i + 1]!.labelY - actualGap);
  return output;
}

export function LineChart(props: LineChartProps) {
  validateRows(props.data, props.series);
  const theme = themeFor(props, 'line');
  const { surface, typography: type } = theme;
  const format = formatFor(props);
  const compact = compactFor(props);
  const all = props.data.flatMap((row) => props.series.map((s) => row.values[s.id]).filter((v): v is number => v != null));
  const scale = scaleFor(all, props.includeZero ?? true);
  function renderPlot(layoutWidth?: number) {
    const tickSpace = axisSpace(scale.ticks, compact, type.labelSize);
    const width = Math.max(layoutWidth ?? 640, tickSpace + 120,
      props.data.length > 40 ? tickSpace + props.data.length * 14 : 0);
    const showLabels = (props.labels ?? theme.defaults.lineLabels) === 'end';
    const below = layoutWidth !== undefined && layoutWidth < 600;
    const labelWidth = showLabels && !below ? Math.min(width * .32, Math.max(...props.series.map((series) => textWidth(series.label, type.labelSize)), 0) + 28) : 24;
    const height = Math.max(bounded(props.height, 320, 200, 1200), props.series.length * (type.labelSize + 8) + 80, type.labelSize * 9);
    const left = tickSpace, right = width - labelWidth, top = Math.max(24, type.labelSize), bottom = height - type.labelSize * 3.2 - 24;
    const extraHeight = showLabels && below ? props.series.length * (type.labelSize * 1.6 + 6) : 0;
    const categoryStride = Math.max(1, Math.ceil(props.data.length * type.labelSize * 4.5 / (right - left)));
    const x = (index: number) => props.data.length < 2 ? (left + right) / 2 : left + index / (props.data.length - 1) * (right - left);
    const y = (value: number) => bottom - scale.at(value) * (bottom - top);
    const lines = props.series.map((series, index) => {
      const runs: { x: number; y: number; value: number; label: string }[][] = [];
      let run: typeof runs[number] = [];
      for (let i = 0; i < props.data.length; i++) {
        const row = props.data[i]!;
        const value = row.values[series.id];
        if (value == null) { if (run.length) runs.push(run); run = []; }
        else run.push({ x: x(i), y: y(value), value, label: row.label });
      }
      if (run.length) runs.push(run);
      return { series, index, runs, ink: inkFor(series, index, props, theme), end: runs.at(-1)?.at(-1) };
    });
    const labels = spreadLabels(lines.filter((line) => line.end).map((line) => ({ ...line, y: line.end!.y })), top, bottom, type.labelSize + 6);
    return <Plot title={props.title} width={width} height={height + extraHeight} theme={theme} fluid={layoutWidth !== undefined}>
        {ticksFor(scale.ticks, bottom - top, type.labelSize).map((tick, i) => <g key={i}>
          {theme.defaults.grid && <line x1={left} y1={y(tick)} x2={right} y2={y(tick)} stroke={surface.grid} />}
          <text x={left - 10} y={y(tick) + 4} textAnchor="end" fill={surface.mutedText}>{compact(tick)}<title>{format(tick)}</title></text>
        </g>)}
        <line x1={left} y1={bottom} x2={right} y2={bottom} stroke={surface.axis} />
        {props.data.map((row, index) => index % categoryStride === 0 && <text data-category-label="" key={row.id} x={x(index)} y={bottom + type.labelSize + 12} textAnchor={index === 0 ? 'start' : index === props.data.length - 1 ? 'end' : 'middle'} fill={surface.mutedText}>
          {wrappedText(row.label, (right - left) / Math.max(1, Math.ceil(props.data.length / categoryStride)) - 8, type.labelSize).map((line, i) =>
            <tspan key={i} x={x(index)} dy={i ? type.labelSize * 1.2 : 0}>{line}</tspan>)}<title>{row.label}</title>
        </text>)}
        {lines.map(({ series, index, runs, ink }) => <g key={series.id} data-series={series.id}>
          {runs.map((run, runIndex) => <g key={runIndex}>
            <path data-line="" data-solid={!theme.line.dashPatterns[index % (theme.line.dashPatterns.length || 1)] || undefined}
              d={run.map((point, i) => `${i ? 'L' : 'M'}${point.x},${point.y}`).join(' ')}
              fill="none" stroke={ink.color} strokeWidth={bounded(theme.line.width, 2, 0.5, 12)}
              strokeDasharray={theme.line.dashPatterns[index % (theme.line.dashPatterns.length || 1)]}
              pathLength={theme.line.dashPatterns[index % (theme.line.dashPatterns.length || 1)] ? undefined : 1}>
              <title>{series.label}</title>
            </path>
            {run.map((point, i) => <circle key={i} data-point="" cx={point.x} cy={point.y}
              r={run.length === 1 ? Math.max(3, bounded(theme.line.pointRadius, 0, 0, 12)) : bounded(theme.line.pointRadius, 0, 0, 12)} fill={ink.color}>
              <title>{`${point.label} — ${series.label}: ${format(point.value)}`}</title>
            </circle>)}
          </g>)}
        </g>)}
        {showLabels && !below && labels.map((line) => <g key={line.series.id}>
          <path d={`M${line.end!.x},${line.end!.y} L${right + 12},${line.labelY} L${right + 18},${line.labelY}`} fill="none" stroke={line.ink.color} />
          <text data-end-label="" x={right + 24} y={line.labelY + 4} fill={surface.text}>{fitText(line.series.label, labelWidth - 30, type.labelSize)}<title>{line.series.label}</title></text>
        </g>)}
        {showLabels && below && lines.filter((line) => line.end).map((line, index) => <g key={line.series.id}>
          <circle cx={8} cy={height + index * (type.labelSize * 1.6 + 6) + type.labelSize / 2} r={3} fill={line.ink.color} />
          <text data-end-label="" x={20} y={height + index * (type.labelSize * 1.6 + 6) + type.labelSize} fill={surface.text}>
            {fitText(line.series.label, width - 40 - textWidth(compact(line.end!.value), type.labelSize), type.labelSize)}<title>{line.series.label}</title>
          </text>
          <text data-end-value="" x={width - 8} y={height + index * (type.labelSize * 1.6 + 6) + type.labelSize} textAnchor="end" fill={surface.text}>
            {compact(line.end!.value)}<title>{format(line.end!.value)}</title>
          </text>
        </g>)}
      </Plot>;
  }
  return <Frame props={props} theme={theme} kind="line" series={props.series} empty={!all.length} table={<RowTable props={props} />}>
    <ResponsivePlots props={props} render={renderPlot} />
  </Frame>;
}

function polar(cx: number, cy: number, radius: number, angle: number) {
  // V8 versions can disagree in the last bits of sin/cos. Raw coordinates
  // caused hydration warnings in a ten-slice pie despite identical inputs.
  // Subpixel rounding keeps server and browser markup identical.
  return { x: Number((cx + radius * Math.cos(angle)).toFixed(4)), y: Number((cy + radius * Math.sin(angle)).toFixed(4)) };
}

// Two half-arcs also represent a full circle. A single 360° SVG arc collapses
// because its endpoints coincide, which used to erase a 100% slice in charts.
function slicePath(cx: number, cy: number, outer: number, inner: number, start: number, end: number) {
  const mid = (start + end) / 2;
  const a = polar(cx, cy, outer, start), b = polar(cx, cy, outer, mid), c = polar(cx, cy, outer, end);
  const edge = `M${a.x},${a.y} A${outer},${outer} 0 0 1 ${b.x},${b.y} A${outer},${outer} 0 0 1 ${c.x},${c.y}`;
  if (!inner) return `${edge} L${cx},${cy} Z`;
  const d = polar(cx, cy, inner, end), e = polar(cx, cy, inner, mid), f = polar(cx, cy, inner, start);
  return `${edge} L${d.x},${d.y} A${inner},${inner} 0 0 0 ${e.x},${e.y} A${inner},${inner} 0 0 0 ${f.x},${f.y} Z`;
}

export function PieChart(props: PieChartProps) {
  unique(props.data, 'Category');
  for (const item of props.data) if (typeof item.value !== 'number' || !Number.isFinite(item.value) || item.value < 0) {
    throw new Error(`Pie value for "${item.id}" must be finite and nonnegative.`);
  }
  const kind = props.variant ?? 'pie';
  const theme = themeFor(props, kind);
  const { typography: type, surface } = theme;
  const format = formatFor(props);
  const percentage = new Intl.NumberFormat(props.locale ?? 'en-US', { style: 'percent', maximumFractionDigits: 1 });
  // Ratios are computed after normalization so several large finite inputs do
  // not overflow their sum to Infinity and render NaN paths.
  const max = props.data.reduce((value, item) => Math.max(value, item.value), 0);
  const total = max ? props.data.reduce((sum, item) => sum + item.value / max, 0) : 0;
  const labels = props.labels ?? theme.pie.labels;
  const categoryLabels = props.categoryLabels ?? (props.labels ? undefined : theme.pie.categoryLabels)
    ?? (labels === 'outside' ? 'outside' : labels === 'inside' && theme.pie.insideLabel === 'label-percent' ? 'inside' : 'none');
  const valueLabels = props.valueLabels ?? (props.labels ? undefined : theme.pie.valueLabels) ?? labels;
  const valueContent = props.valueContent ?? theme.pie.valueContent ?? (theme.pie.insideLabel === 'value' ? 'value' : 'percent');
  const numericText = (item: PieDatum) => valueContent === 'value' ? compactFor(props)(item.value)
    : percentage.format(total ? (item.value / max) / total : 0);
  const hasOutside = categoryLabels === 'outside' || valueLabels === 'outside';
  const hasInside = categoryLabels === 'inside' || valueLabels === 'inside';
  const table = <table data-chart-table=""><caption>{props.title} — data{props.centerValue && <> — {props.centerLabel ? `${props.centerLabel}: ` : ''}{props.centerValue}</>}</caption>
    <thead><tr><th scope="col">Category</th><th scope="col">Value</th><th scope="col">Share</th></tr></thead>
    <tbody>{props.data.map((item) => <tr key={item.id}><th scope="row">{item.label}</th><td>{format(item.value)}</td>
      <td>{total ? percentage.format((item.value / max) / total) : '—'}</td></tr>)}</tbody></table>;
  function renderPlot(layoutWidth?: number) {
    const labelInset = Math.max(24, type.labelSize * 1.5);
    const outsideText = (item: PieDatum) => [categoryLabels === 'outside' ? short(item.label, 13) : '', valueLabels === 'outside' ? numericText(item) : ''].filter(Boolean).join(' ');
    const labelWidth = props.data.reduce((width, item) => Math.max(width, textWidth(outsideText(item), type.labelSize)), 0);
    const width = Math.max(layoutWidth ?? (hasOutside ? Math.max(640, 2 * (145 + 28 + labelWidth + 16)) : 640),
      hasOutside ? Math.max(0, ...props.data.map((item) => valueLabels === 'outside' ? textWidth(numericText(item), type.labelSize) : 0)) + type.labelSize * 3 + 32 : 0);
    const below = hasOutside && layoutWidth !== undefined && width < 2 * (100 + 28 + labelWidth + 16);
    const height = Math.max(bounded(props.height, 320, 200, 1200), !below && hasOutside ? props.data.length * (type.labelSize + 8) + labelInset * 2 : 0);
    const radius = Math.max(24, Math.min(height / 2 - 24, width / 2 - 16, hasOutside && !below ? width / 2 - labelWidth - 44 : 240));
    const cx = width / 2, cy = height / 2;
    const extraHeight = below ? props.data.length * (type.labelSize * 1.6 + 6) : 0;
    const inner = kind === 'donut' ? radius * bounded(theme.pie.innerRadius, 0.6, 0.1, 0.9) : 0;
    let angle = bounded(theme.pie.startAngle, -90, -360, 360) / 180 * Math.PI;
    const slices = props.data.map((item, index) => {
      const share = max && total ? (item.value / max) / total : 0;
      const start = angle; angle += share * Math.PI * 2;
      const mid = (start + angle) / 2;
      const edge = polar(cx, cy, radius + 4, mid);
      return { item, share, start, end: angle, mid, edge, y: edge.y, right: edge.x >= cx, ink: inkFor(item, index, props, theme) };
    }).filter((slice) => slice.share > 0);
    const outside = [false, true].flatMap((right) => spreadLabels(slices.filter((s) => s.right === right), labelInset, height - labelInset, type.labelSize + 8));
    return <Plot title={props.title} width={width} height={height + extraHeight} theme={theme} fluid={layoutWidth !== undefined} fixed>
        {slices.map((slice) => {
          const point = polar(cx, cy, (radius + inner) / 2, slice.mid);
          return <g key={slice.item.id}>
            <path data-slice="" data-category={slice.item.id} data-share={slice.share}
              d={slicePath(cx, cy, radius, inner, slice.start, slice.end)} fill={slice.ink.color}
              stroke={surface.background} strokeWidth={bounded(theme.pie.separatorWidth, 0, 0, 12)}>
              <title>{`${slice.item.label}: ${format(slice.item.value)} (${percentage.format(slice.share)})`}</title>
            </path>
            {hasInside && slice.share >= 0.05 && textWidth(valueLabels === 'inside' ? numericText(slice.item) : fitText(slice.item.label, (radius - inner) * 1.2, type.valueSize), type.valueSize) < (radius - inner) * 1.5 && slice.share * Math.PI * (radius + inner) > type.valueSize * 2 && <text data-pie-inside-label="" x={point.x} y={point.y + type.valueSize / 3} textAnchor="middle"
              fill={slice.ink.labelColor} fontFamily={type.valueFamily} fontSize={type.valueSize} fontWeight={type.valueWeight}>
              {valueLabels === 'inside' ? numericText(slice.item) : fitText(slice.item.label, (radius - inner) * 1.2, type.valueSize)}
              {categoryLabels === 'inside' && valueLabels === 'inside' && slice.share >= 0.15 && <tspan x={point.x} dy={type.labelSize + 4}
                fontFamily={type.labelFamily} fontSize={type.labelSize} fontWeight={type.labelWeight}>{fitText(slice.item.label, (radius - inner) * 1.2, type.labelSize)}</tspan>}
            </text>}
          </g>;
        })}
        {hasOutside && !below && outside.map((slice) => {
          const x = cx + (slice.right ? 1 : -1) * (radius + 22);
          return <g key={slice.item.id}>
            <path d={`M${slice.edge.x},${slice.edge.y} L${x},${slice.labelY}`} stroke={surface.axis} fill="none" />
            <text data-pie-label="" x={x + (slice.right ? 6 : -6)} y={slice.labelY + 4} fill={surface.text} textAnchor={slice.right ? 'start' : 'end'}>
              {outsideText(slice.item)}<title>{slice.item.label}</title>
            </text>
          </g>;
        })}
        {kind === 'donut' && <g textAnchor="middle" fill={surface.focalText ?? surface.text}>
          {props.centerValue && <text x={cx} y={cy + (props.centerLabel ? -2 : type.displaySize / 3)}
            fontFamily={type.displayFamily} data-center-value="" fontSize={Math.max(12, Math.min(type.displaySize, inner * 1.5 / Array.from(props.centerValue).length))}
            fontWeight={type.displayWeight}>{fitText(props.centerValue, inner * 1.5, Math.max(12, Math.min(type.displaySize, inner * 1.5 / Array.from(props.centerValue).length)))}<title>{props.centerValue}</title></text>}
          {props.centerLabel && <text x={cx} y={cy + (props.centerValue ? Math.min(type.labelSize, Math.max(12, inner / 3)) + 6 : 4)} data-center-label="" fontSize={Math.min(type.labelSize, Math.max(12, inner / 3))} fill={surface.mutedText}>
            {fitText(props.centerLabel, inner * 1.4, Math.min(type.labelSize, Math.max(12, inner / 3)))}<title>{props.centerLabel}</title>
          </text>}
        </g>}
        {below && slices.map((slice, index) => <g key={slice.item.id}>
          <circle cx={8} cy={height + index * (type.labelSize * 1.6 + 6) + type.labelSize / 2} r={4} fill={slice.ink.color} />
          <text data-pie-label="" x={20} y={height + index * (type.labelSize * 1.6 + 6) + type.labelSize} fill={surface.text}>
            {categoryLabels === 'outside' && fitText(slice.item.label, width - 32 - (valueLabels === 'outside' ? textWidth(numericText(slice.item), type.labelSize) : 0), type.labelSize)} {valueLabels === 'outside' && numericText(slice.item)}<title>{slice.item.label}</title>
          </text>
        </g>)}
      </Plot>;
  }
  return <Frame props={props} theme={theme} kind={kind} series={props.data} empty={!total} table={table}>
    <ResponsivePlots props={props} render={renderPlot} />
  </Frame>;
}

function validateXY(data: ScatterDatum[], series: ChartSeries[], bubble: boolean) {
  unique(data, 'Observation'); unique(series, 'Series');
  const known = new Set(series.map((item) => item.id));
  for (const item of data) {
    if (!known.has(item.seriesId)) throw new Error(`Unknown series "${item.seriesId}" for observation "${item.id}".`);
    for (const key of ['x', 'y'] as const) {
      if (item[key] !== null && (typeof item[key] !== 'number' || !Number.isFinite(item[key]))) {
        throw new Error(`Observation "${item.id}" requires a finite ${key} coordinate, or null for missing data.`);
      }
    }
    if (bubble) {
      const size = (item as BubbleDatum).size;
      if (size !== null && (typeof size !== 'number' || !Number.isFinite(size) || size < 0)) {
        throw new Error(`Bubble size for "${item.id}" must be finite and nonnegative, or null.`);
      }
    }
  }
}

function numericAxis(values: number[], axis: ChartAxis | undefined, name: string) {
  if (!axis?.domain) return scaleFor(values, axis?.includeZero ?? true);
  const [min, max] = axis.domain;
  if (axis.domain.length !== 2 || !Number.isFinite(min) || !Number.isFinite(max) || min >= max) {
    throw new Error(`${name} domain must contain two finite, increasing numbers.`);
  }
  if (values.some((value) => value < min || value > max)) {
    throw new Error(`${name} domain must include every plotted observation.`);
  }
  return scaleFor([min, max], false);
}

// Fit in normalized plot coordinates to avoid overflow in x*x and x*y for
// otherwise finite inputs. The affine axis mapping preserves the OLS fit.
function fitLine(points: { u: number; v: number }[]) {
  if (points.length < 2) return null;
  const meanX = points.reduce((sum, p) => sum + p.u / points.length, 0);
  const meanY = points.reduce((sum, p) => sum + p.v / points.length, 0);
  const variance = points.reduce((sum, p) => sum + (p.u - meanX) ** 2, 0);
  if (!variance) return null; // A vertical cloud has no finite y-on-x fit.
  const slope = points.reduce((sum, p) => sum + (p.u - meanX) * (p.v - meanY), 0) / variance;
  const intercept = meanY - slope * meanX;
  let from = points.reduce((min, p) => Math.min(min, p.u), 1);
  let to = points.reduce((max, p) => Math.max(max, p.u), 0);
  // Clip the fitted segment, not its endpoint Y values independently (which
  // would change the slope). Never extrapolate beyond the observed X range.
  if (slope) {
    const a = -intercept / slope, b = (1 - intercept) / slope;
    from = Math.max(from, Math.min(a, b));
    to = Math.min(to, Math.max(a, b));
  }
  if (from > to || ![from, to, slope, intercept].every(Number.isFinite)) return null;
  return { from, to, yFrom: Math.max(0, Math.min(1, slope * from + intercept)), yTo: Math.max(0, Math.min(1, slope * to + intercept)) };
}

function XYPlot({ props, kind }: { props: ScatterChartProps | BubbleChartProps; kind: 'scatter' | 'bubble' }) {
  const bubble = kind === 'bubble';
  const bubbleProps = props as BubbleChartProps;
  validateXY(props.data, props.series, bubble);
  const theme = themeFor(props, kind);
  const { typography: type, surface } = theme;
  const labels = props.labels ?? (bubble ? theme.bubble.labels : theme.scatter.labels);
  const formatX = formatFor({ ...props, numberFormat: props.xAxis?.numberFormat ?? props.numberFormat, suffix: props.xAxis?.suffix ?? props.suffix });
  const formatY = formatFor({ ...props, numberFormat: props.yAxis?.numberFormat ?? props.numberFormat, suffix: props.yAxis?.suffix ?? props.suffix });
  const formatSize = formatFor({ ...props, numberFormat: bubbleProps.sizeNumberFormat ?? props.numberFormat, suffix: bubbleProps.sizeSuffix ?? props.suffix });
  const compactX = compactFor({ ...props, numberFormat: props.xAxis?.numberFormat ?? props.numberFormat, suffix: props.xAxis?.suffix ?? props.suffix });
  const compactY = compactFor({ ...props, numberFormat: props.yAxis?.numberFormat ?? props.numberFormat, suffix: props.yAxis?.suffix ?? props.suffix });
  const compactSize = compactFor({ ...props, numberFormat: bubbleProps.sizeNumberFormat ?? props.numberFormat, suffix: bubbleProps.sizeSuffix ?? props.suffix });
  const xName = props.xAxis?.label ?? 'X', yName = props.yAxis?.label ?? 'Y', sizeName = bubbleProps.sizeLabel ?? 'Size';
  const complete = props.data.filter((item) => item.x !== null && item.y !== null && (!bubble || (item as BubbleDatum).size !== null));
  const xScale = numericAxis(complete.map((item) => item.x!), props.xAxis, 'X');
  const yScale = numericAxis(complete.map((item) => item.y!), props.yAxis, 'Y');
  const observedMax = bubble ? complete.reduce((max, item) => Math.max(max, (item as BubbleDatum).size!), 0) : 0;
  if (bubble && bubbleProps.sizeMax !== undefined && (!Number.isFinite(bubbleProps.sizeMax) || bubbleProps.sizeMax <= 0 || bubbleProps.sizeMax < observedMax)) {
    throw new Error('sizeMax must be a positive finite number covering every plotted bubble size.');
  }
  const sizeMax = bubbleProps.sizeMax ?? observedMax;
  const table = <table data-chart-table=""><caption>{props.title} — data</caption>
    <thead><tr><th scope="col">Observation</th><th scope="col">Series</th><th scope="col">{xName}</th><th scope="col">{yName}</th>{bubble && <th scope="col">{sizeName}</th>}</tr></thead>
    <tbody>{props.data.map((item) => <tr key={item.id}><th scope="row">{item.label}</th><td>{props.series.find((series) => series.id === item.seriesId)!.label}</td>
      <td>{item.x === null ? 'No data' : formatX(item.x)}</td><td>{item.y === null ? 'No data' : formatY(item.y)}</td>
      {bubble && <td>{(item as BubbleDatum).size === null ? 'No data' : formatSize((item as BubbleDatum).size!)}</td>}
    </tr>)}</tbody></table>;
  function renderPlot(layoutWidth?: number) {
    const axisWidth = axisSpace(yScale.ticks, compactY, type.labelSize) + type.labelSize * 1.5;
    const below = layoutWidth !== undefined && layoutWidth < 600;
    const outside = labels === 'outside';
    const railWidth = outside && !below ? Math.min((layoutWidth ?? 640) * .3, Math.max(160, type.labelSize * 16 + 28)) : 20;
    const width = Math.max(layoutWidth ?? 640, axisWidth + railWidth + 140);
    const configuredRadius = bubble ? bounded(theme.bubble.maxRadius, BUBBLE.maxRadius, 8, 96) : bounded(theme.scatter.radius, SCATTER.radius, 1, 24);
    const maxRadius = Math.min(configuredRadius, Math.max(8, (width - axisWidth - railWidth) / 6));
    const strokeWidth = bubble ? bounded(theme.bubble.strokeWidth, BUBBLE.strokeWidth, 0, 8) : bounded(theme.scatter.strokeWidth, 0, 0, 8);
    const pad = maxRadius + strokeWidth / 2 + 8;
    // A shared maximum is a real zero-to-maximum area scale. No minimum radius:
    // adding one exaggerates small values and turns zero into nonzero area.
    const radiusFor = (size: number) => sizeMax ? maxRadius * (Math.sqrt(size) / Math.sqrt(sizeMax)) : 0;
    const seriesMap = new Map(props.series.map((series, index) => [series.id, { series, index }]));
    const points = complete.filter((item) => !bubble || (item as BubbleDatum).size! > 0).map((item) => {
      const { series, index } = seriesMap.get(item.seriesId)!;
      return { item, ink: inkFor(series, index, props, theme), u: xScale.at(item.x!), v: yScale.at(item.y!),
        radius: bubble ? radiusFor((item as BubbleDatum).size!) : maxRadius };
    });
    const plotHeight = Math.max(bounded(props.height, 320, 200, 1200), pad * 2 + type.labelSize * 9 + 64,
      outside && !below ? points.length * (type.labelSize * 1.6 + 6) + 64 : 0);
    const left = axisWidth, right = width - railWidth, top = 24, bottom = plotHeight - type.labelSize * 3 - 20;
    const x = (u: number) => Number((left + pad + u * (right - left - 2 * pad)).toFixed(4));
    const y = (v: number) => Number((bottom - pad - v * (bottom - top - 2 * pad)).toFixed(4));
    const refs = [...new Set([sizeMax / 4, sizeMax / 2, sizeMax].filter((value) => value > 0))];
    const showSizeLegend = bubble && (bubbleProps.sizeLegend ?? theme.bubble.sizeLegend) && points.length > 0;
    const rowHeight = Math.max(maxRadius * 2 + 12, type.labelSize * 1.6 + 8);
    const legendHeight = showSizeLegend ? (below ? refs.length * rowHeight + type.labelSize * 2 + 24 : maxRadius * 2 + type.labelSize * 4 + 28) : 0;
    const labelHeight = outside && below ? points.length * (type.labelSize * 1.6 + 6) : 0;
    const treatment = bubbleProps.treatment ?? theme.bubble.treatment;
    const ringCount = Math.round(bounded(theme.bubble.ringCount, BUBBLE.ringCount, 2, 16));
    const fillOpacity = bounded(bubble ? theme.bubble.fillOpacity : theme.scatter.fillOpacity, bubble ? 0.8 : 1, 0, 1);
    const pointLabels = outside && !below ? spreadLabels(points.map((point) => ({ ...point, y: y(point.v) })), top + type.labelSize, bottom - type.labelSize, type.labelSize * 1.6 + 6) : [];
    return <Plot title={props.title} width={width} height={plotHeight + legendHeight + labelHeight} theme={theme} fluid={layoutWidth !== undefined}>
        {ticksFor(xScale.ticks, right - left - 2 * pad, axisSpace(xScale.ticks, compactX, type.labelSize)).map((tick, index) => <g key={`x-${index}`}>
          {theme.defaults.grid && <line x1={x(xScale.at(tick))} x2={x(xScale.at(tick))} y1={top} y2={bottom} stroke={surface.grid} />}
          <text data-x-tick="" x={x(xScale.at(tick))} y={bottom + type.labelSize + 8} textAnchor="middle" fill={surface.mutedText}>
            {compactX(tick)}<title>{formatX(tick)}</title>
          </text>
        </g>)}
        {ticksFor(yScale.ticks, bottom - top - 2 * pad, type.labelSize).map((tick, index) => <g key={`y-${index}`}>
          {theme.defaults.grid && <line x1={left} x2={right} y1={y(yScale.at(tick))} y2={y(yScale.at(tick))} stroke={surface.grid} />}
          <text data-y-tick="" x={left - 10} y={y(yScale.at(tick)) + type.labelSize / 3} textAnchor="end" fill={surface.mutedText}>
            {compactY(tick)}<title>{formatY(tick)}</title>
          </text>
        </g>)}
        <path d={`M${left},${top} V${bottom} H${right}`} fill="none" stroke={surface.axis} />
        <text x={(left + right) / 2} y={plotHeight - 6} textAnchor="middle" fill={surface.text}>{fitText(xName, right - left, type.labelSize)}<title>{xName}</title></text>
        <text transform={`translate(${type.labelSize},${(top + bottom) / 2}) rotate(-90)`} textAnchor="middle" fill={surface.text}>
          {short(yName, Math.max(6, Math.floor((bottom - top) / type.labelSize)))}<title>{yName}</title>
        </text>
        {!bubble && (props as ScatterChartProps).trendLine === 'linear' && props.series.map((series, index) => {
          const fit = fitLine(points.filter((p) => p.item.seriesId === series.id));
          return fit && <line key={series.id} data-trend-line="" data-series={series.id}
            x1={x(fit.from)} y1={y(fit.yFrom)} x2={x(fit.to)} y2={y(fit.yTo)}
            stroke={surface.trend ?? inkFor(series, index, props, theme).color} strokeWidth={bounded(theme.scatter.trendWidth, 1.5, 0.5, 8)}>
            <title>{`${series.label}: linear least-squares trend`}</title>
          </line>;
        })}
        {/* Paint larger bubbles first so a small observation at the same location
            is not buried. Resolve colors before sorting and keep table source order. */}
        {[...points].sort((a, b) => b.radius - a.radius).map((point) => {
          const px = x(point.u), py = y(point.v);
          const size = (point.item as BubbleDatum).size;
          const text = bubble ? compactSize(size!) : '';
          const textSize = Math.min(type.displaySize, point.radius * 1.6 / Math.max(1, text.length * 0.65));
          // Coordinates must remain truthful. When bubbles overlap, defer their
          // inside labels to the table rather than displacing or overprinting them.
          const isolated = points.every((other) => other === point || Math.hypot(x(other.u) - px, y(other.v) - py) > other.radius + point.radius + 2);
          const label = `${point.item.label} — ${xName}: ${formatX(point.item.x!)}; ${yName}: ${formatY(point.item.y!)}${bubble ? `; ${sizeName}: ${formatSize(size!)}` : ''}`;
          return <g key={point.item.id} data-point="" data-observation={point.item.id} data-series={point.item.seriesId}>
            <title>{label}</title>
            <circle data-bubble={bubble ? '' : undefined} data-scatter-point={bubble ? undefined : ''}
              cx={px} cy={py} r={point.radius} fill={bubble && treatment === 'rings' ? 'none' : point.ink.color}
              fillOpacity={fillOpacity} stroke={point.ink.color} strokeWidth={bubble && treatment === 'rings' ? Math.max(0.5, strokeWidth) : strokeWidth} />
            {bubble && treatment === 'rings' && Array.from({ length: ringCount - 1 }, (_, index) => <circle key={index}
              data-bubble-ring="" cx={px} cy={py} r={point.radius * (index + 1) / ringCount} fill="none"
              stroke={point.ink.color} strokeWidth={Math.max(0.5, strokeWidth)} />)}
            {bubble && labels === 'inside' && isolated && textSize >= Math.max(12, type.labelSize * 0.75) && <text data-bubble-label=""
              x={px} y={py + textSize / 3} textAnchor="middle" fontFamily={type.displayFamily} fontWeight={type.displayWeight} fontSize={textSize}
              fill={treatment === 'rings' ? (surface.focalText ?? surface.text) : point.ink.labelColor}
              stroke={treatment === 'rings' ? surface.background : undefined}
              strokeWidth={treatment === 'rings' ? bounded(theme.bubble.labelHaloWidth, 0, 0, 8) : undefined} paintOrder="stroke">{text}</text>}
          </g>;
        })}
        {pointLabels.map((point) => <g key={point.item.id}>
          <path d={`M${x(point.u) + point.radius},${point.y} L${right + 10},${point.labelY} H${right + 16}`} fill="none" stroke={point.ink.color} />
          <text data-observation-label="" x={right + 22} y={point.labelY + type.labelSize / 3} fill={surface.text}>
            {fitText(point.item.label, railWidth - 28, type.labelSize)}<title>{point.item.label}</title>
          </text>
        </g>)}
        {showSizeLegend && <g data-size-legend="" fill={surface.mutedText}>
          <text x={8} y={plotHeight + type.labelSize + 12}>{fitText(`${sizeName} (circle area)`, width - 16, type.labelSize)}<title>{`${sizeName}: circle area represents the value`}</title></text>
          {refs.map((value, index) => {
            const px = below ? maxRadius + 12 : (index + 0.5) * width / refs.length;
            const floor = plotHeight + type.labelSize * 2 + 20 + (below ? (index + 1) * rowHeight : maxRadius * 2);
            const radius = radiusFor(value);
            return <g key={index}>
              <circle data-size-reference="" data-size={value} cx={px} cy={floor - radius} r={radius} fill="none" stroke={surface.mutedText} />
              <text x={below ? maxRadius * 2 + 24 : px} y={below ? floor - maxRadius + type.labelSize / 3 : floor + type.labelSize + 6} textAnchor={below ? 'start' : 'middle'}>
                {compactSize(value)}<title>{formatSize(value)}</title>
              </text>
            </g>;
          })}
        </g>}
        {outside && below && points.map((point, index) => <g key={point.item.id}>
          <circle cx={8} cy={plotHeight + legendHeight + index * (type.labelSize * 1.6 + 6) + type.labelSize / 2} r={3} fill={point.ink.color} />
          <text data-observation-label="" x={20} y={plotHeight + legendHeight + index * (type.labelSize * 1.6 + 6) + type.labelSize} fill={surface.text}>
            {fitText(point.item.label, width - 28, type.labelSize)}<title>{point.item.label}</title>
          </text>
        </g>)}
      </Plot>;
  }
  return <Frame props={props} theme={theme} kind={kind} series={props.series} table={table} empty={!complete.some((item) => !bubble || (item as BubbleDatum).size! > 0)}>
    <ResponsivePlots props={props} render={renderPlot} />
  </Frame>;
}

export function ScatterChart(props: ScatterChartProps) { return <XYPlot props={props} kind="scatter" />; }
export function BubbleChart(props: BubbleChartProps) { return <XYPlot props={props} kind="bubble" />; }

/** Bind the saved configuration once in a design system's chart module.
 * No mutable global state: two brands on the same page remain isolated. */
export function createBrandedCharts(brand: ChartBrand) {
  return {
    BarChart: (props: Omit<BarChartProps, 'brand'>) => <BarChart {...props} brand={brand} />,
    PieChart: (props: Omit<PieChartProps, 'brand'>) => <PieChart {...props} brand={brand} />,
    LineChart: (props: Omit<LineChartProps, 'brand'>) => <LineChart {...props} brand={brand} />,
    ScatterChart: (props: Omit<ScatterChartProps, 'brand'>) => <ScatterChart {...props} brand={brand} />,
    BubbleChart: (props: Omit<BubbleChartProps, 'brand'>) => <BubbleChart {...props} brand={brand} />,
  };
}

export const BarChartShowcase = [
  { label: 'Grouped comparison', props: { title: 'Revenue by quarter', series: [{ id: 'north', label: 'North' }, { id: 'south', label: 'South' }], data: [
    { id: 'q1', label: 'Q1', values: { north: 24, south: 18 } }, { id: 'q2', label: 'Q2', values: { north: 32, south: 25 } },
  ] } },
  { label: 'Stacked comparison', props: { title: 'Revenue mix', layout: 'stacked', animation: 'enter', series: [{ id: 'north', label: 'North' }, { id: 'south', label: 'South' }], data: [
    { id: 'q1', label: 'Q1', values: { north: 24, south: 18 } }, { id: 'q2', label: 'Q2', values: { north: 32, south: 25 } },
  ] } },
  { label: 'Horizontal change', props: { title: 'Change by region', orientation: 'horizontal', values: true, series: [{ id: 'change', label: 'Change' }], data: [
    { id: 'north', label: 'North', values: { change: -12 } }, { id: 'south', label: 'South', values: { change: 18 } },
  ] } },
];
export const PieChartShowcase = [
  { label: 'Share', props: { title: 'Response distribution', data: [{ id: 'agree', label: 'Agree', value: 78 }, { id: 'neutral', label: 'Neutral', value: 14 }, { id: 'disagree', label: 'Disagree', value: 8 }] } },
  { label: 'Donut', props: { title: 'Completion', variant: 'donut', animation: 'enter', centerValue: '78%', centerLabel: 'Complete', data: [{ id: 'complete', label: 'Complete', value: 78 }, { id: 'remaining', label: 'Remaining', value: 22 }] } },
];
export const LineChartShowcase = [
  { label: 'Trend', props: { title: 'Revenue trend', animation: 'enter', series: [{ id: 'revenue', label: 'Revenue' }], data: [
    { id: 'q1', label: 'Q1', values: { revenue: 18 } }, { id: 'q2', label: 'Q2', values: { revenue: 28 } }, { id: 'q3', label: 'Q3', values: { revenue: 24 } },
  ] } },
  { label: 'Missing observation', props: { title: 'Observation gaps', series: [{ id: 'value', label: 'Value' }], data: [
    { id: 'q1', label: 'Q1', values: { value: 18 } }, { id: 'q2', label: 'Q2', values: { value: null } }, { id: 'q3', label: 'Q3', values: { value: 24 } },
  ] } },
];

export const ScatterChartShowcase = [
  { label: 'Numeric relationship', props: { title: 'Investment and return', xAxis: { label: 'Investment' }, yAxis: { label: 'Return' },
    trendLine: 'linear', animation: 'enter', series: [{ id: 'projects', label: 'Projects' }], data: [
      { id: 'a', label: 'Project A', seriesId: 'projects', x: 10, y: 14 },
      { id: 'b', label: 'Project B', seriesId: 'projects', x: 30, y: 32 },
      { id: 'c', label: 'Project C', seriesId: 'projects', x: 90, y: 68 },
    ] } },
  { label: 'Direct observation labels', props: { title: 'Regional change', labels: 'outside', series: [{ id: 'regions', label: 'Regions' }], data: [
    { id: 'a', label: 'Northern region', seriesId: 'regions', x: -5, y: 12 },
    { id: 'b', label: 'Southern region', seriesId: 'regions', x: 8, y: -3 },
  ] } },
];
export const BubbleChartShowcase = [
  { label: 'Area-scaled observations', props: { title: 'Markets', xAxis: { label: 'Growth', suffix: '%' }, yAxis: { label: 'Margin', suffix: '%' },
    sizeLabel: 'Revenue', animation: 'enter', series: [{ id: 'markets', label: 'Markets' }], data: [
      { id: 'a', label: 'Market A', seriesId: 'markets', x: 10, y: 20, size: 25 },
      { id: 'b', label: 'Market B', seriesId: 'markets', x: 30, y: 40, size: 100 },
    ] } },
  { label: 'Concentric rings', props: { title: 'Markets', treatment: 'rings', labels: 'outside', series: [{ id: 'markets', label: 'Markets' }], data: [
    { id: 'a', label: 'Market A', seriesId: 'markets', x: 10, y: 20, size: 25 },
    { id: 'b', label: 'Market B', seriesId: 'markets', x: 30, y: 40, size: 100 },
  ] } },
];

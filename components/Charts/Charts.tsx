// Copy-in chart mechanics. No hooks, runtime dependencies or client boundary:
// complete SVG geometry and the data table render on the server. The native
// scroll region is keyboard accessible; no keys are rebound. SVG has an image
// role and a name; its redundant marks are accompanied by a semantic table.
// All brand decisions live in ChartBrand, never in the data or CSS selectors.
import type { CSSProperties, ReactNode } from 'react';

export type ChartRole = 'positive' | 'neutral' | 'negative' | 'other';
export type ChartKind = 'bar' | 'pie' | 'donut' | 'line';

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
  bar?: { radius?: number; gap?: number; groupGap?: number; separatorWidth?: number; totals?: boolean };
  line?: { width?: number; pointRadius?: number; dashPatterns?: string[] };
  pie?: { innerRadius?: number; startAngle?: number; separatorWidth?: number; labels?: 'inside' | 'outside' | 'none'; insideLabel?: 'percent' | 'value' | 'label-percent' };
  defaults?: { grid?: boolean; legend?: boolean; values?: boolean; lineLabels?: 'end' | 'none' };
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

/** Shared content and brand inputs for all three chart components. */
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
  /** Keep a screen-reader table, or display it below the chart. */
  dataTable?: 'hidden' | 'visible';
  /** SVG coordinate height. Default 320; charts scroll internally at narrow widths. */
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
    ...props.numberFormat,
    maximumFractionDigits: props.numberFormat?.maximumFractionDigits
      ?? Math.max(2, props.numberFormat?.minimumFractionDigits ?? 0),
  });
  return (value: number) => `${formatter.format(Object.is(value, -0) ? 0 : value)}${props.suffix ?? ''}`;
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
  [data-kk-chart] { min-width: 0; max-width: 100%; margin: 0; }
  [data-kk-chart] [data-chart-scroll] { max-width: 100%; overflow-x: auto; }
  [data-kk-chart] svg { display: block; width: 100%; height: auto; }
  [data-kk-chart] [data-chart-legend] { display: flex; flex-wrap: wrap; gap: .5em 1.5em; padding: 0; list-style: none; }
  [data-kk-chart] [data-chart-legend] li { display: flex; gap: .5em; align-items: baseline; min-width: 0; overflow-wrap: anywhere; }
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
        : <>
          <div data-chart-scroll="" role="region" aria-label={`${props.title} plot`} tabIndex={0}>{children}</div>
          {(props.legend ?? theme.defaults.legend) && <ul data-chart-legend="" aria-label="Legend">
            {series.map((item, index) => <li key={item.id}>
              <span data-chart-key="" aria-hidden="true" style={{ background: inkFor(item, index, props, theme).color }} />
              <span>{item.label}</span>
            </li>)}
          </ul>}
        </>}
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

function Plot({ title, width, height, theme, children }: { title: string; width: number; height: number; theme: Theme; children: ReactNode }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}
    style={{ minWidth: width, fontFamily: theme.typography.labelFamily, fontSize: theme.typography.labelSize,
      fontWeight: theme.typography.labelWeight, color: theme.surface.text }}>
    <title>{title}</title>{children}
  </svg>;
}

export function BarChart(props: BarChartProps) {
  validateRows(props.data, props.series);
  const theme = themeFor(props, 'bar');
  const { surface, typography: type } = theme;
  const horizontal = props.orientation === 'horizontal';
  const stacked = props.layout === 'stacked';
  const format = formatFor(props);
  const all = props.data.flatMap((row) => props.series.map((s) => row.values[s.id]).filter((v): v is number => v != null));
  const domain = stacked ? props.data.flatMap((row) => {
    const values = props.series.map((s) => row.values[s.id] ?? 0);
    const positive = values.reduce((sum, value) => sum + Math.max(0, value), 0);
    const negative = values.reduce((sum, value) => sum + Math.min(0, value), 0);
    if (!Number.isFinite(positive) || !Number.isFinite(negative)) throw new Error('Stacked total exceeds the numeric range. Rescale the input units.');
    return [positive, negative];
  }) : all;
  const scale = scaleFor(domain);
  const height = horizontal ? Math.max(bounded(props.height, 320, 200, 1200), props.data.length * 48 + 60)
    : bounded(props.height, 320, 200, 1200);
  const width = horizontal ? 640 : Math.max(640, props.data.length * Math.max(58, (stacked ? 1 : props.series.length) * 22));
  const left = horizontal ? 160 : 82, top = 26, bottom = height - 48, right = width - 64;
  const plotWidth = right - left, plotHeight = bottom - top;
  const valueAt = (v: number) => horizontal ? left + scale.at(v) * plotWidth : bottom - scale.at(v) * plotHeight;
  const band = (horizontal ? plotHeight : plotWidth) / Math.max(1, props.data.length);
  const groupWidth = band * (1 - bounded(theme.bar.groupGap, BAR.groupGap, 0, 0.8));
  const count = stacked ? 1 : Math.max(1, props.series.length);
  const gap = bounded(theme.bar.gap, BAR.gap, 0, groupWidth / count / 2);
  const thickness = Math.max(0.5, (groupWidth - gap * (count - 1)) / count);
  const values = props.values ?? theme.defaults.values;
  return <Frame props={props} theme={theme} kind="bar" horizontal={horizontal} series={props.series}
    empty={!all.length} table={<RowTable props={props} />}>
    <Plot title={props.title} width={width} height={height} theme={theme}>
      {scale.ticks.map((tick, i) => <g key={i}>
        {theme.defaults.grid && <line x1={horizontal ? valueAt(tick) : left} y1={horizontal ? top : valueAt(tick)}
          x2={horizontal ? valueAt(tick) : right} y2={horizontal ? bottom : valueAt(tick)} stroke={surface.grid} />}
        <text x={horizontal ? valueAt(tick) : left - 10} y={horizontal ? bottom + 22 : valueAt(tick) + 4}
          fill={surface.mutedText} textAnchor={horizontal ? 'middle' : 'end'}>{short(format(tick), horizontal ? 12 : 10)}<title>{format(tick)}</title></text>
      </g>)}
      <line data-baseline="" x1={horizontal ? valueAt(0) : left} y1={horizontal ? top : valueAt(0)}
        x2={horizontal ? valueAt(0) : right} y2={horizontal ? bottom : valueAt(0)} stroke={surface.axis} />
      {props.data.map((row, rowIndex) => {
        let positive = 0, negative = 0;
        const groupStart = (horizontal ? top : left) + rowIndex * band + (band - groupWidth) / 2;
        return <g key={row.id}>
          <text x={horizontal ? left - 12 : left + (rowIndex + 0.5) * band}
            y={horizontal ? top + (rowIndex + 0.5) * band + 4 : bottom + 24}
            textAnchor={horizontal ? 'end' : 'middle'} fill={surface.text}>
            {short(row.label, horizontal ? 20 : Math.max(5, Math.floor(band / (type.labelSize * 0.6))))}<title>{row.label}</title>
          </text>
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
              {values && (!stacked || length > type.valueSize * (horizontal ? 4 : 1.5)) && <text
                x={horizontal ? (stacked ? along + length / 2 : valueAt(end) + (value < 0 ? -6 : 6)) : cross + thickness / 2}
                y={horizontal ? cross + thickness / 2 + type.valueSize / 3 : (stacked ? along + length / 2 + type.valueSize / 3 : valueAt(end) + (value < 0 ? type.valueSize + 4 : -6))}
                textAnchor={horizontal && !stacked ? (value < 0 ? 'end' : 'start') : 'middle'}
                fill={stacked ? ink.labelColor : surface.text} fontFamily={type.valueFamily} fontSize={type.valueSize} fontWeight={type.valueWeight}>{format(value)}</text>}
            </g>;
          })}
          {stacked && (props.totals ?? theme.bar.totals) && [positive, negative].filter((total) => total !== 0).map((total) =>
            <text key={total > 0 ? 'positive' : 'negative'} data-stack-total=""
              x={horizontal ? valueAt(total) + (total < 0 ? -6 : 6) : groupStart + groupWidth / 2}
              y={horizontal ? groupStart + groupWidth / 2 + type.valueSize / 3 : valueAt(total) + (total < 0 ? type.valueSize + 4 : -6)}
              textAnchor={horizontal ? (total < 0 ? 'end' : 'start') : 'middle'} fill={surface.text}
              fontFamily={type.valueFamily} fontSize={type.valueSize} fontWeight={type.valueWeight}>{format(total)}</text>)}
        </g>;
      })}
    </Plot>
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
  const all = props.data.flatMap((row) => props.series.map((s) => row.values[s.id]).filter((v): v is number => v != null));
  const scale = scaleFor(all, props.includeZero ?? true);
  const height = Math.max(bounded(props.height, 320, 200, 1200), props.series.length * (type.labelSize + 6) + 70);
  const width = Math.max(640, props.data.length * 42);
  const showLabels = (props.labels ?? theme.defaults.lineLabels) === 'end';
  const left = 82, right = width - (showLabels ? 156 : 32), top = 24, bottom = height - 44;
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
  return <Frame props={props} theme={theme} kind="line" series={props.series} empty={!all.length} table={<RowTable props={props} />}>
    <Plot title={props.title} width={width} height={height} theme={theme}>
      {scale.ticks.map((tick, i) => <g key={i}>
        {theme.defaults.grid && <line x1={left} y1={y(tick)} x2={right} y2={y(tick)} stroke={surface.grid} />}
        <text x={left - 10} y={y(tick) + 4} textAnchor="end" fill={surface.mutedText}>{short(format(tick), 10)}<title>{format(tick)}</title></text>
      </g>)}
      <line x1={left} y1={bottom} x2={right} y2={bottom} stroke={surface.axis} />
      {props.data.map((row, index) => <text key={row.id} x={x(index)} y={bottom + 24} textAnchor="middle" fill={surface.mutedText}>
        {short(row.label, Math.max(4, Math.floor((right - left) / Math.max(props.data.length, 1) / (type.labelSize * 0.6))))}<title>{row.label}</title>
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
      {showLabels && labels.map((line) => <g key={line.series.id}>
        <path d={`M${line.end!.x},${line.end!.y} L${right + 12},${line.labelY} L${right + 18},${line.labelY}`} fill="none" stroke={line.ink.color} />
        <text data-end-label="" x={right + 24} y={line.labelY + 4} fill={surface.text}>{short(line.series.label, 18)}<title>{line.series.label}</title></text>
      </g>)}
    </Plot>
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
  const labelInset = Math.max(24, type.labelSize * 1.5);
  const height = Math.max(bounded(props.height, 320, 200, 1200), props.data.length * (type.labelSize + 8) + labelInset * 2);
  const radius = Math.min(height / 2 - 24, labels === 'outside' ? 145 : 240);
  const outsideText = (item: PieDatum) => `${short(item.label, 13)} ${percentage.format(total ? (item.value / max) / total : 0)}`;
  // Font files are owned by the host, so server rendering cannot measure glyphs.
  // Reserve a generous em per character (including the localized percentage)
  // and grow the scrollable plot with the brand's type size. A fixed 640px plot
  // clipped even ordinary region names at 24px. Full labels stay in the table.
  const labelWidth = props.data.reduce((width, item) => Math.max(width, Array.from(outsideText(item)).length * type.labelSize * 1.1), 0);
  const width = labels === 'outside' ? Math.max(640, 2 * (radius + 28 + labelWidth + 16)) : 640;
  const cx = width / 2, cy = height / 2;
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
  const table = <table data-chart-table=""><caption>{props.title} — data</caption>
    <thead><tr><th scope="col">Category</th><th scope="col">Value</th><th scope="col">Share</th></tr></thead>
    <tbody>{props.data.map((item) => <tr key={item.id}><th scope="row">{item.label}</th><td>{format(item.value)}</td>
      <td>{total ? percentage.format((item.value / max) / total) : '—'}</td></tr>)}</tbody></table>;
  return <Frame props={props} theme={theme} kind={kind} series={props.data} empty={!total} table={table}>
    <Plot title={props.title} width={width} height={height} theme={theme}>
      {slices.map((slice) => {
        const point = polar(cx, cy, (radius + inner) / 2, slice.mid);
        return <g key={slice.item.id}>
          <path data-slice="" data-category={slice.item.id} data-share={slice.share}
            d={slicePath(cx, cy, radius, inner, slice.start, slice.end)} fill={slice.ink.color}
            stroke={surface.background} strokeWidth={bounded(theme.pie.separatorWidth, 0, 0, 12)}>
            <title>{`${slice.item.label}: ${format(slice.item.value)} (${percentage.format(slice.share)})`}</title>
          </path>
          {labels === 'inside' && slice.share >= 0.05 && <text x={point.x} y={point.y + type.valueSize / 3} textAnchor="middle"
            fill={slice.ink.labelColor} fontFamily={type.valueFamily} fontSize={type.valueSize} fontWeight={type.valueWeight}>
            {theme.pie.insideLabel === 'value' ? format(slice.item.value) : percentage.format(slice.share)}
            {theme.pie.insideLabel === 'label-percent' && slice.share >= 0.15 && <tspan x={point.x} dy={type.labelSize + 4}
              fontFamily={type.labelFamily} fontSize={type.labelSize} fontWeight={type.labelWeight}>{short(slice.item.label, 14)}</tspan>}
          </text>}
        </g>;
      })}
      {labels === 'outside' && outside.map((slice) => {
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
          fontFamily={type.displayFamily} fontSize={Math.min(type.displaySize, inner * 1.7 / (props.centerValue.length * 0.6))}
          fontWeight={type.displayWeight}>{props.centerValue}</text>}
        {props.centerLabel && <text x={cx} y={cy + (props.centerValue ? type.labelSize + 6 : 4)} fontSize={type.labelSize} fill={surface.mutedText}>
          {short(props.centerLabel, Math.max(5, Math.floor(inner * 1.7 / (type.labelSize * 0.6))))}<title>{props.centerLabel}</title>
        </text>}
      </g>}
    </Plot>
  </Frame>;
}

/** Bind the saved configuration once in a design system's chart module.
 * No mutable global state: two brands on the same page remain isolated. */
export function createBrandedCharts(brand: ChartBrand) {
  return {
    BarChart: (props: Omit<BarChartProps, 'brand'>) => <BarChart {...props} brand={brand} />,
    PieChart: (props: Omit<PieChartProps, 'brand'>) => <PieChart {...props} brand={brand} />,
    LineChart: (props: Omit<LineChartProps, 'brand'>) => <LineChart {...props} brand={brand} />,
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

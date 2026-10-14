import { cloneElement, isValidElement, type ReactNode } from 'react';
import { init, measureStaticText, renderStaticSVG } from './Chart.vendor/renderer.js';
import { chartTheme, composeCircular } from './chart-composition';
import type { CircularContext, CircularSlice } from './chart-primitives';
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
 * change chart-composition.tsx for brand values and the pie/donut composition, and frame for a structural brand device.
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
// CartesianPlot displays those dimensions exactly so axis text keeps its theme size.
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

// Use the renderer's metrics for wrapping as well as fitting. Character counts
// can undercount lines when a label contains wider glyphs; that once let pie
// labels overlap despite reserving space for every authored newline.
// HTML keys/source data retain the complete names beyond these three lines.
function wrapMeasuredLabel(text: string, width: number, font: string) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.trim().split(/\s+/)) {
    if (line && measureStaticText(line + word, font).width > width) { lines.push(line.trim()); line = ''; }
    for (const character of word) {
      if (line && measureStaticText(line + character, font).width > width) { lines.push(line.trim()); line = ''; }
      line += character;
    }
    line += ' ';
  }
  if (line.trim()) lines.push(line.trim());
  const visible = lines.slice(0, 3);
  if (lines.length > 3) {
    let last = Array.from(visible[2]);
    while (last.length && measureStaticText(last.join('') + '…', font).width > width) last.pop();
    visible[2] = last.join('').trimEnd() + '…';
  }
  return visible.join('\n');
}

function CartesianPlot({ option, names, categorical, axisValues, theme, title }: {
  option: Option; names: string[]; categorical: boolean; axisValues: number[]; theme: ChartTheme; title: string;
}) {
  const font = `${theme.typography.labelSize}px ${theme.typography.fontFamily}`;
  // A short year/category needs less room than a name. Reserve up to 120px per
  // category, then wrap long names to three lines; source data retains full text.
  const widest = categorical ? Math.ceil(names.reduce((max, name) => Math.max(max, measureStaticText(name, font).width), 0) + 16) : 0;
  const axisFormat = numberFormat('en-US');
  // Include the numeric axis in the width budget, including stacked totals.
  // Extra ems cover tick rounding and gaps; they are spacing, not font metrics.
  const axisWidth = axisValues.reduce((max, value) => Number.isFinite(value) ? Math.max(max, measureStaticText(axisFormat.full(value), font).width) : max, 0);
  const axisBudget = Math.max(112, Math.ceil(axisWidth + theme.typography.labelSize * 2 + 24));
  // Room per category at a given width: a label gets its measured width when
  // there is space, and wraps (up to three lines) when the plot is narrow —
  // a chart beside prose in a third of a page is the common case, and a
  // scroll there hides the point of the chart. 48px is the floor past which
  // even wrapped labels stop reading; below it the plot scrolls as before.
  // The floor is the longest single word plus its gutter: a label wraps at
  // spaces, never inside a word or a number ("2025" stays whole).
  const longestWord = categorical ? Math.ceil(names.reduce((max, name) => Math.max(max, ...name.split(/\s+/).map((word) => measureStaticText(word, font).width)), 0)) : 0;
  const floor = Math.max(48, longestWord + 16);
  const pitchAt = (width: number) => categorical ? Math.max(floor, Math.min(120, widest, Math.floor((width - axisBudget) / Math.max(1, names.length)))) : 0;
  const uncappedWidth = names.length * floor + axisBudget;
  const minimumWidth = categorical ? Math.min(2400, Math.ceil(uncappedWidth)) : 0;
  const layout = (baseWidth: number) => {
    const width = Math.max(baseWidth, minimumWidth);
    const pitch = pitchAt(width);
    const xAxis = option.xAxis as Option;
    const label = xAxis.axisLabel as Option;
    const labelWidth = pitch - 16;
    const plotOption = { ...option, xAxis: { ...xAxis, axisLabel: { ...label,
      ...(categorical ? {
        width: labelWidth, overflow: 'break', lineHeight: Math.ceil(theme.typography.labelSize * 1.4),
        interval: names.length * pitch + axisBudget <= 2400 ? 0 : 'auto', hideOverlap: names.length * pitch + axisBudget > 2400,
        formatter: (value: string) => wrapMeasuredLabel(String(value), labelWidth, font),
      } : {}),
    } } };
    return <>
      <style>{`@container kopla-cartesian (max-width:${width - 0.01}px){.kopla-cartesian-scroll-${width}{display:block!important}}`}</style>
      <p className={`kopla-cartesian-scroll-${width} mb-2`} style={{ display: 'none', fontSize: theme.typography.noteSize }}>Scroll to see the full chart.</p>
      <div tabIndex={0} role="region" aria-label={`${title} chart; scroll horizontally if needed. Full labels and values are in View source data.`}
        className="max-w-full overflow-x-auto" style={{ minWidth: 0 }}>
        <div style={{ width, minWidth: width, marginInline: 'auto' }}><Plot option={plotOption} width={width} height={320} /></div>
      </div>
    </>;
  };
  // Container queries use the available plot width, including any brand frame's
  // constraints. Intrinsic widths keep text at its exact theme size at every
  // breakpoint instead of growing between breakpoints then suddenly shrinking;
  // a dense plot scrolls locally instead of squeezing labels or the whole page.
  // The 2400px cap prevents an unbounded canvas; auto interval/hideOverlap still
  // applies beyond that density and every observation remains in the table.
  const widths = Array.from(new Set([320, 480, 640, 800].map((width) => Math.max(width, minimumWidth))));
  return <div style={{ containerType: 'inline-size', containerName: 'kopla-cartesian', maxWidth: Math.max(800, minimumWidth), minWidth: 0, marginInline: 'auto' }}>
    <style>{widths.slice(1).map((width, i) => `@container kopla-cartesian (min-width:${width}px){.kopla-cartesian-layout-${widths[i]}{display:none!important}.kopla-cartesian-layout-${width}{display:block!important}}`).join('')}</style>
    {widths.map((width, i) => <div key={width} className={`kopla-cartesian-layout-${width}`} style={{ display: i ? 'none' : undefined }}>{layout(width)}</div>)}
  </div>;
}

/**
 * A pie or donut: the geometry is computed here, the drawing is the brand's
 * composition (chart-composition.tsx → composeCircular, over the parts in
 * chart-primitives.tsx). Two layouts are composed — compact and wide — and a
 * container query shows one, so a phone gets its own layout rather than a
 * shrunken desktop one. Both are SSR; no hydration.
 */
function CircularPlot({ slices, donut, locale, theme, centerValue, centerLabel }: {
  slices: Slice[]; donut: boolean; locale: string; theme: ChartTheme;
  centerValue?: string; centerLabel?: string;
}) {
  // Normalization avoids an infinite denominator when several finite values are
  // near Number.MAX_VALUE. The source values remain unchanged in the HTML key.
  const maximum = slices.reduce((max, slice) => Math.max(max, slice.value), 0);
  const weights = slices.map((slice) => slice.value > 0 ? Math.max(Number.MIN_VALUE, slice.value / maximum) : 0);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const shares = weights.map((weight) => weight > 0 ? Math.max(Number.MIN_VALUE, weight / total) : 0);
  const positiveCount = weights.filter((weight) => weight > 0).length;
  const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 });
  const shareLabel = (share: number) => share > 0 && share < 0.001 ? `<${percent.format(0.001)}`
    : share > 0.999 && (share < 1 || positiveCount > 1) ? `>${percent.format(0.999)}` : percent.format(share);
  const format = numberFormat(locale);
  const hasValues = maximum > 0;
  if (!hasValues) return <p className="py-16 text-center">No positive values</p>;

  function context(compact: boolean): CircularContext {
    const width = compact ? 320 : 520;
    const outer = compact ? 64 : 120;
    let angle = 0;
    const geometry: CircularSlice[] = slices.map((slice, index) => {
      const share = shares[index] ?? 0;
      const start = angle;
      angle += share * Math.PI * 2;
      return { index, name: slice.name, value: slice.value, share, color: slice.color, start, end: angle, mid: (start + angle) / 2, shareLabel: shareLabel(share), valueLabel: format.full(slice.value) };
    });
    return {
      slices: geometry, donut, compact, width, outer, cx: width / 2, cy: (compact ? 300 : 340) / 2,
      type: { fontFamily: theme.typography.fontFamily, labelSize: theme.typography.labelSize, titleSize: theme.typography.titleSize, titleWeight: theme.typography.titleWeight },
      textColor: theme.textColor,
      ...(donut && centerValue ? { center: { value: centerValue, ...(centerLabel ? { label: centerLabel } : {}) } } : {}),
    };
  }
  const compact = composeCircular(context(true));
  const wide = composeCircular(context(false));
  return <>
    <div className="kopla-chart-circular-layout" style={{ containerType: 'inline-size', containerName: 'chart-circular' }}>
      {/* Container queries choose actual layouts, not shrunken desktop text.
          Both SVGs are SSR content; no measurement hook or hydration is needed. */}
      <style>{`.kopla-chart-circular-wide{display:none}@container chart-circular (min-width:480px){.kopla-chart-circular-compact{display:none}.kopla-chart-circular-wide{display:block}}`}</style>
      <div className="kopla-chart-circular-compact" style={{ maxWidth: 320, marginInline: 'auto' }}>{compact.canvas}{compact.below}</div>
      <div className="kopla-chart-circular-wide" style={{ maxWidth: 520, marginInline: 'auto' }}>{wide.canvas}{wide.below}</div>
    </div>
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
  // A fixed 8px gap lets large x/y labels touch at the origin. One em separates
  // their line boxes, including a loaded font's ascenders/descenders.
  const axis = { axisLine: { show: true, lineStyle: { color: theme.textColor, width: theme.line.width } }, axisTick: { show: false }, axisLabel: { color: theme.textColor, fontSize: theme.typography.labelSize, fontFamily: theme.typography.fontFamily, margin: Math.max(8, theme.typography.labelSize), hideOverlap: true }, splitLine: { show: false } };
  const maxSize = Math.max(1, ...valid.flatMap((s) => s.points.map((p) => Number.isFinite(p.size) ? Math.max(0, p.size ?? 1) : 1)));
  const axisValues = valid.flatMap((s) => s.points.flatMap((p) => p.y === null ? [] : [p.y]));
  if (variant === 'stacked-bar') for (const name of names) {
    const values = valid.map((s) => s.points.find((p) => String(p.x) === name)?.y ?? 0);
    axisValues.push(values.reduce((sum, value) => sum + Math.max(0, value), 0), values.reduce((sum, value) => sum + Math.min(0, value), 0));
  }
  const option: Option = {
    ...base,
    // Font metrics are deliberately approximate and identical in SSR/browser.
    // Inset automatic bounds as well: touching the SVG edge leaves no tolerance
    // for a loaded brand font's glyphs being wider than the fallback metrics.
    grid: { left: 48, right: variant === 'bubble' ? 32 : 16, top: variant === 'bubble' ? 32 : 16, bottom: 40, outerBounds: { left: 8, right: 8, top: 8, bottom: 8 } },
    xAxis: { ...axis, type: positional && numericX ? 'value' : 'category', data: positional && numericX ? undefined : names },
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
        <CircularPlot slices={panel.slices} donut={variant === 'donut'} locale={locale} theme={theme}
          centerValue={panels.length === 1 ? centerValue : undefined} centerLabel={panels.length === 1 ? centerLabel : undefined} />
      </div>)}
    </div>
  ) : <>
    {yLabel && <p className="mb-2" style={{ fontSize: theme.typography.labelSize }}>{yLabel}</p>}
    <CartesianPlot option={option} names={names} categorical={!(positional && numericX)} axisValues={axisValues} theme={theme} title={title} />
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

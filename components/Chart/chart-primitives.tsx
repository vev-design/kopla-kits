// The MECHANICAL half of a circular chart: geometry, label layout, leaders,
// the key, the responsive canvas. Nothing in here is a brand decision — what
// a brand decides (where labels sit, whether leaders exist, whether a key
// repeats the labels, how thick a ring is, what weight a value carries) is
// written in chart-composition.tsx by composing these parts. See COMPOSING.md.
//
// Server-rendered SVG, deterministic, no hooks, no DOM. Every text a reader
// needs stays available: a composition may hide a label, never the source
// table (Chart.tsx renders that beside whatever the composition draws).
import type { ReactNode } from 'react';
import { measureStaticText } from './Chart.vendor/renderer.js';

export interface CircularTypography { fontFamily: string; labelSize: number; titleSize: number; titleWeight: number }

export interface CircularSlice {
  index: number;
  name: string;
  /** The source value, untouched. */
  value: number;
  /** 0–1 share of the positive total; 0 for a zero or missing observation. */
  share: number;
  color: string;
  /** Radians from 12 o'clock, clockwise. */
  start: number;
  end: number;
  mid: number;
  /** Formatted for display: "62.4%" and "960,000". */
  shareLabel: string;
  valueLabel: string;
}

export interface CircularContext {
  slices: CircularSlice[];
  /** The props asked for a donut. A composition may draw a ring regardless. */
  donut: boolean;
  compact: boolean;
  width: number;
  /** Outer radius chosen for the width; compositions read it, never set it. */
  outer: number;
  cx: number;
  cy: number;
  type: CircularTypography;
  textColor: string;
  /** Authored focal figure for a donut centre, when the author supplied one. */
  center?: { value: string; label?: string };
}

export interface Part { node: ReactNode; /** Vertical room the part needs; the canvas grows to the tallest. */ height?: number }

const TAU = Math.PI * 2;
const point = (c: CircularContext, radius: number, angle: number) => ({ x: c.cx + radius * Math.sin(angle), y: c.cy - radius * Math.cos(angle) });
// Four decimals, not two: a sector of 99.99% has endpoints 0.05px apart at a
// 120px radius, and rounding them together makes the arc vanish entirely.
const round = (n: number) => Math.round(n * 10000) / 10000;
/** Past this a sector is drawn as a full circle: the arc command cannot
 *  express a sweep whose endpoints coincide. The sliver beside it still draws. */
const FULL = 1e-4;

function arcPath(c: CircularContext, outer: number, inner: number, start: number, end: number): string {
  const sweep = end - start;
  if (sweep >= TAU - FULL) {
    // A full circle has no arc endpoints to anchor; draw two half arcs.
    const o1 = point(c, outer, 0), o2 = point(c, outer, Math.PI);
    const ring = inner > 0 ? ` M${round(point(c, inner, 0).x)} ${round(point(c, inner, 0).y)} A${inner} ${inner} 0 1 0 ${round(point(c, inner, Math.PI).x)} ${round(point(c, inner, Math.PI).y)} A${inner} ${inner} 0 1 0 ${round(point(c, inner, 0).x)} ${round(point(c, inner, 0).y)}` : '';
    return `M${round(o1.x)} ${round(o1.y)} A${outer} ${outer} 0 1 1 ${round(o2.x)} ${round(o2.y)} A${outer} ${outer} 0 1 1 ${round(o1.x)} ${round(o1.y)}${ring}`;
  }
  const large = sweep > Math.PI ? 1 : 0;
  const a = point(c, outer, start), b = point(c, outer, end);
  if (inner <= 0) return `M${round(c.cx)} ${round(c.cy)} L${round(a.x)} ${round(a.y)} A${outer} ${outer} 0 ${large} 1 ${round(b.x)} ${round(b.y)} Z`;
  const d = point(c, inner, end), e = point(c, inner, start);
  return `M${round(a.x)} ${round(a.y)} A${outer} ${outer} 0 ${large} 1 ${round(b.x)} ${round(b.y)} L${round(d.x)} ${round(d.y)} A${inner} ${inner} 0 ${large} 0 ${round(e.x)} ${round(e.y)} Z`;
}

/** The sectors. `ring` is the hole as a fraction of the outer radius (0 = pie);
 *  `gap` strokes each sector in the background colour to separate them. */
export function slices(c: CircularContext, opts: { ring?: number; gap?: { color: string; width: number } } = {}): Part {
  const ring = Math.min(0.85, Math.max(0, opts.ring ?? (c.donut ? 0.62 : 0)));
  const inner = c.outer * ring;
  return { node: <g data-chart-slices="">{c.slices.filter((s) => s.share > 0).map((s) => (
    <path key={s.index} d={arcPath(c, c.outer, inner, s.start, s.end)} fill={s.color}
      {...(opts.gap ? { stroke: opts.gap.color, strokeWidth: opts.gap.width, strokeLinejoin: 'round' as const } : {})} />
  ))}</g> };
}

/** Where the hole begins for a given ring, so labels and the centre agree with the slices. */
export const innerRadius = (c: CircularContext, ring?: number) => c.outer * Math.min(0.85, Math.max(0, ring ?? (c.donut ? 0.62 : 0)));

export interface LabelStyle { size?: number; weight?: number; color?: string }

/** A label inside each sector, at the sector's middle. Sectors narrower than
 *  `minShare` get none (their index is returned, so a composition can label
 *  them outside instead). `ring` must match the one given to `slices`. */
export function insideLabels(c: CircularContext, opts: { text: (s: CircularSlice) => string; ring?: number; minShare?: number } & LabelStyle): Part & { skipped: number[] } {
  const minShare = opts.minShare ?? 0.06;
  const inner = innerRadius(c, opts.ring);
  const radius = inner > 0 ? (inner + c.outer) / 2 : c.outer * 0.62;
  const size = opts.size ?? Math.max(c.type.labelSize, c.compact ? 12 : 14);
  const skipped: number[] = [];
  const nodes = c.slices.filter((s) => s.share > 0).flatMap((s) => {
    const text = opts.text(s);
    const { x, y } = point(c, radius, s.mid);
    // A label wider than the sector's chord at that radius would spill onto neighbours.
    const chord = 2 * radius * Math.sin(Math.min(Math.PI, s.end - s.start) / 2);
    if (s.share < minShare || measureStaticText(text, `${size}px ${c.type.fontFamily}`).width > chord + 4) { skipped.push(s.index); return []; }
    return [<text key={s.index} x={round(x)} y={round(y)} textAnchor="middle" dominantBaseline="central" fontSize={size} fontWeight={opts.weight ?? 600} fontFamily={c.type.fontFamily} fill={opts.color ?? c.textColor}>{text}</text>];
  });
  return { node: <g data-chart-inside-labels="">{nodes}</g>, skipped };
}

interface Placed { s: CircularSlice; lines: string[]; x: number; y: number; side: 1 | -1; anchor: { x: number; y: number }; textAnchor: 'start' | 'middle' | 'end'; width: number }

/** Where a leaderless label for a sector at `angle` sits: on the radial line
 *  10px past the rim, reading outward — centred near the vertical, else away
 *  from the circle — with the block slid along the line so it never crosses the rim. */
function beside(c: CircularContext, angle: number, block: number): { x: number; y: number; textAnchor: Placed['textAnchor'] } {
  const near = point(c, c.outer + 10, angle);
  const textAnchor = Math.abs(Math.sin(angle)) < 0.35 ? 'middle' : Math.sin(angle) >= 0 ? 'start' : 'end';
  return { x: near.x, y: near.y - (Math.cos(angle) * block) / 2, textAnchor };
}

/**
 * Collision handling for leaderless labels. A label belongs beside its sector,
 * so it moves only when it actually overlaps a placed block in both axes, and
 * then to the nearest free spot of two kinds: along the vertical away from the
 * circle (up in the top half while the canvas has room; down in the bottom
 * half, where the canvas grows), or along the rim toward the side, which keeps
 * it beside the circle when several small sectors crowd the top. A label is
 * never pushed down over the rim. Returns the bottom edge the canvas must reach.
 */
function settleBeside(c: CircularContext, placed: Placed[], lineHeight: number, pad: number): number {
  const box = (p: { x: number; y: number; textAnchor: Placed['textAnchor']; width: number; lines: string[] }) => {
    const block = p.lines.length * lineHeight;
    const left = p.textAnchor === 'start' ? p.x : p.textAnchor === 'end' ? p.x - p.width : p.x - p.width / 2;
    return { left, right: left + p.width, top: p.y - block / 2, bottom: p.y + block / 2 };
  };
  const settled: Placed[] = [];
  const clear = (candidate: ReturnType<typeof box>) => candidate.left >= pad && candidate.right <= c.width - pad && candidate.top >= 8
    && !settled.map(box).some((q) => candidate.right + 4 > q.left && candidate.left - 4 < q.right && candidate.top < q.bottom + 6 && candidate.bottom > q.top - 6);
  let bottom = 0;
  for (const p of [...placed].sort((a, b) => a.y - b.y)) {
    const block = p.lines.length * lineHeight;
    const home = { x: p.x, y: Math.max(p.y, 8 + block / 2) };
    const upper = Math.cos(p.s.mid) > 0;
    const side = Math.sin(p.s.mid) >= 0 ? 1 : -1;
    type Spot = { x: number; y: number; textAnchor: Placed['textAnchor'] };
    const spots: Spot[] = [home.y === p.y ? { ...home, textAnchor: p.textAnchor } : { x: p.x, y: home.y, textAnchor: p.textAnchor }];
    // Along the vertical, one block at a time, up to six blocks away.
    for (let k = 1; k <= 6; k++) spots.push({ x: p.x, y: home.y + (upper ? -1 : 1) * k * (block + 6), textAnchor: p.textAnchor });
    // Along the rim toward the side, in 3° steps, as far as the horizontal.
    for (let deg = 3; deg <= 90; deg += 3) {
      const angle = p.s.mid + side * (Math.PI / 180) * deg;
      if (Math.sign(Math.sin(angle)) !== side && Math.abs(Math.sin(angle)) > 0.01) break;
      spots.push(beside(c, angle, block));
    }
    const fits = spots.map((spot) => ({ spot, d: Math.hypot(spot.x - home.x, spot.y - home.y) })).sort((a, b) => a.d - b.d)
      .find(({ spot }) => clear(box({ ...spot, width: p.width, lines: p.lines })));
    // Nothing free near the sector: wholly beside the circle, below everything placed there.
    const spot = fits?.spot ?? { ...beside(c, side * (Math.PI / 2), block), y: Math.max(c.cy, ...settled.map((q) => box(q).bottom + 6 + block / 2)) };
    p.x = spot.x; p.y = spot.y; p.textAnchor = spot.textAnchor;
    settled.push(p);
    bottom = Math.max(bottom, box(p).bottom + 6);
  }
  return bottom;
}

/**
 * Labels beside the circle, one block per sector, stacked so they never
 * overlap. `leaders`: 'column' aligns every label to the canvas edge and draws
 * an elbow leader to it; 'short' sets the label just past the sector with a
 * short straight leader; 'none' sets it on the sector's own radial line just
 * outside the rim, with no line — above a sector at the top, beside one at the
 * side, below one at the bottom, as a guide draws a pie with labels and no leaders.
 * `lines` chooses the words — `[s.name]`, `[s.name, s.shareLabel]`, … The first
 * line may carry its own weight (`firstLine`).
 */
export function outsideLabels(c: CircularContext, opts: {
  lines: (s: CircularSlice) => string[];
  leaders?: 'column' | 'short' | 'none';
  only?: number[];
  firstLine?: LabelStyle;
  leaderColor?: string;
} & LabelStyle): Part {
  const leaders = opts.leaders ?? 'column';
  const size = opts.size ?? Math.max(c.type.labelSize, c.compact ? 12 : 14);
  const lineHeight = Math.ceil(size * 1.4);
  const font = `${size}px ${c.type.fontFamily}`;
  const pad = 6;
  const maxWidth = leaders === 'column' ? (c.compact ? 90 : 130) : Math.max(60, c.width / 2 - c.outer - 40);
  const chosen = c.slices.filter((s) => s.share > 0 && (!opts.only || opts.only.includes(s.index)));
  const placed: Placed[] = chosen.map((s) => {
    const side: 1 | -1 = Math.sin(s.mid) >= 0 ? 1 : -1;
    const anchor = point(c, c.outer + 2, s.mid);
    if (leaders === 'none') {
      // No line to bridge a gap, so the label sits where the sector points: on
      // its radial line, 10px past the rim. It reads outward — centred over a
      // sector near the vertical, else away from the circle — and wraps to the
      // room it has in that direction, so a word is not broken for a column
      // width that does not apply here.
      const { x: nearX, textAnchor } = beside(c, s.mid, 0);
      const room = textAnchor === 'middle' ? 2 * Math.min(nearX - pad, c.width - pad - nearX) : textAnchor === 'start' ? c.width - pad - nearX : nearX - pad;
      const lines = opts.lines(s).flatMap((line) => wrap(line, Math.max(40, Math.min(room, 160)), font));
      const width = Math.max(...lines.map((line) => measureStaticText(line, font).width), 0);
      return { s, lines, ...beside(c, s.mid, lines.length * lineHeight), side, anchor, width };
    }
    const lines = opts.lines(s).flatMap((line) => wrap(line, maxWidth, font));
    const width = Math.max(...lines.map((line) => measureStaticText(line, font).width), 0);
    const near = point(c, c.outer + 22, s.mid);
    // Short labels stay clear of the rim on their own side even for a sector
    // near the top or bottom, where the radial point sits over the circle.
    const clearance = c.cx + side * (c.outer + 22);
    const x = leaders === 'column' ? (side > 0 ? c.width - pad : pad) : side > 0 ? Math.max(near.x, clearance) : Math.min(near.x, clearance);
    return { s, lines, x, y: near.y, side, anchor, textAnchor: side > 0 ? 'start' : 'end', width };
  });
  // Keep blocks apart. The first block starts no higher than the canvas top;
  // the canvas grows at the bottom to fit whatever was pushed down.
  let bottom = 0;
  if (leaders === 'none') {
    bottom = settleBeside(c, placed, lineHeight, pad);
  } else {
    for (const side of [-1, 1] as const) {
      const column = placed.filter((p) => p.side === side).sort((a, b) => a.y - b.y);
      let cursor = 8;
      for (const p of column) {
        const block = p.lines.length * lineHeight;
        const top = Math.max(p.y - block / 2, cursor);
        p.y = top + block / 2;
        cursor = top + block + 6;
        bottom = Math.max(bottom, cursor);
      }
    }
  }
  const nodes = placed.map((p) => {
    const top = p.y - (p.lines.length * lineHeight) / 2 + size * 0.85;
    const textX = leaders === 'column' ? (p.side > 0 ? c.width - pad : pad) : p.x;
    // A column leader ends where the WORDS end, not where the column does: the
    // label is anchored to the canvas edge and reads inward, so the leader has
    // to reach past the longest line to meet it.
    const edgeX = p.side > 0 ? textX - p.width - 4 : textX + p.width + 4;
    // A leader ends at the WORDS, wherever stacking moved them: for a column
    // label an elbow at the radial line then across; for a short leader a
    // straight line from the sector to the near edge of the text. The first
    // version ended a short leader at a fixed radial point, so a label pushed
    // down by its neighbours drifted away from its own stub.
    const leader = leaders === 'none' ? null : leaders === 'column'
      ? `${round(p.anchor.x)},${round(p.anchor.y)} ${round(point(c, c.outer + 14, p.s.mid).x)},${round(p.y)} ${round(edgeX)},${round(p.y)}`
      : `${round(p.anchor.x)},${round(p.anchor.y)} ${round(p.side > 0 ? textX - 4 : textX + 4)},${round(p.y)}`;
    return <g key={p.s.index} data-chart-outside-label="">
      {leader && <polyline points={leader} fill="none" stroke={opts.leaderColor ?? c.textColor} strokeWidth={1} />}
      <text x={round(textX)} y={round(top)} textAnchor={leaders === 'column' ? (p.side > 0 ? 'end' : 'start') : p.textAnchor} fontSize={size} fontFamily={c.type.fontFamily} fill={opts.color ?? c.textColor} fontWeight={opts.weight ?? 400}>
        {p.lines.map((line, i) => <tspan key={i} x={round(textX)} dy={i === 0 ? 0 : lineHeight}
          {...(i === 0 && opts.firstLine ? { fontWeight: opts.firstLine.weight ?? opts.weight ?? 400, fontSize: opts.firstLine.size ?? size, fill: opts.firstLine.color ?? opts.color ?? c.textColor } : {})}>{line}</tspan>)}
      </text>
    </g>;
  });
  return { node: <g data-chart-outside-labels="">{nodes}</g>, height: Math.ceil(bottom + 8) };
}

/** The authored focal figure in a donut's hole. Draws nothing without one. */
export function donutCenter(c: CircularContext, opts: { ring?: number } & LabelStyle = {}): Part {
  if (!c.center) return { node: null };
  const inner = innerRadius(c, opts.ring);
  const value = c.center.value;
  const size = opts.size ?? Math.max(14, Math.min(c.type.titleSize + 6, (inner * 1.5) / Math.max(1, Array.from(value).length) / 0.65));
  return { node: <g data-chart-center="">
    <text x={round(c.cx)} y={round(c.cy - (c.center.label ? size * 0.25 : 0))} textAnchor="middle" dominantBaseline="central" fontSize={size} fontWeight={opts.weight ?? c.type.titleWeight} fontFamily={c.type.fontFamily} fill={opts.color ?? c.textColor}>{value}</text>
    {c.center.label && <text x={round(c.cx)} y={round(c.cy + size * 0.65)} textAnchor="middle" dominantBaseline="central" fontSize={Math.max(11, Math.min(c.type.labelSize, c.compact ? 12 : 14))} fontFamily={c.type.fontFamily} fill={opts.color ?? c.textColor}>{c.center.label}</text>}
  </g> };
}

/** The SVG, sized to the tallest part. Parts draw in order; put slices first. */
export function canvas(c: CircularContext, parts: Part[]): ReactNode {
  const height = Math.max(c.compact ? 300 : 340, ...parts.map((p) => p.height ?? 0));
  // Parts measured their layout against the nominal centre; keep it.
  return <svg viewBox={`0 0 ${c.width} ${height}`} width={c.width} height={height} role="img" aria-hidden="true" style={{ display: 'block', maxWidth: '100%', height: 'auto' }}>
    {parts.map((p, i) => <g key={i}>{p.node}</g>)}
  </svg>;
}

/** An HTML key under the chart: swatch, name and the chosen text per sector.
 *  Draw it only where the labels on the circle do not already say it. */
export function key(c: CircularContext, opts: { text?: (s: CircularSlice) => string } = {}): ReactNode {
  return <ul data-chart-key="" className="mt-4 grid gap-x-6 gap-y-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,180px),1fr))', fontSize: Math.max(12, c.type.labelSize), lineHeight: 1.5, fontFamily: c.type.fontFamily }}>
    {c.slices.map((s) => <li key={s.index} className="flex min-w-0 items-start gap-2">
      <span aria-hidden="true" className="mt-1.5 size-3 shrink-0" style={{ background: s.color }} />
      <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}><span className="font-medium">{s.name}</span><br />{opts.text ? opts.text(s) : `${s.valueLabel} (${s.share > 0 ? s.shareLabel : '—'})`}</span>
    </li>)}
  </ul>;
}

/** Word-wrap one line to a width using the renderer's own metrics; at most three lines. */
export function wrap(text: string, width: number, font: string): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.trim().split(/\s+/)) {
    if (line && measureStaticText(`${line}${word}`, font).width > width) { lines.push(line.trim()); line = ''; }
    for (const character of word) {
      if (line && measureStaticText(line + character, font).width > width) { lines.push(line.trim()); line = ''; }
      line += character;
    }
    line += ' ';
  }
  if (line.trim()) lines.push(line.trim());
  const visible = lines.slice(0, 3);
  if (lines.length > 3) {
    let last = Array.from(visible[2] ?? '');
    while (last.length && measureStaticText(`${last.join('')}…`, font).width > width) last.pop();
    visible[2] = `${last.join('').trimEnd()}…`;
  }
  return visible;
}

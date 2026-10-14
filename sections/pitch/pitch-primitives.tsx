// The MECHANICAL half of a pitch section: the frame around every section
// (header, main, footer), and the parts a main is built from. Nothing in here
// is a brand decision — what a brand decides (where the kicker sits, what a
// lead panel's bar looks like, the bullet marker, the band's lead-in word, the
// field colour) is written in pitch-composition.tsx by composing these parts
// and setting pitchTheme. See COMPOSING.md.
//
// Server-rendered HTML, deterministic, no hooks, no DOM. Every part reads the
// brand's values from the theme it is handed; none carries a colour, a size or
// a weight of its own. Layout is inline style on purpose: a part renders the
// same in the check, the component view and a published page, with no CSS
// build between them.
import type { CSSProperties, ReactNode } from 'react';

/** A rank is the ONLY styling knob a main has: which of its parts leads,
 *  which support, which are asides. What a rank looks like is the brand's. */
export type Rank = 'lead' | 'support' | 'aside';

export interface RankStyle {
  /** The bar or surface behind a ranked heading. */
  background: string;
  /** Ink on that surface. */
  color: string;
  weight?: number;
}

/** Brand-settable values the parts read. Keep the parts unchanged when deriving a theme. */
export interface PitchTheme {
  typography: { fontFamily: string; bodySize: number; lineHeight: number };
  /** Body ink, on the field and on surfaces. */
  ink: string;
  /** The page behind the frame (header and footer sit on it). */
  page: string;
  /** The field behind a main. The deck's "same background on every slide". */
  field: string;
  /** A surface placed on the field: table rows, quote cards, framework cells. */
  surface: string;
  /** The line between rows on a surface. */
  divider: string;
  ranks: Record<Rank, RankStyle>;
  /** A focal figure: colour, size and weight; its own face when the brand sets one. */
  stat: { color: string; size: number; weight: number; fontFamily?: string };
  bullet: { marker: 'triangle' | 'dot' | 'dash' | 'none'; color: string };
  /** A key-value row's value column. */
  values: { weight: number; align: 'left' | 'right' };
  /** Rows on a surface: an optional second shade for every other row (a
   *  guide's "alternating Light Grey" table), and the header's own surface
   *  when it differs from the lead rank's bar. */
  table?: { stripe?: string | null; headerBackground?: string | null; headerColor?: string | null };
  /** Structural restrictions from the brand, kept here for authors. */
  neverDo: string[];
}

/** What a frame is asked to wrap. The frame composition reads this and draws
 *  the header and footer; the main (children) is the section's own. */
export interface FrameContext {
  kicker?: string | null;
  title: string;
  /** The one sentence the section exists to land. Drawn by the footer. */
  takeaway?: string | null;
  /** What kind of sentence it is: the band's lead-in word comes from this. */
  takeawayKind?: 'implication' | 'recommendation' | 'takeaway' | 'next' | null;
  /** Running footer facts the brand may draw: the document's title, a
   *  confidentiality note, the client, the date. The composition decides
   *  which, and where. */
  running?: { title?: string | null; note?: string | null; client?: string | null; date?: string | null };
  /** This section's place in the document, when the author numbers pages. */
  page?: { index: number; total?: number | null } | null;
  /** The brand's mark, when the design system has one to pass. */
  logo?: ReactNode;
  compact: boolean;
  /** The frame's horizontal margin, so a part can bleed past it on purpose. */
  margin: number;
  theme: PitchTheme;
}

export interface FrameComposition {
  header: ReactNode;
  /** The takeaway region between main and footer: the section's own last
   *  word, apart from the document's running footer. Omit to draw none. */
  takeaway?: ReactNode;
  footer: ReactNode;
  /** Override the field for this frame; defaults to theme.field. */
  field?: string;
  /** The surface under the takeaway region. It closes the main, so it sits on
   *  the field by default. A brand that sets the takeaway apart by surface —
   *  a white band after a tinted field, as decks do — says so here; the
   *  region is full width and padded, and the band inside it never paints. */
  takeawaySurface?: string;
}

export interface Part { node: ReactNode }

// ── Frame parts ──────────────────────────────────────────────────────────────

/** The small label above a title. */
export function kicker(c: FrameContext, opts: { color?: string; size?: number; weight?: number; transform?: CSSProperties['textTransform']; letterSpacing?: string; fontFamily?: string } = {}): Part {
  if (!c.kicker) return { node: null };
  return { node: <p data-pitch-kicker="" style={{ margin: 0, color: opts.color ?? c.theme.ink, fontSize: opts.size ?? 12, fontWeight: opts.weight ?? 700, textTransform: opts.transform, letterSpacing: opts.letterSpacing, fontFamily: opts.fontFamily, lineHeight: 1.3 }}>{c.kicker}</p> };
}

/** The section's claim. One line in the deck; wraps on a phone. */
export function title(c: FrameContext, opts: { color?: string; size?: number; weight?: number; letterSpacing?: string; fontFamily?: string } = {}): Part {
  const size = opts.size ?? (c.compact ? 22 : 28);
  return { node: <h2 data-pitch-title="" style={{ margin: 0, color: opts.color ?? c.theme.ink, fontSize: size, fontWeight: opts.weight ?? 700, letterSpacing: opts.letterSpacing, fontFamily: opts.fontFamily, lineHeight: 1.15, textWrap: 'balance' as CSSProperties['textWrap'] }}>{c.title}</h2> };
}

/** A horizontal rule, for brands that draw one under the title or over the footer. */
export function rule(c: FrameContext, opts: { color?: string; width?: number; bleed?: boolean } = {}): Part {
  // A footer line in a deck runs edge to edge; `bleed` pushes past the frame's margin to do the same.
  return { node: <hr data-pitch-rule="" style={{ border: 0, borderTop: `${String(opts.width ?? 1)}px solid ${opts.color ?? c.theme.divider}`, margin: 0, marginInline: opts.bleed ? -c.margin : 0 }} /> };
}

/** The takeaway band: the one sentence, set apart, and VISIBLY the conclusion.
 *  Its lead-in word names what kind of sentence it is ("Recommendation:") and
 *  comes from the content's `takeawayKind`; the brand styles it — colour,
 *  weight, its own wording per kind — and may add a marker glyph before it.
 *  The word is never dropped, and the band never paints its own background:
 *  a box inside the region is a callout card. What sets the takeaway apart is
 *  its REGION — the frame gives it one, full width, whose surface the brand
 *  chooses with `takeawaySurface` — plus the lead-in, a marker, a rule above.
 *  Draws nothing without a takeaway. */
export function band(c: FrameContext, opts: { leadIn?: Partial<Record<NonNullable<FrameContext['takeawayKind']>, string>>; leadInColor?: string; leadInWeight?: number; marker?: ReactNode; color?: string; size?: number } = {}): Part {
  if (!c.takeaway) return { node: null };
  const kind = c.takeawayKind ?? 'takeaway';
  const word = opts.leadIn?.[kind] ?? { implication: 'Implication', recommendation: 'Recommendation', takeaway: 'Takeaway', next: 'Next step' }[kind];
  return { node: <p data-pitch-band="" style={{ margin: 0, display: 'flex', alignItems: 'baseline', gap: 10, color: opts.color ?? c.theme.ink, fontSize: opts.size ?? c.theme.typography.bodySize + 2, lineHeight: 1.4 }}>
    {opts.marker ? <span data-pitch-band-marker="" style={{ display: 'contents' }}>{opts.marker}</span> : null}
    <span><strong data-pitch-band-lead-in="" style={{ color: opts.leadInColor ?? c.theme.ranks.lead.background, fontWeight: opts.leadInWeight ?? 700 }}>{word}: </strong>{c.takeaway}</span>
  </p> };
}

/** Small running text: a confidentiality note, the client, the date. */
export function footnote(c: FrameContext, text: string | null | undefined, opts: { color?: string; size?: number } = {}): Part {
  if (!text) return { node: null };
  return { node: <small data-pitch-footnote="" style={{ color: opts.color ?? c.theme.ink, fontSize: opts.size ?? 9, lineHeight: 1.3 }}>{text}</small> };
}

/** The page number, when the section has one: "10", or "10 / 21" with `ofTotal`. */
export function pageNumber(c: FrameContext, opts: { color?: string; size?: number; ofTotal?: boolean } = {}): Part {
  if (!c.page) return { node: null };
  const text = opts.ofTotal && c.page.total ? `${String(c.page.index)} / ${String(c.page.total)}` : String(c.page.index);
  return { node: <span data-pitch-page="" style={{ color: opts.color ?? c.theme.ink, fontSize: opts.size ?? 12, fontVariantNumeric: 'tabular-nums' }}>{text}</span> };
}

/** The brand's mark, as handed to the frame. Draws nothing without one. In
 *  the header it may only sit in a row's RIGHT group: the top-left is where
 *  the kicker and title start, and a mark there crowds them. The footer takes
 *  it on either side. */
export function logo(c: FrameContext, opts: { height?: number } = {}): Part {
  if (!c.logo) return { node: null };
  return { node: <span data-pitch-logo="" style={{ display: 'inline-flex', height: opts.height ?? 18, alignItems: 'center' }}>{c.logo}</span> };
}

/** Lay frame parts out in a row: left parts, then right parts at the far edge. */
export function row(left: Part[], right: Part[] = [], opts: { gap?: number; align?: CSSProperties['alignItems'] } = {}): ReactNode {
  const nodes = (parts: Part[]) => parts.map((p, i) => <span key={i} style={{ display: 'contents' }}>{p.node}</span>);
  return <div data-pitch-row="" style={{ display: 'flex', justifyContent: 'space-between', alignItems: opts.align ?? 'center', gap: opts.gap ?? 16 }}>
    <span data-pitch-row-left="" style={{ display: 'flex', alignItems: 'center', gap: opts.gap ?? 16, minWidth: 0 }}>{nodes(left)}</span>
    {right.length ? <span data-pitch-row-right="" style={{ display: 'flex', alignItems: 'center', gap: opts.gap ?? 16 }}>{nodes(right)}</span> : null}
  </div>;
}

/** Stack frame parts vertically with a gap. */
export function stack(parts: Part[], opts: { gap?: number } = {}): ReactNode {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: opts.gap ?? 6 }}>{parts.map((p, i) => <span key={i} style={{ display: 'contents' }}>{p.node}</span>)}</div>;
}

// ── The frame ────────────────────────────────────────────────────────────────

/**
 * Every pitch section renders through this: the brand's header above, the
 * main on the field, the takeaway region when the brand draws one (on the
 * field too: it is the main's last word), the brand's footer last, on the
 * page, as its own element. Header, takeaway and footer are whatever `compose`
 * returns for this context; the main is the section's own, built from the
 * parts below.
 */
export function PitchFrame(props: Omit<FrameContext, 'theme' | 'compact' | 'margin'> & {
  id?: string | null;
  theme: PitchTheme;
  compose: (c: FrameContext) => FrameComposition;
  /** Horizontal padding of header, main and footer; the deck's 0.5in margin. */
  margin?: number;
  children: ReactNode;
}) {
  const { id, theme, compose, margin = 48, children, ...ctx } = props;
  // Composed once for the wide layout; the main reflows by itself and the
  // header/footer are text, so one pass serves every width.
  const c: FrameContext = { ...ctx, compact: false, margin, theme };
  const frame = compose(c);
  return <section id={id ?? undefined} data-pitch-frame="" style={{ fontFamily: theme.typography.fontFamily, fontSize: theme.typography.bodySize, lineHeight: theme.typography.lineHeight, color: theme.ink, background: theme.page, containerType: 'inline-size' as CSSProperties['containerType'] }}>
    <header data-pitch-header="" style={{ padding: `32px ${String(margin)}px 16px` }}>{frame.header}</header>
    <div data-pitch-main="" style={{ background: frame.field ?? theme.field, padding: `32px ${String(margin)}px 40px` }}>{children}</div>
    {frame.takeaway && ctx.takeaway ? <div data-pitch-takeaway="" style={{ background: frame.takeawaySurface ?? frame.field ?? theme.field, padding: `${frame.takeawaySurface ? '24px' : '0'} ${String(margin)}px ${frame.takeawaySurface ? '24px' : '32px'}` }}>{frame.takeaway}</div> : null}
    <footer data-pitch-footer="" style={{ padding: `20px ${String(margin)}px 24px` }}>{frame.footer}</footer>
  </section>;
}

// ── Main parts ───────────────────────────────────────────────────────────────

/** Side-by-side columns of a main. `widths` are fractions; omitted = equal. */
export function Columns({ children, widths, gap = 32 }: { children: ReactNode; widths?: number[]; gap?: number }) {
  const template = widths ? widths.map((w) => `${String(w)}fr`).join(' ') : `repeat(${String(Array.isArray(children) ? children.length : 1)}, minmax(0, 1fr))`;
  return <div data-pitch-columns="" style={{ display: 'grid', gridTemplateColumns: template, gap, alignItems: 'start' }}>{children}</div>;
}

/** A ranked block: a heading on the rank's bar, then its body. The rank is
 *  the whole decision; the bar's colour, ink and weight are the brand's. */
export function Panel({ rank, heading, theme, children }: { rank: Rank; heading?: string | null; theme: PitchTheme; children: ReactNode }) {
  const style = theme.ranks[rank];
  return <div data-pitch-panel="" data-rank={rank}>
    {heading ? <h3 data-pitch-panel-heading="" style={{ margin: 0, padding: '12px 16px', background: style.background, color: style.color, fontWeight: style.weight ?? 700, fontSize: theme.typography.bodySize + 4, lineHeight: 1.2 }}>{heading}</h3> : null}
    <div data-pitch-panel-body="">{children}</div>
  </div>;
}

/** Label / value rows on a surface: a fee table, a timeline, a spec list.
 *  Every other row takes `theme.table.stripe` when the brand sets one. */
export function KeyValues({ rows, theme }: { rows: { label: string; value: string }[]; theme: PitchTheme }) {
  const stripe = theme.table?.stripe ?? null;
  return <dl data-pitch-keyvalues="" style={{ margin: 0, background: theme.surface }}>
    {rows.map((r, i) => <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, padding: '12px 16px', background: stripe && i % 2 === 1 ? stripe : undefined, borderTop: i === 0 || stripe ? undefined : `1px solid ${theme.divider}` }}>
      <dt style={{ margin: 0 }}>{r.label}</dt>
      <dd style={{ margin: 0, fontWeight: theme.values.weight, textAlign: theme.values.align, fontVariantNumeric: 'tabular-nums' }}>{r.value}</dd>
    </div>)}
  </dl>;
}

function marker(theme: PitchTheme): ReactNode {
  const { marker: kind, color } = theme.bullet;
  const size = Math.round(theme.typography.bodySize * 0.55);
  if (kind === 'none') return null;
  if (kind === 'dash') return <span aria-hidden="true" style={{ display: 'inline-block', width: size + 2, height: 2, background: color, marginTop: Math.round(theme.typography.bodySize * theme.typography.lineHeight / 2) - 1 }} />;
  if (kind === 'dot') return <span aria-hidden="true" style={{ display: 'inline-block', width: size, height: size, borderRadius: '50%', background: color, marginTop: Math.round((theme.typography.bodySize * theme.typography.lineHeight - size) / 2) }} />;
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 10 10" style={{ flex: 'none', marginTop: Math.round((theme.typography.bodySize * theme.typography.lineHeight - size) / 2) }}><path d="M1 0 L9 5 L1 10 Z" fill={color} /></svg>;
}

/** A list with the brand's marker. One item per entry; never numbered. */
export function Bullets({ items, theme, gap = 14 }: { items: string[]; theme: PitchTheme; gap?: number }) {
  return <ul data-pitch-bullets="" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap }}>
    {items.map((item, i) => <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>{marker(theme)}<span style={{ minWidth: 0 }}>{item}</span></li>)}
  </ul>;
}

/** A focal figure with its label and an optional note. The brand's stat style. */
export function Stat({ value, unit, label, note, theme }: { value: string; unit?: string | null; label?: string | null; note?: string | null; theme: PitchTheme }) {
  return <div data-pitch-stat="">
    <p style={{ margin: 0, color: theme.stat.color, fontSize: theme.stat.size, fontWeight: theme.stat.weight, fontFamily: theme.stat.fontFamily, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
      {value}{unit ? <span style={{ fontSize: Math.round(theme.stat.size * 0.6) }}>{unit}</span> : null}
    </p>
    {label ? <p style={{ margin: '8px 0 0', fontWeight: 700 }}>{label}</p> : null}
    {note ? <p style={{ margin: '4px 0 0' }}>{note}</p> : null}
  </div>;
}

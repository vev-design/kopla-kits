// THE BRAND'S PITCH, in two parts: values the parts read (pitchTheme) and the
// COMPOSITION of the frame every section wears (composeFrame) from the parts
// in pitch-primitives.tsx. This is the one file a brand's component build
// edits. The parts and the mains are never touched — see COMPOSING.md.
import { band, footnote, kicker, logo, row, rule, stack, title } from './pitch-primitives';
import type { FrameComposition, FrameContext, PitchTheme } from './pitch-primitives';

/** Brand-settable values only. The neutral default reads the kit's tokens. */
export const pitchTheme: PitchTheme = {
  /** Kit sans face; 15px body. */
  typography: { fontFamily: 'var(--font-sans, sans-serif)', bodySize: 15, lineHeight: 1.45 },
  ink: 'var(--foreground)',
  page: 'var(--background)',
  /** The field behind every main: the kit's muted surface. */
  field: 'var(--muted)',
  surface: 'var(--background)',
  divider: 'var(--border)',
  /** Lead on the primary surface, support on the foreground, aside on a quiet tint. */
  ranks: {
    lead: { background: 'var(--primary)', color: 'var(--primary-foreground)' },
    support: { background: 'var(--foreground)', color: 'var(--background)' },
    aside: { background: 'var(--secondary)', color: 'var(--secondary-foreground)' },
  },
  /** A focal figure in the primary colour, 48px, bold. */
  stat: { color: 'var(--primary)', size: 48, weight: 700 },
  bullet: { marker: 'dot', color: 'var(--primary)' },
  values: { weight: 700, align: 'right' },
  neverDo: [],
};

/**
 * How this brand frames a section. The neutral default: kicker over the title
 * in the header; the takeaway on its own line with a lead-in word; a footer
 * that opens with an edge-to-edge rule, then the running note on the left and
 * the logo on the right. Keep it static: no hooks, no browser APIs.
 */
export function composeFrame(c: FrameContext): FrameComposition {
  return {
    header: stack([kicker(c), title(c)], { gap: 8 }),
    takeaway: band(c, { leadInColor: pitchTheme.ranks.lead.background }).node,
    footer: stack([
      rule(c, { bleed: true }),
      { node: row([footnote(c, c.running?.note)], [logo(c)]) },
    ], { gap: 16 }),
  };
}

import { Reveal, Stagger } from '@/motion';
import { Eyebrow, Rule } from '@/components';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

/**
 * One letterform blown up to fill half the screen, with the drawing decisions
 * named beside it — the flare where the stem meets the serif, the wedge on a
 * terminal, the spur on a shoulder. This is the section that earns the rest of
 * the system: it teaches the viewer what to look at, so every later setting
 * reads as deliberate rather than decorative. Pair a display glyph with 3–5
 * callouts and no more.
 *
 * @hydrate
 */
export interface AnatomyProps extends SectionBaseProps {
  /** Tracked caps label. 1–3 words. */
  eyebrow?: string | null;
  /** Section heading. 2–6 words, no trailing period. */
  heading: string;
  /** The character to enlarge. Exactly 1 character — pick one that shows the family's traits (R, G, a, y). */
  glyph: string;
  /** Which voice the enlarged glyph is drawn in. */
  face?: 'display' | 'wedge';
  /** The drawing decisions worth naming. 3–5 items. */
  callouts: {
    /** Feature name. 1–2 words (e.g. "Flare", "Wedge terminal"). */
    term: string;
    /** What it does and why. 1 sentence, 10–24 words. */
    detail: string;
  }[];
  /** Which side the enlarged glyph sits on. */
  variant?: 'glyph-left' | 'glyph-right';
}

export function Anatomy({
  id,
  eyebrow,
  heading,
  glyph,
  face = 'display',
  callouts,
  variant = 'glyph-left',
}: AnatomyProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background py-24 md:py-36">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div
          className={cn(
            'grid items-center gap-14 md:grid-cols-2 md:gap-20',
            variant === 'glyph-right' && 'md:[&>*:first-child]:order-2',
          )}
        >
          <Reveal>
            <div className="flex aspect-square w-full items-center justify-center overflow-hidden border border-border bg-card">
              <span
                aria-hidden
                className={cn(
                  'leading-none text-foreground select-none',
                  face === 'display' ? 'font-display' : 'font-wedge',
                )}
                style={{ fontSize: 'clamp(11rem, 30vw, 22rem)', fontWeight: 700 }}
              >
                {glyph}
              </span>
            </div>
          </Reveal>
          <div>
            {eyebrow ? <Eyebrow className="mb-5">{eyebrow}</Eyebrow> : null}
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.05] font-bold text-foreground uppercase [letter-spacing:var(--tracking-caps)]">
              {heading}
            </h2>
            <Rule weight="flare" className="mt-8 mb-2" />
            <Stagger step={0.08}>
              {callouts.map((callout) => (
                <div key={callout.term} className="border-b border-border py-6">
                  <p className="font-wedge text-lg font-bold text-foreground">
                    {callout.term}
                  </p>
                  <p className="measure mt-2 font-sans text-sm leading-relaxed text-muted-foreground text-pretty">
                    {callout.detail}
                  </p>
                </div>
              ))}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
}

export const AnatomyDemo: AnatomyProps = {
  eyebrow: 'Anatomy',
  heading: 'Where the contrast lives',
  glyph: 'R',
  face: 'display',
  callouts: [
    {
      term: 'Flare',
      detail: 'The stem widens as it approaches the baseline instead of meeting a bracketed serif at a corner.',
    },
    {
      term: 'Spurred leg',
      detail: 'The R throws its leg out past the bowl, a Roman-capital habit that keeps wide settings from closing up.',
    },
    {
      term: 'Wedge terminal',
      detail: 'Terminals are cut at an angle rather than rounded, which is what reads as carved at large sizes.',
    },
    {
      term: 'Re-cut serifs',
      detail: 'Serifs are drawn heavier than the inscription would suggest so they hold at sixteen pixels.',
    },
  ],
  variant: 'glyph-left',
};

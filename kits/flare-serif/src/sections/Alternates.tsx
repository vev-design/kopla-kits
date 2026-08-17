import { Reveal, Stagger } from '@/motion';
import { Eyebrow, GlyphTile } from '@/components';
import type { SectionBaseProps } from '@/types';

/**
 * The stylistic-set alternates shown as a brand-level decision rather than a
 * per-instance one: each character appears in its default and alternate cut
 * side by side, with the choice this system has locked marked once. Treating
 * alternates as a token — one `a`, one `g`, chosen and never revisited — is
 * what keeps an expressive face from reading differently on every surface.
 *
 * @hydrate
 */
export interface AlternatesProps extends SectionBaseProps {
  /** Tracked caps label. 1–3 words. */
  eyebrow?: string | null;
  /** Section heading. 3–7 words, no trailing period. */
  heading: string;
  /** The rule this system has adopted. 1–2 sentences, 18–40 words. */
  note?: string | null;
  /** Characters with meaningful alternates. 2–4 items. */
  pairs: {
    /** The character. Exactly 1 character. */
    glyph: string;
    /** Which cut this system locked. */
    locked: 'default' | 'alternate';
    /** What the alternate changes. 1 sentence, 6–16 words. */
    caption: string;
  }[];
}

export function Alternates({ id, eyebrow, heading, note, pairs }: AlternatesProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-6">
        <Reveal className="measure mb-16">
          {eyebrow ? <Eyebrow className="mb-5">{eyebrow}</Eyebrow> : null}
          <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.05] font-bold text-foreground uppercase [letter-spacing:var(--tracking-caps)]">
            {heading}
          </h2>
          {note ? (
            <p className="mt-6 font-sans text-base leading-relaxed text-muted-foreground text-pretty">
              {note}
            </p>
          ) : null}
        </Reveal>
        <Stagger step={0.07} className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {pairs.map((pair) => (
            <figure key={pair.glyph}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <GlyphTile glyph={pair.glyph} face="wedge" weight={500} />
                  <p className="mt-2 text-center font-sans text-[0.625rem] font-semibold uppercase [letter-spacing:var(--tracking-label)] text-muted-foreground">
                    {pair.locked === 'default' ? 'Locked' : 'Default'}
                  </p>
                </div>
                <div>
                  <GlyphTile
                    glyph={pair.glyph}
                    face="wedge"
                    weight={500}
                    alternate
                    tone={pair.locked === 'alternate' ? 'ink' : 'paper'}
                  />
                  <p className="mt-2 text-center font-sans text-[0.625rem] font-semibold uppercase [letter-spacing:var(--tracking-label)] text-muted-foreground">
                    {pair.locked === 'alternate' ? 'Locked' : 'Alternate'}
                  </p>
                </div>
              </div>
              <figcaption className="mt-5 border-t border-border pt-4 font-sans text-sm leading-relaxed text-muted-foreground text-pretty">
                {pair.caption}
              </figcaption>
            </figure>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export const AlternatesDemo: AlternatesProps = {
  eyebrow: 'Stylistic sets',
  heading: 'Pick the alternate once, then lock it',
  note: 'Four characters ship with a second cut. This system commits to one of each and holds it across every surface — an alternate chosen per headline is how a family stops looking like a family.',
  pairs: [
    { glyph: 'a', locked: 'alternate', caption: 'Double-storey by default; the single-storey cut is what we set.' },
    { glyph: 'g', locked: 'default', caption: 'The binocular g stays — the single-storey version crowds at text sizes.' },
    { glyph: 'l', locked: 'alternate', caption: 'A tailed l, which stops it reading as a capital I in product names.' },
    { glyph: 'y', locked: 'default', caption: 'The straight descender holds the baseline better in tight leading.' },
  ],
};

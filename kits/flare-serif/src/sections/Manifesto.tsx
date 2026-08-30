import { Reveal } from '@/motion';
import { Eyebrow, Rule } from '@/components';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

/**
 * The argument for the face: why this drawing exists in a category that had
 * gone almost entirely sans. One statement set at classical measure, opened
 * by a hanging accent mark, with the release's hard numbers ruled underneath.
 * This is the system's densest passage of running text — everything around it
 * is display — so it is set in the plain grotesk at 60–70 characters.
 *
 * @hydrate
 */
export interface ManifestoProps extends SectionBaseProps {
  /** Tracked caps label. 1–3 words. */
  eyebrow?: string | null;
  /** The claim, set large in the display face. 1 sentence, 6–14 words, no trailing period. */
  statement: string;
  /** The argument beneath it. 2–4 paragraphs' worth in one string of 60–120 words. */
  body: string;
  /** Hard figures about the release. 0–4 items; omit for a pure-text passage. */
  figures?: {
    /** The figure itself. Number plus optional unit, max 6 characters (e.g. "2048", "214"). */
    value: string;
    /** What the figure counts. 1–3 words. */
    label: string;
  }[];
  /** Which side the statement occupies on wide screens. */
  variant?: 'statement-left' | 'statement-right';
}

export function Manifesto({
  id,
  eyebrow,
  statement,
  body,
  figures = [],
  variant = 'statement-left',
}: ManifestoProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background py-24 md:py-36">
      <div className="mx-auto w-full max-w-7xl px-6">
        {eyebrow ? <Eyebrow className="mb-12">{eyebrow}</Eyebrow> : null}
        <div
          className={cn(
            'grid gap-12 md:grid-cols-12 md:gap-16',
            variant === 'statement-right' && 'md:[&>*:first-child]:order-2',
          )}
        >
          <Reveal className="md:col-span-6">
            <h2 className="font-display text-[clamp(1.875rem,4.5vw,3.5rem)] leading-[1.02] font-bold text-foreground uppercase [letter-spacing:var(--tracking-caps)]">
              {/* The one hanging mark: an accent rule set into the left margin. */}
              <span aria-hidden className="mb-5 block h-1 w-16 bg-primary" />
              {statement}
            </h2>
          </Reveal>
          <Reveal className="md:col-span-6">
            <p className="measure font-sans text-base leading-[1.75] text-muted-foreground text-pretty md:text-[1.0625rem]">
              {body}
            </p>
          </Reveal>
        </div>
        {figures.length > 0 ? (
          <div className="mt-20">
            <Rule weight="hair" />
            <dl className="grid grid-cols-2 gap-x-8 gap-y-10 pt-10 md:grid-cols-4">
              {figures.map((figure) => (
                <div key={figure.label}>
                  <dt className="sr-only">{figure.label}</dt>
                  <dd className="nums-table font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-none font-bold text-foreground">
                    {figure.value}
                  </dd>
                  <p className="mt-3 font-sans text-[0.625rem] font-semibold uppercase [letter-spacing:var(--tracking-label)] text-muted-foreground">
                    {figure.label}
                  </p>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export const ManifestoDemo: ManifestoProps = {
  eyebrow: 'The case',
  statement: 'Drawn against a category that went entirely sans',
  body: 'Meridian is a reinterpretation rather than a revival. The proportions come from Roman square capitals — the wide O, the narrow S, the spurred R — but the serifs are re-cut so they survive at sixteen pixels instead of a metre of carved marble. Where a geometric sans flattens every terminal to the same weight, this face keeps the flare, and the flare is what the eye reads as authority. The palette around it stays out of the way on purpose: the contrast already lives in the letterform.',
  figures: [
    { value: '7', label: 'Weights' },
    { value: '2048', label: 'Units per em' },
    { value: '214', label: 'Languages' },
    { value: '1,412', label: 'Glyphs' },
  ],
  variant: 'statement-left',
};

import { Reveal, Stagger } from '@/motion';
import { Eyebrow } from '@/components';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

/**
 * The same word repeated down the page at ascending weights, so the family's
 * modulation reads as a ramp rather than a claim. This is the specimen device
 * that a weight count in a spec sheet cannot replace — you have to see hairline
 * and black stacked to understand what the variable axis actually buys. Each
 * row carries its numeric weight in tabular figures so the column aligns.
 *
 * @hydrate
 */
export interface WeightRampProps extends SectionBaseProps {
  /** Tracked caps label. 1–3 words. */
  eyebrow?: string | null;
  /** Section heading. 2–6 words, no trailing period. */
  heading?: string | null;
  /** The word set at every weight. 1 word, 4–12 characters — it repeats on every row. */
  word: string;
  /** The weights to show, ascending. 3–7 items. */
  steps: {
    /** Numeric weight, 100–900. */
    weight: number;
    /** Weight name. 1–2 words (e.g. "Hairline", "Black"). */
    name: string;
  }[];
  /** Which type voice to ramp: the inscriptional display face or the spurred sans. */
  variant?: 'display' | 'wedge';
}

export function WeightRamp({
  id,
  eyebrow,
  heading,
  word,
  steps,
  variant = 'display',
}: WeightRampProps) {
  return (
    <section
      id={id ?? undefined}
      className="w-full overflow-hidden bg-foreground py-24 text-background md:py-32"
    >
      <div className="mx-auto w-full max-w-7xl px-6">
        {eyebrow ? (
          <Eyebrow tone="quiet" className="mb-6 text-background/60">
            {eyebrow}
          </Eyebrow>
        ) : null}
        {heading ? (
          <Reveal>
            <h2 className="mb-16 font-display text-2xl font-bold uppercase [letter-spacing:var(--tracking-caps)] md:text-3xl">
              {heading}
            </h2>
          </Reveal>
        ) : null}
        <Stagger step={0.06}>
          {steps.map((step) => (
            <div
              key={step.weight}
              className="flex items-baseline gap-6 border-t border-background/20 py-4 md:gap-10"
            >
              <span className="nums-table w-12 shrink-0 font-sans text-xs text-background/50 md:w-16 md:text-sm">
                {step.weight}
              </span>
              <span
                className={cn(
                  'flex-1 truncate text-[clamp(2rem,8vw,6rem)] leading-[1.05] uppercase [letter-spacing:var(--tracking-caps)]',
                  variant === 'display' ? 'font-display' : 'font-wedge',
                )}
                style={{ fontWeight: step.weight }}
              >
                {word}
              </span>
              <span className="hidden shrink-0 font-sans text-[0.625rem] font-semibold uppercase [letter-spacing:var(--tracking-label)] text-background/50 md:block">
                {step.name}
              </span>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export const WeightRampDemo: WeightRampProps = {
  eyebrow: 'The ramp',
  heading: 'Seven weights, one axis',
  word: 'Inscription',
  steps: [
    { weight: 300, name: 'Hairline' },
    { weight: 400, name: 'Regular' },
    { weight: 500, name: 'Medium' },
    { weight: 600, name: 'Semibold' },
    { weight: 700, name: 'Bold' },
    { weight: 800, name: 'Extrabold' },
    { weight: 900, name: 'Black' },
  ],
  variant: 'display',
};

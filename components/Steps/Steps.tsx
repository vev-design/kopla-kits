import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';
import { cn } from '@/lib/utils';
import { archetypeSlots } from './archetype-slots';

/**
 * A plan or timeline. Each step's marker — a numeral by default — comes from
 * the brand through the `stepMarker` slot (archetype-slots.tsx).
 */
export interface StepsProps extends SectionBaseProps {
  /** Section number and category. 2–6 words. */
  eyebrow?: string | null;
  /** The plan in one line. 4–12 words. */
  headline: string;
  /** Framing. 1–3 sentences; omit for none. */
  body?: string | null;
  /** The steps, 2–6 items, in order. */
  steps: {
    /** When. 1–4 words, e.g. "Weeks 1–3"; omit for none. */
    when?: string | null;
    /** The step. 3–9 words. */
    title: string;
    /** What happens. 1–3 sentences, 15–60 words. */
    body: string;
  }[];
  /** Qualification — what is assumed. 1–3 sentences; omit for none. */
  note?: string | null;
  /** Arrangement; defaults to timeline. */
  variant?: 'timeline' | 'numbered';
  /** Band treatment; defaults to default. */
  background?: 'default' | 'muted' | 'accent' | 'inverse';
  /** Vertical padding; defaults to default. */
  spacing?: 'compact' | 'default' | 'spacious';
  /** Remove the small label. */
  hideEyebrow?: boolean;
}

const BACKGROUND = {
  default: 'bg-background text-foreground',
  muted: 'bg-muted text-foreground',
  accent: 'bg-primary text-primary-foreground',
  inverse: 'bg-foreground text-background',
} as const;
const SPACING = {
  compact: 'py-12 md:py-16',
  default: 'py-20 md:py-28',
  spacious: 'py-28 md:py-40',
} as const;
type Background = keyof typeof BACKGROUND;
type Spacing = keyof typeof SPACING;

export function Steps({
  id,
  eyebrow,
  headline,
  body,
  steps,
  note,
  variant = 'timeline',
  background = 'default',
  spacing = 'default',
  hideEyebrow,
}: StepsProps) {
  const count = steps.length;
  return (
    <section id={id ?? undefined} className={cn('w-full', BACKGROUND[background as Background], SPACING[spacing as Spacing])}>
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <Reveal className="max-w-3xl">
          {!hideEyebrow && eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{eyebrow}</p>
          ) : null}
          <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-balance md:text-5xl">{headline}</h2>
          {body ? <p className="mt-6 text-lg leading-relaxed">{body}</p> : null}
        </Reveal>
        <ol className={cn('mt-12 grid gap-8', variant === 'timeline' ? 'md:grid-cols-2 lg:grid-cols-3' : 'max-w-3xl')}>
          {steps.map((step, index) => {
            const marker = archetypeSlots.stepMarker?.({ index, count }) ?? (
              <span className="flex size-10 items-center justify-center rounded-full border border-current/30 text-sm font-semibold tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
            );
            return (
              <Reveal key={index} delay={index * 0.06} className={cn('flex gap-5', variant === 'timeline' && 'flex-col gap-4 border-t border-current/20 pt-6')}>
                <li className="contents">
                  <div className="shrink-0">{marker}</div>
                  <div>
                    {step.when ? <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-70">{step.when}</p> : null}
                    <h3 className="mt-1 text-xl font-semibold leading-snug">{step.title}</h3>
                    <p className="mt-2 text-base leading-relaxed opacity-80">{step.body}</p>
                  </div>
                </li>
              </Reveal>
            );
          })}
        </ol>
        {note ? <p className="mt-8 max-w-3xl text-sm leading-relaxed opacity-70">{note}</p> : null}
      </div>
    </section>
  );
}

export const StepsDemo: StepsProps = {
  id: 'pilot',
  eyebrow: '05 · Pilot plan',
  headline: 'A 12-week pilot with five enterprise design partners',
  body: 'The schedule and participant count are planning assumptions, with partners still to be recruited.',
  steps: [
    { when: 'Weeks 1–3', title: 'Interviews and workflow mapping', body: 'Observe current reporting workflows and choose the reports to test.' },
    { when: 'Weeks 4–8', title: 'A limited prototype', body: 'Weekly feedback sessions on a prototype covering the chosen reports.' },
    { when: 'Weeks 9–12', title: 'Evaluation', body: 'Reporting time, repeat usage, accuracy and willingness to pay against targets agreed before the start.' },
  ],
  variant: 'timeline',
};

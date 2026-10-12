import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';
import { cn } from '@/lib/utils';
import { archetypeSlots } from './archetype-slots';

/**
 * One beat of the argument — the problem, the solution, the model — with two to
 * four supporting ideas. The brand's surface texture or pattern renders behind
 * the band through the `sectionDevice` slot (archetype-slots.tsx).
 */
export interface NarrativeProps extends SectionBaseProps {
  /** Section number and category. 2–6 words. */
  eyebrow?: string | null;
  /** The statement. 4–12 words, sentence case. */
  headline: string;
  /** The explanation. 2–4 sentences, 30–100 words. */
  body: string;
  /** Supporting ideas, 2–4 items. */
  items: {
    /** Category or phase. 1–4 words; omit for none. */
    label?: string | null;
    /** The idea. 3–9 words. */
    title: string;
    /** The explanation. 1–3 sentences, 15–65 words. */
    body: string;
  }[];
  /** Qualification under the ideas — what is assumed rather than known. 1–3 sentences; omit for none. */
  note?: string | null;
  /** Arrangement of the ideas; defaults to cards. */
  variant?: 'cards' | 'columns' | 'ruled';
  /** Band treatment; defaults to default. */
  background?: 'default' | 'muted' | 'accent' | 'inverse';
  /** Vertical padding; defaults to default. */
  spacing?: 'compact' | 'default' | 'spacious';
  /** Heading alignment; defaults to left. */
  align?: 'left' | 'center';
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

export function Narrative({
  id,
  eyebrow,
  headline,
  body,
  items,
  note,
  variant = 'cards',
  background = 'default',
  spacing = 'default',
  align = 'left',
  hideEyebrow,
}: NarrativeProps) {
  const columns = items.length <= 2 ? 'md:grid-cols-2' : items.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4';
  return (
    <section id={id ?? undefined} className={cn('relative w-full overflow-clip', BACKGROUND[background as Background], SPACING[spacing as Spacing])}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {archetypeSlots.sectionDevice?.({ background }) ?? null}
      </div>
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <Reveal className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center')}>
          {!hideEyebrow && eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{eyebrow}</p>
          ) : null}
          <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-balance md:text-5xl">{headline}</h2>
          <p className="mt-6 text-lg leading-relaxed">{body}</p>
        </Reveal>
        <div className={cn('mt-12 grid gap-6', variant !== 'ruled' && columns, variant === 'ruled' && 'gap-0 divide-y divide-current/15 border-y border-current/15')}>
          {items.map((item, index) => (
            <Reveal
              key={index}
              delay={index * 0.06}
              className={cn(
                variant === 'cards' && 'rounded-lg border border-current/15 bg-background/60 p-6 text-foreground',
                variant === 'ruled' && 'grid gap-3 py-6 md:grid-cols-[1fr_2fr]',
              )}
            >
              {item.label ? <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-70">{item.label}</p> : null}
              <h3 className={cn('font-semibold leading-snug', variant === 'ruled' ? 'text-xl' : 'mt-3 text-xl')}>{item.title}</h3>
              <p className={cn('leading-relaxed', variant === 'ruled' ? 'text-base' : 'mt-3 text-base opacity-80')}>{item.body}</p>
            </Reveal>
          ))}
        </div>
        {note ? <p className="mt-8 max-w-3xl text-sm leading-relaxed opacity-70">{note}</p> : null}
      </div>
    </section>
  );
}

export const NarrativeDemo: NarrativeProps = {
  id: 'solution',
  eyebrow: '03 · The proposed solution',
  headline: 'One shared workspace for financial, adoption and feedback reporting',
  body: 'The offering would hold quarterly financial summaries, revenue breakdowns, adoption comparisons and customer sentiment in one place. Charts and tables would include concise explanations linked to their source figures, making it easier to review the evidence behind a statement.',
  items: [
    { label: 'Scope', title: 'Financial summaries with source figures', body: 'Quarterly revenue, costs and margin, each statement linked to the table it comes from.' },
    { label: 'Scope', title: 'Adoption beside satisfaction', body: 'Seat adoption and survey results for the same accounts, so the two can be read together.' },
    { label: 'Scope', title: 'Sentiment over time', body: 'Response categories including non-response, never collapsed into a single score.' },
  ],
  note: 'These capabilities are the proposed product scope. They are not existing capabilities or validated customer demand.',
  variant: 'cards',
};

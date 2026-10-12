import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';
import { cn } from '@/lib/utils';
import { archetypeSlots } from './archetype-slots';

/**
 * One to four focal figures that carry the argument. Each figure is handed to
 * the `statFrame` slot (archetype-slots.tsx) so the brand's framing device —
 * offset squares, concentric circles, a keyline — wraps it; with the slot empty
 * the figures stand on their own.
 */
export interface StatBandProps extends SectionBaseProps {
  /** Small label above the band. 2–6 words; omit for none. */
  eyebrow?: string | null;
  /** Optional statement the figures support. 4–12 words. */
  headline?: string | null;
  /** The figures, 1–4 items. */
  stats: {
    /** The number, 1–6 characters, e.g. "540k", "62.4", "28.8". */
    value: string;
    /** Currency or sign before the number, max 3 characters, e.g. "EUR", "$". */
    currency?: string | null;
    /** Unit or sign after the number, max 3 characters, e.g. "%", "x". */
    unit?: string | null;
    /** What the figure measures. 2–8 words. */
    label: string;
    /** Context under the label. 1 sentence, 8–24 words; omit for none. */
    support?: string | null;
  }[];
  /** Arrangement; defaults to row. */
  variant?: 'single' | 'row' | 'grid';
  /** Band treatment; defaults to default. */
  background?: 'default' | 'muted' | 'accent' | 'inverse';
  /** Vertical padding; defaults to default. */
  spacing?: 'compact' | 'default' | 'spacious';
  /** Alignment of each figure; defaults to left. */
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

export function StatBand({
  id,
  eyebrow,
  headline,
  stats,
  variant = 'row',
  background = 'default',
  spacing = 'default',
  align = 'left',
  hideEyebrow,
}: StatBandProps) {
  const count = stats.length;
  const columns =
    variant === 'single' ? 'grid-cols-1' : variant === 'grid' ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4';
  return (
    <section id={id ?? undefined} className={cn('w-full', BACKGROUND[background as Background], SPACING[spacing as Spacing])}>
      <div className={cn('mx-auto w-full max-w-6xl px-6 md:px-10', align === 'center' && 'text-center')}>
        {(!hideEyebrow && eyebrow) || headline ? (
          <Reveal className="mb-12 max-w-3xl">
            {!hideEyebrow && eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{eyebrow}</p>
            ) : null}
            {headline ? <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-balance md:text-5xl">{headline}</h2> : null}
          </Reveal>
        ) : null}
        <div className={cn('grid gap-10', columns, variant === 'single' && 'max-w-3xl')}>
          {stats.map((stat, index) => {
            const figure = (
              <div className={cn(variant === 'single' ? 'text-7xl md:text-9xl' : 'text-5xl md:text-7xl', 'font-bold leading-none tracking-tight')}>
                {stat.currency ? <span className="mr-2 align-top text-[0.4em] font-semibold opacity-70">{stat.currency}</span> : null}
                {stat.value}
                {stat.unit ? <span className="ml-1 text-[0.5em] font-semibold opacity-70">{stat.unit}</span> : null}
              </div>
            );
            return (
              <Reveal key={index} delay={index * 0.06}>
                {archetypeSlots.statFrame?.({ index, count }, figure) ?? figure}
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.14em]">{stat.label}</p>
                {stat.support ? <p className="mt-2 max-w-xs text-sm leading-relaxed opacity-70">{stat.support}</p> : null}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const StatBandDemo: StatBandProps = {
  id: 'figures',
  eyebrow: 'Scenario evidence',
  headline: 'Enterprise carries the growth',
  stats: [
    { value: '540', currency: 'EUR', unit: 'k', label: 'Enterprise revenue increase', support: 'First to last quarter, Q1 2025 to Q4 2026.' },
    { value: '56.5', unit: '%', label: 'Share of Q4 2026 revenue', support: 'Enterprise, of EUR 1.7m total.' },
    { value: '28.8', unit: '%', label: 'Operating margin, Q4 2026', support: 'Up from 14.0% in Q1 2025.' },
    { value: '1,320', label: 'Active accounts', support: '500 more than the first quarter shown.' },
  ],
  variant: 'row',
};

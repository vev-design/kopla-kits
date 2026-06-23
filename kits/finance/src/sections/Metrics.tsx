import { Stat } from '@/components/Stat';
import { Reveal, Stagger } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * A row of trust-and-scale figures rendered in tabular mono numerals. Sits
 * right under the hero to back the promise with numbers — assets, customers,
 * uptime, returns. Static figures; the column count adapts to the item count.
 */
export interface MetricsProps extends SectionBaseProps {
  /** Small label above the figures. 1–3 words, sentence case (e.g. "Trusted at scale"). */
  eyebrow?: string | null;
  /** Trust figures. 3–4 items read best across one row. */
  stats: {
    /** The figure. Number + optional unit, max 7 characters (e.g. "$4.2B", "99.99%", "1.2M"). */
    value: string;
    /** What the figure measures. 1–4 words, sentence case (e.g. "Assets under management"). */
    label: string;
    /** Optional accent caption under the label. 1–4 words (e.g. "year over year"). */
    caption?: string | null;
  }[];
}

export function Metrics({ id, eyebrow, stats }: MetricsProps) {
  return (
    <section id={id ?? undefined} className="w-full border-y border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        {eyebrow ? (
          <Reveal>
            <p className="mb-10 text-xs font-medium tracking-[0.18em] text-primary uppercase">
              {eyebrow}
            </p>
          </Reveal>
        ) : null}
        <Stagger className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          {stats.map((stat) => (
            <Stat
              key={stat.label}
              value={stat.value}
              label={stat.label}
              caption={stat.caption ?? null}
              align="left"
              size="lg"
            />
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export const MetricsDemo: MetricsProps = {
  eyebrow: 'Trusted at scale',
  stats: [
    { value: '$4.2B', label: 'Assets under management', caption: 'across 40 markets' },
    { value: '1.2M', label: 'Funded accounts', caption: 'and growing' },
    { value: '99.99%', label: 'Platform uptime', caption: 'last 12 months' },
    { value: '0.15%', label: 'Average annual fee', caption: 'all in' },
  ],
};

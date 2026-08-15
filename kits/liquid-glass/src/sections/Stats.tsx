import { GlassCard } from '@/components/GlassCard';
import { Reveal, Stagger } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * A row of light glass stat tiles — the system's social-proof strip. Each
 * tile is a big figure over a short label, so trust is established through
 * numbers rather than customer wordmarks. Place directly under the hero to
 * reassure the skeptic before they read the feature copy.
 */
export interface StatsProps extends SectionBaseProps {
  /** Small lead-in above the row. 2–5 words, sentence case (e.g. "Trusted at scale"). */
  eyebrow?: string | null;
  /** Stat tiles. 3–4 items. */
  stats: {
    /** Stat figure. Number + optional unit, max 8 characters (e.g. "2.4M", "99.9%"). */
    value: string;
    /** Stat label under the figure. 2–5 words, sentence case. */
    label: string;
  }[];
}

export function Stats({ id, eyebrow, stats }: StatsProps) {
  return (
    <section id={id ?? undefined} className="w-full">
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        {eyebrow ? (
          <Reveal>
            <p className="mb-8 text-center text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              {eyebrow}
            </p>
          </Reveal>
        ) : null}
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <GlassCard key={stat.label} variant="light" className="items-center gap-1 p-8 text-center">
              <p className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </GlassCard>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export const StatsDemo: StatsProps = {
  eyebrow: 'Trusted at scale',
  stats: [
    { value: '2.4M', label: 'Surfaces rendered daily' },
    { value: '99.9%', label: 'Refraction uptime' },
    { value: '340+', label: 'Teams shipping on Halo' },
    { value: '18ms', label: 'Average blur compute' },
  ],
};

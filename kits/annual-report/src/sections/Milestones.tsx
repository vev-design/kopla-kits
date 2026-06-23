import { Reveal, Stagger } from '@/motion';
import { Badge } from '@/components/Badge';
import type { SectionBaseProps } from '@/types';

/**
 * A year-in-review timeline — the milestones that defined the period, laid out
 * as a clean vertical sequence anchored to a navy spine. Each entry carries a
 * period label, a title, and a short body. Use to give the year a narrative
 * shape between the numbers and the outlook.
 */
export interface MilestonesProps extends SectionBaseProps {
  /** Small label above the heading. 1–4 words, no punctuation (e.g. "The year in review"). */
  eyebrow?: string | null;
  /** Section heading. 1 sentence, 3–9 words, no trailing period. */
  heading: string;
  /** Timeline entries in chronological order. 3–6 items. */
  milestones: {
    /** Period label for the entry. 1–3 words (e.g. "Q1", "March 2025"). */
    period: string;
    /** Milestone title. 1 short line, 3–8 words, no trailing period. */
    title: string;
    /** Milestone body. 1–2 sentences, 16–40 words. */
    body: string;
  }[];
  /** Layout variant. `timeline` is a single navy-spined column; `stepped` alternates entries left and right. */
  variant?: 'timeline' | 'stepped';
}

export function Milestones({
  id,
  eyebrow,
  heading,
  milestones,
  variant = 'timeline',
}: MilestonesProps) {
  const isStepped = variant === 'stepped';

  return (
    <section id={id ?? undefined} className="w-full bg-background">
      <div className="mx-auto w-full max-w-5xl px-6 py-24 md:px-12 md:py-32">
        <Reveal className="mb-16 max-w-2xl">
          {eyebrow ? <Badge variant="rule">{eyebrow}</Badge> : null}
          <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight tracking-tight text-balance md:text-5xl">
            {heading}
          </h2>
        </Reveal>

        <Stagger className="relative flex flex-col" step={0.1}>
          <span
            aria-hidden
            className="absolute top-2 bottom-2 left-[7px] w-px bg-border md:left-1/2 md:-translate-x-1/2"
          />
          {milestones.map((milestone, i) => {
            const right = isStepped && i % 2 === 1;
            return (
              <div
                key={milestone.title}
                className={
                  isStepped
                    ? 'relative grid pb-12 last:pb-0 md:grid-cols-2 md:gap-12'
                    : 'relative pb-12 pl-8 last:pb-0'
                }
              >
                <span
                  aria-hidden
                  className="absolute top-1.5 left-0 size-[15px] rounded-full border-2 border-primary bg-background md:left-1/2 md:-translate-x-1/2"
                />
                <div
                  className={
                    isStepped
                      ? right
                        ? 'md:col-start-2 md:pl-12'
                        : 'md:pr-12 md:text-right'
                      : ''
                  }
                >
                  <span className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-primary">
                    {milestone.period}
                  </span>
                  <h3 className="mt-2 font-serif text-2xl font-semibold tracking-tight md:text-3xl">
                    {milestone.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground text-pretty">
                    {milestone.body}
                  </p>
                </div>
              </div>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

export const MilestonesDemo: MilestonesProps = {
  eyebrow: 'The year in review',
  heading: 'Milestones that shaped the year',
  milestones: [
    {
      period: 'Q1',
      title: 'Acquired Lumen Grid',
      body: 'We closed our largest acquisition to date, adding grid-storage expertise and a foothold in three new European markets.',
    },
    {
      period: 'Q2',
      title: 'Crossed one million active sites',
      body: 'Our connected platform passed a million active sites, a milestone that reflects years of steady commercial discipline.',
    },
    {
      period: 'Q3',
      title: 'Opened the Rotterdam plant',
      body: 'A flagship facility came online ahead of schedule, expanding capacity and bringing two hundred skilled jobs to the region.',
    },
    {
      period: 'Q4',
      title: 'Raised the dividend',
      body: 'Reflecting confidence in durable cash flows, the board approved a tenth consecutive annual increase to the dividend.',
    },
  ],
  variant: 'timeline',
};

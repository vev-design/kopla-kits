import { Reveal, Stagger } from '@/motion';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import type { SectionBaseProps } from '@/types';

/**
 * Performance by business segment or region — a breakdown that turns the
 * consolidated numbers into a story of where the year's results came from. Each
 * entry pairs a name, a share/value figure, and a short blurb, with an inline
 * bar that visualizes its share of the whole. Use after the headline charts.
 */
export interface SegmentBreakdownProps extends SectionBaseProps {
  /** Small label above the heading. 1–4 words, no punctuation (e.g. "By segment"). */
  eyebrow?: string | null;
  /** Section heading. 1 sentence, 3–9 words, no trailing period. */
  heading: string;
  /** Supporting line under the heading. 1 sentence, 12–26 words. */
  body?: string | null;
  /** Business segments or regions. 3–5 items. */
  segments: {
    /** Segment or region name. 1–4 words (e.g. "Industrial Systems"). */
    name: string;
    /** Headline figure for the segment. Max 7 characters (e.g. "$1.8B", "43%"). */
    value: string;
    /** Share of the total, 0–100, used to size the inline bar. */
    share: number;
    /** Short description of the segment's year. 1 sentence, 12–28 words. */
    blurb: string;
  }[];
}

export function SegmentBreakdown({
  id,
  eyebrow,
  heading,
  body,
  segments,
}: SegmentBreakdownProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-secondary">
      <div className="mx-auto w-full max-w-6xl px-6 py-24 md:px-12 md:py-32">
        <Reveal className="mb-14 max-w-2xl">
          {eyebrow ? <Badge variant="rule">{eyebrow}</Badge> : null}
          <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight tracking-tight text-balance md:text-5xl">
            {heading}
          </h2>
          {body ? (
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
              {body}
            </p>
          ) : null}
        </Reveal>

        <Stagger className="flex flex-col gap-px overflow-hidden rounded-lg border border-border bg-border">
          {segments.map((segment) => (
            <Card
              key={segment.name}
              variant="panel"
              className="rounded-none border-0 bg-card md:grid md:grid-cols-[1fr_2fr_1.5fr] md:items-center md:gap-10"
            >
              <div className="flex flex-col gap-2">
                <span className="font-serif text-2xl font-semibold tracking-tight md:text-3xl">
                  {segment.name}
                </span>
                <span className="font-serif text-4xl font-semibold tabular-nums text-primary md:text-5xl">
                  {segment.value}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-2 md:mt-0">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-accent">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(0, Math.min(100, segment.share))}%` }}
                  />
                </div>
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {segment.share}% of total
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground text-pretty md:mt-0">
                {segment.blurb}
              </p>
            </Card>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export const SegmentBreakdownDemo: SegmentBreakdownProps = {
  eyebrow: 'By segment',
  heading: 'Where the growth came from',
  body: 'All three segments grew, led by recurring software and a resilient industrial base across our key regions.',
  segments: [
    {
      name: 'Industrial Systems',
      value: '$1.8B',
      share: 43,
      blurb: 'Our largest segment returned to double-digit growth as supply chains normalized and order backlogs cleared.',
    },
    {
      name: 'Software & Services',
      value: '$1.5B',
      share: 36,
      blurb: 'Recurring revenue now makes up the majority of this segment, lifting both margins and predictability.',
    },
    {
      name: 'Energy Solutions',
      value: '$0.9B',
      share: 21,
      blurb: 'A younger segment scaling quickly on demand for grid storage and efficiency retrofits across Europe.',
    },
  ],
};

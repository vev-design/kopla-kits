import { Button } from '@/components/ui/button';
import { Card } from '@/components/Card';
import { Stat } from '@/components/Stat';
import { MediaBlock, type ChartBlockProps } from '@/components/blocks';
import { Reveal, Stagger } from '@/motion';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

/**
 * The signature charts band — proof through data. A heading and supporting
 * copy with an optional disclaimer, a row of headline return figures, and one
 * or more framed chart cards (growth, returns by year, allocation). Use as the
 * evidence section after the capability grid. `variant` flips chart and copy.
 */
export interface PerformanceProps extends SectionBaseProps {
  /** Small label above the heading. 1–3 words, sentence case (e.g. "Performance"). */
  eyebrow?: string | null;
  /** Section heading. 1 sentence, 3–8 words, no trailing period. */
  heading: string;
  /** Supporting copy under the heading. 1–2 sentences, 18–40 words. */
  body?: string | null;
  /** Headline return figures shown beside the copy. 2–3 items. */
  stats?: {
    /** The figure. Number + optional unit, max 7 characters (e.g. "+11.4%", "8.2yr"). */
    value: string;
    /** What the figure measures. 1–4 words, sentence case (e.g. "Annualized return"). */
    label: string;
  }[];
  /** Optional CTA under the copy. Omit to drop it. */
  cta?: {
    /** Button label. 1–3 words, sentence case (e.g. "See methodology"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  } | null;
  /** Chart cards. 1–3 items, each an inline chart block with a title and caption. */
  charts: {
    /** Chart card title. 1–4 words, sentence case (e.g. "Portfolio growth"). */
    title: string;
    /** Chart card caption. 1 short phrase, max 10 words. */
    caption: string;
    /** The chart itself. Inline chart block literal (line for trend, bar for comparison; 4–8 points). */
    chart: ChartBlockProps;
  }[];
  /** Small-print disclaimer under the band. 1 sentence, max 24 words. */
  disclaimer?: string | null;
  /** Layout: chart cards on the right or on the left of the copy. */
  variant?: 'chart-right' | 'chart-left';
}

export function Performance({
  id,
  eyebrow,
  heading,
  body,
  stats,
  cta,
  charts,
  disclaimer,
  variant = 'chart-right',
}: PerformanceProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-secondary/40">
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal
            className={cn(
              'flex flex-col items-start gap-6',
              variant === 'chart-left' && 'lg:order-2',
            )}
          >
            {eyebrow ? (
              <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
              {heading}
            </h2>
            {body ? (
              <p className="max-w-xl text-lg text-muted-foreground text-pretty">
                {body}
              </p>
            ) : null}
            {stats && stats.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-10">
                {stats.map((stat) => (
                  <Stat
                    key={stat.label}
                    value={stat.value}
                    label={stat.label}
                    align="left"
                    size="md"
                  />
                ))}
              </div>
            ) : null}
            {cta ? (
              <Button asChild variant="outline" className="mt-2">
                <a href={cta.href}>{cta.label}</a>
              </Button>
            ) : null}
          </Reveal>
          <Stagger
            className={cn(
              'grid gap-6',
              charts.length > 1 ? 'sm:grid-cols-2 lg:grid-cols-1' : 'grid-cols-1',
              variant === 'chart-left' && 'lg:order-1',
            )}
          >
            {charts.map((item) => (
              <Card key={item.title} variant="panel" className="bg-card">
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.caption}</p>
                </div>
                <div className="h-48 w-full">
                  <MediaBlock media={item.chart} />
                </div>
              </Card>
            ))}
          </Stagger>
        </div>
        {disclaimer ? (
          <p className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
            {disclaimer}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export const PerformanceDemo: PerformanceProps = {
  eyebrow: 'Performance',
  heading: 'Returns you can watch compound',
  body: 'Our diversified growth portfolio has delivered steady, long-run returns through every market cycle, rebalancing automatically so you stay on course without lifting a finger.',
  stats: [
    { value: '+11.4%', label: 'Annualized return' },
    { value: '6yr', label: 'Track record' },
    { value: '0.15%', label: 'All-in fee' },
  ],
  cta: { label: 'See methodology', href: '#' },
  charts: [
    {
      title: 'Portfolio growth',
      caption: 'Growth of $10,000 invested',
      chart: {
        kind: 'chart',
        type: 'line',
        data: [
          { label: '2020', value: 100 },
          { label: '2021', value: 128 },
          { label: '2022', value: 121 },
          { label: '2023', value: 162 },
          { label: '2024', value: 205 },
          { label: '2025', value: 268 },
        ],
      },
    },
    {
      title: 'Returns by year',
      caption: 'Net annual return, percent',
      chart: {
        kind: 'chart',
        type: 'bar',
        data: [
          { label: '2021', value: 18 },
          { label: '2022', value: 6 },
          { label: '2023', value: 14 },
          { label: '2024', value: 17 },
          { label: '2025', value: 13 },
        ],
      },
    },
  ],
  disclaimer:
    'Past performance is not a guarantee of future results. Investing involves risk, including the possible loss of principal.',
  variant: 'chart-right',
};

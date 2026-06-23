import { Reveal } from '@/motion';
import { Badge } from '@/components/Badge';
import { MediaBlock, type ChartBlockProps } from '@/components/blocks';
import type { SectionBaseProps } from '@/types';

/**
 * A financial-charts beat — a heading and supporting copy paired with one or
 * two themed charts. The charts carry the section: revenue by year, a margin
 * trend, a cash-flow line. Use the chart block slot so each figure is a static,
 * token-themed SVG that re-skins with the system.
 */
export interface FinancialChartProps extends SectionBaseProps {
  /** Small label above the heading. 1–4 words, no punctuation (e.g. "Performance"). */
  eyebrow?: string | null;
  /** Section heading. 1 sentence, 3–9 words, no trailing period. */
  heading: string;
  /** Supporting paragraph under the heading. 2–3 sentences, 30–60 words. */
  body?: string | null;
  /** Primary chart. A bar chart for year-over-year comparison reads best here. */
  primaryChart: ChartBlockProps;
  /** Caption under the primary chart. 1 sentence, 6–16 words, names the unit (e.g. "Revenue in USD billions"). */
  primaryCaption: string;
  /** Optional secondary chart shown beside the primary (e.g. a margin or cash-flow line). */
  secondaryChart?: ChartBlockProps | null;
  /** Caption under the secondary chart. 1 sentence, 6–16 words, names the unit. */
  secondaryCaption?: string | null;
  /** Layout variant. `single` is one wide chart; `pair` shows primary and secondary side by side. */
  variant?: 'single' | 'pair';
}

function ChartFrame({
  chart,
  caption,
}: {
  chart: ChartBlockProps;
  caption: string;
}) {
  return (
    <figure className="flex flex-col gap-4">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-card">
        <MediaBlock media={chart} />
      </div>
      <figcaption className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

export function FinancialChart({
  id,
  eyebrow,
  heading,
  body,
  primaryChart,
  primaryCaption,
  secondaryChart,
  secondaryCaption,
  variant = 'pair',
}: FinancialChartProps) {
  const showSecondary = variant === 'pair' && secondaryChart && secondaryCaption;

  return (
    <section id={id ?? undefined} className="w-full bg-background">
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

        <Reveal>
          <div
            className={
              showSecondary ? 'grid gap-10 md:grid-cols-2' : 'mx-auto max-w-3xl'
            }
          >
            <ChartFrame chart={primaryChart} caption={primaryCaption} />
            {showSecondary ? (
              <ChartFrame chart={secondaryChart} caption={secondaryCaption} />
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export const FinancialChartDemo: FinancialChartProps = {
  eyebrow: 'Performance',
  heading: 'Revenue and margins moved together',
  body: 'Top-line growth held across the year while operating leverage widened margins. We continued to reinvest in the business without compromising the cash generation that funds our dividend.',
  primaryChart: {
    kind: 'chart',
    type: 'bar',
    data: [
      { label: '2021', value: 2.8 },
      { label: '2022', value: 3.1 },
      { label: '2023', value: 3.5 },
      { label: '2024', value: 3.8 },
      { label: '2025', value: 4.2 },
    ],
  },
  primaryCaption: 'Total revenue, in USD billions',
  secondaryChart: {
    kind: 'chart',
    type: 'line',
    data: [
      { label: '2021', value: 12 },
      { label: '2022', value: 13 },
      { label: '2023', value: 15 },
      { label: '2024', value: 16 },
      { label: '2025', value: 18 },
    ],
  },
  secondaryCaption: 'Operating margin, in percent',
  variant: 'pair',
};

import { Chart, type ChartDataSeries } from '@/components/Chart';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';
import { cn } from '@/lib/utils';
import { archetypeSlots } from './archetype-slots';

/**
 * One finding beside one chart. The chart is the adopted `Chart` primitive —
 * seven geometries over one series model — themed by the design system's
 * chart theme; the brand's device around the plot arrives through the
 * `chartFrame` slot (archetype-slots.tsx). `layout` decides the weight of the
 * beat: split, full-width, or compact for a run of several.
 */
export interface EvidenceChartProps extends SectionBaseProps {
  /** Section number and evidence category. 2–7 words, e.g. "02 · Revenue". */
  eyebrow?: string | null;
  /** The finding. 5–14 words, sentence case. */
  headline: string;
  /** What the data shows, with the figures. 2–3 sentences, 30–80 words. */
  body: string;
  /** The conclusion, anchored to the figures. 1–2 sentences, 15–60 words; omit for none. */
  takeaway?: string | null;
  /** Chart caption. 3–12 words. */
  chartTitle: string;
  /** Geometry; defaults to bar. */
  variant?: 'bar' | 'stacked-bar' | 'line' | 'pie' | 'donut' | 'scatter' | 'bubble';
  /** Named series from the source, 1–18 items; values are per-category observations or x/y points. */
  series: ChartDataSeries[];
  /** Category order from the source, 1–18 short labels. */
  categories?: string[] | null;
  /** Horizontal axis unit. 1–8 words; omit for none. */
  xLabel?: string | null;
  /** Vertical axis unit. 1–8 words; omit for none. */
  yLabel?: string | null;
  /** Source and qualifications under the chart. 1–4 sentences; omit for none. */
  footnote?: string | null;
  /** Weight of the beat; defaults to split. */
  layout?: 'split' | 'full' | 'compact';
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

export function EvidenceChart({
  id,
  eyebrow,
  headline,
  body,
  takeaway,
  chartTitle,
  variant = 'bar',
  series,
  categories,
  xLabel,
  yLabel,
  footnote,
  layout = 'split',
  background = 'default',
  spacing = 'default',
  hideEyebrow,
}: EvidenceChartProps) {
  const chart = (
    <Chart
      title={chartTitle}
      variant={variant}
      series={series}
      categories={categories ?? undefined}
      xLabel={xLabel ?? undefined}
      yLabel={yLabel ?? undefined}
      source={footnote ?? undefined}
      background={background === 'muted' ? 'muted' : 'default'}
      frame={archetypeSlots.chartFrame}
    />
  );
  const copy = (
    <Reveal>
      {!hideEyebrow && eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{eyebrow}</p>
      ) : null}
      <h2 className={cn('mt-4 font-bold leading-tight tracking-tight text-balance', layout === 'compact' ? 'text-2xl md:text-3xl' : 'text-3xl md:text-5xl')}>
        {headline}
      </h2>
      <p className={cn('mt-5 leading-relaxed', layout === 'compact' ? 'text-base' : 'text-lg')}>{body}</p>
      {takeaway ? (
        <p className="mt-6 border-t border-current/20 pt-5 text-lg font-semibold leading-snug">{takeaway}</p>
      ) : null}
    </Reveal>
  );
  return (
    <section id={id ?? undefined} className={cn('w-full', BACKGROUND[background as Background], SPACING[spacing as Spacing])}>
      <div
        className={cn(
          'mx-auto grid w-full max-w-6xl gap-10 px-6 md:px-10',
          layout === 'split' && 'lg:grid-cols-[2fr_3fr] lg:items-start lg:gap-16',
          layout === 'compact' && 'lg:grid-cols-[1fr_2fr] lg:items-start',
          layout === 'full' && 'grid-cols-1',
        )}
      >
        {copy}
        <Reveal delay={0.1} className={cn(layout === 'full' && 'max-w-5xl')}>
          {chart}
        </Reveal>
      </div>
    </section>
  );
}

export const EvidenceChartDemo: EvidenceChartProps = {
  id: 'segment-revenue',
  eyebrow: '02 · Scenario evidence · Revenue',
  headline: 'Enterprise contributes the largest revenue increase',
  body: 'Enterprise revenue rises from EUR 420,000 in Q1 2025 to EUR 960,000 in Q4 2026. Mid-market revenue moves from EUR 280,000 to EUR 465,000, while small-business revenue moves from EUR 160,000 to EUR 275,000.',
  takeaway: 'The first-to-last-quarter increases are EUR 540,000 for enterprise, EUR 185,000 for mid-market and EUR 115,000 for small business.',
  chartTitle: 'Quarterly revenue by customer segment',
  variant: 'stacked-bar',
  categories: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'],
  series: [
    { name: 'Enterprise', role: 'focus', values: [420000, 480000, 540000, 630000, 690000, 760000, 850000, 960000] },
    { name: 'Mid-market', role: 'context', values: [280000, 310000, 330000, 355000, 375000, 405000, 430000, 465000] },
    { name: 'Small business', role: 'other', values: [160000, 175000, 190000, 210000, 220000, 240000, 255000, 275000] },
  ],
  yLabel: 'Revenue (EUR)',
  footnote: 'Stacked values show quarterly revenue in whole euros across three customer segments. Fictional scenario data.',
  layout: 'split',
};

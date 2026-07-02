import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaBlock, type ImageBlockProps, type ChartBlockProps } from '@/components/blocks';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Above-the-fold split hero for a money product on a flat, product-like
 * ground. Left column: mono eyebrow, value headline, subhead, and primary +
 * secondary CTAs, all left-aligned. Right column: a data panel — an optional
 * mono label, headline figure, and delta chip above a chart or product image.
 * A thin ticker strip of label + value pairs closes the bottom edge. Use as
 * the first content section after the navbar.
 */
export interface HeroProps extends SectionBaseProps {
  /** Short mono label above the headline. 1–4 words, sentence case, no punctuation (e.g. "Investing, simplified"). */
  eyebrow?: string | null;
  /** Primary value statement. 1 sentence, 5–11 words, no trailing period. */
  headline: string;
  /** Supporting subhead under the headline. 1–2 sentences, 14–32 words. */
  subhead?: string | null;
  /** Primary call-to-action button (filled). */
  primaryCta: {
    /** Button label. 1–3 words, sentence case (e.g. "Open account"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  };
  /** Secondary call-to-action button (outline). Omit for a single-CTA hero. */
  secondaryCta?: {
    /** Button label. 1–3 words, sentence case (e.g. "See returns"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  } | null;
  /** Header of the data panel above the media. Omit to show the media alone. */
  panel?: {
    /** Small mono label for the figure. 1–3 words, sentence case (e.g. "Portfolio value"). */
    label: string;
    /** Headline figure in tabular mono. Number + unit, max 12 characters (e.g. "$128,940.12"). */
    value: string;
    /** Optional change chip beside the figure. Max 10 characters (e.g. "+12.4% YTD"). */
    delta?: string | null;
  } | null;
  /**
   * Media shown inside the data panel. A portfolio-growth chart (best as a
   * line, 4–8 points) or a product image. Inline block literal.
   */
  media: ImageBlockProps | ChartBlockProps;
  /** Ticker strip along the hero's bottom edge: label + value stat pairs in mono, separated by hairlines. 3–5 items. Omit to drop the strip. */
  ticker?:
    | {
        /** Stat label. 1–2 words, max 12 characters (e.g. "AUM", "Uptime"). */
        label: string;
        /** Stat value. Number + optional unit, max 8 characters (e.g. "$2.4B", "99.99%"). */
        value: string;
      }[]
    | null;
}

export function Hero({
  id,
  eyebrow,
  headline,
  subhead,
  primaryCta,
  secondaryCta,
  panel,
  media,
  ticker,
}: HeroProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pt-20 pb-16 md:grid-cols-2 md:pt-28 lg:gap-16">
        <Reveal className="flex flex-col items-start gap-6">
          {eyebrow ? (
            <p className="flex items-center gap-2.5 font-mono text-xs font-medium tracking-[0.18em] text-primary uppercase">
              <span aria-hidden className="size-1.5 rounded-[1px] bg-primary" />
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-4xl font-bold tracking-tight text-balance md:text-6xl">
            {headline}
          </h1>
          {subhead ? (
            <p className="max-w-xl text-lg text-muted-foreground text-pretty">
              {subhead}
            </p>
          ) : null}
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href={primaryCta.href}>
                {primaryCta.label}
                <ArrowRight />
              </a>
            </Button>
            {secondaryCta ? (
              <Button asChild size="lg" variant="outline">
                <a href={secondaryCta.href}>{secondaryCta.label}</a>
              </Button>
            ) : null}
          </div>
        </Reveal>
        <Reveal>
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {panel ? (
              <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                    {panel.label}
                  </span>
                  <span className="font-mono text-2xl font-semibold tracking-tight tabular-nums">
                    {panel.value}
                  </span>
                </div>
                {panel.delta ? (
                  <span className="rounded-md bg-accent px-2 py-1 font-mono text-xs font-medium tabular-nums text-accent-foreground">
                    {panel.delta}
                  </span>
                ) : null}
              </div>
            ) : null}
            <div className="aspect-[4/3] w-full sm:aspect-[16/10]">
              <MediaBlock media={media} />
            </div>
          </div>
        </Reveal>
      </div>
      {ticker && ticker.length > 0 ? (
        <div className="w-full border-t border-border">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="flex divide-x divide-border overflow-x-auto">
              {ticker.map((item) => (
                <div
                  key={item.label}
                  className="flex shrink-0 items-baseline gap-2.5 py-3 pr-6 pl-6 first:pl-0"
                >
                  <span className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                    {item.label}
                  </span>
                  <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export const HeroDemo: HeroProps = {
  eyebrow: 'Investing, simplified',
  headline: 'Grow your wealth with confidence',
  subhead:
    'Meridian puts diversified portfolios, automated investing, and bank-grade security in one account — so your money compounds while you get on with life.',
  primaryCta: { label: 'Open account', href: '#cta' },
  secondaryCta: { label: 'See returns', href: '#performance' },
  panel: {
    label: 'Portfolio value',
    value: '$128,940.12',
    delta: '+12.4% YTD',
  },
  media: {
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
  ticker: [
    { label: 'AUM', value: '$2.4B' },
    { label: 'Uptime', value: '99.99%' },
    { label: 'Clients', value: '1,200' },
    { label: 'All-in fee', value: '0.15%' },
  ],
};

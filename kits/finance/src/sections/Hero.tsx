import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/Badge';
import { MediaBlock, type ImageBlockProps, type ChartBlockProps } from '@/components/blocks';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Above-the-fold hero for a money product. A two-column band: value headline,
 * supporting subhead, and primary + secondary CTAs on the left, with a framed
 * media slot on the right that hosts a portfolio-growth chart or a product
 * image. Use as the first content section after the navbar.
 */
export interface HeroProps extends SectionBaseProps {
  /** Short label above the headline. 1–4 words, sentence case, no punctuation (e.g. "Investing, simplified"). */
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
  /**
   * Media shown in the framed column. A portfolio-growth chart (best as a line,
   * 4–8 points) or a product image. Inline block literal.
   */
  media: ImageBlockProps | ChartBlockProps;
}

export function Hero({
  id,
  eyebrow,
  headline,
  subhead,
  primaryCta,
  secondaryCta,
  media,
}: HeroProps) {
  return (
    <section
      id={id ?? undefined}
      className="w-full bg-gradient-to-b from-accent/40 to-background"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pt-20 pb-24 md:grid-cols-2 md:pt-28">
        <Reveal className="flex flex-col items-start gap-6">
          {eyebrow ? <Badge variant="soft">{eyebrow}</Badge> : null}
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
          <div className="aspect-square overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-primary/10 sm:aspect-[4/3]">
            <MediaBlock media={media} />
          </div>
        </Reveal>
      </div>
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
};

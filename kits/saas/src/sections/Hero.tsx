import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Above-the-fold hero that states the product's core promise. Leads with an
 * eyebrow, a large benefit headline, a supporting subhead, and primary +
 * secondary CTAs, with an optional product-screenshot image below. Use as the
 * first content section after the navbar.
 */
export interface HeroProps extends SectionBaseProps {
  /** Short label above the headline. 1–4 words, sentence case, no punctuation (e.g. "New in 2026"). */
  eyebrow?: string | null;
  /** Primary benefit statement. 1 sentence, 5–11 words, no trailing period. */
  headline: string;
  /** Supporting subhead under the headline. 1–2 sentences, 14–32 words. */
  subhead?: string | null;
  /** Primary call-to-action button (filled). */
  primaryCta: {
    /** Button label. 1–3 words, sentence case (e.g. "Start free trial"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  };
  /** Secondary call-to-action button (outline). Omit for a single-CTA hero. */
  secondaryCta?: {
    /** Button label. 1–3 words, sentence case (e.g. "Book a demo"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  } | null;
  /**
   * Optional product-screenshot image shown below the copy. Wide aspect (≈16:9).
   * @kind image
   */
  image?: string | null;
}

export function Hero({
  id,
  eyebrow,
  headline,
  subhead,
  primaryCta,
  secondaryCta,
  image,
}: HeroProps) {
  return (
    <section
      id={id ?? undefined}
      className="w-full bg-gradient-to-b from-accent/40 to-background"
    >
      <div className="mx-auto w-full max-w-5xl px-6 pt-24 pb-16 text-center md:pt-32">
        <Reveal className="flex flex-col items-center gap-6">
          {eyebrow ? (
            <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium tracking-wide text-accent-foreground">
              {eyebrow}
            </span>
          ) : null}
          <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-balance md:text-6xl">
            {headline}
          </h1>
          {subhead ? (
            <p className="max-w-2xl text-lg text-muted-foreground text-pretty md:text-xl">
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
      </div>
      {image ? (
        <div className="mx-auto w-full max-w-6xl px-6 pb-24">
          <Reveal>
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-primary/10">
              <img
                src={image}
                alt=""
                className="aspect-video w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      ) : null}
    </section>
  );
}

export const HeroDemo: HeroProps = {
  eyebrow: 'New in 2026',
  headline: 'Ship product insights, not data exports',
  subhead:
    'Northbeam unifies your product, billing, and support data into one workspace so every team makes decisions from the same numbers.',
  primaryCta: { label: 'Start free trial', href: '#cta' },
  secondaryCta: { label: 'Book a demo', href: '#' },
  image:
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80',
};

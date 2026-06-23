import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/Badge';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Above-the-fold hero for an AI product. A faint grid and an iris glow sit
 * behind a monospace eyebrow chip, a large benefit headline, a supporting
 * subhead, and primary + secondary CTAs, with an optional product-screenshot
 * image framed by a gradient edge. Use as the first content section after the
 * navbar.
 */
export interface HeroProps extends SectionBaseProps {
  /** Short monospace label above the headline. 1–4 words, no punctuation (e.g. "Now with GPT-class agents"). */
  eyebrow?: string | null;
  /** Primary benefit statement. 1 sentence, 5–11 words, no trailing period. */
  headline: string;
  /** Supporting subhead under the headline. 1–2 sentences, 14–32 words. */
  subhead?: string | null;
  /** Primary call-to-action button (filled white). */
  primaryCta: {
    /** Button label. 1–3 words, sentence case (e.g. "Start building"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  };
  /** Secondary call-to-action button (outline). Omit for a single-CTA hero. */
  secondaryCta?: {
    /** Button label. 1–3 words, sentence case (e.g. "Read the docs"). */
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
    <section id={id ?? undefined} className="relative w-full overflow-hidden bg-background">
      {/* Faint grid, masked to fade at the edges. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
      />
      {/* Iris glow behind the headline. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[36rem] w-[56rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(closest-side,var(--chart-1),transparent)] opacity-25 blur-3xl"
      />
      <div className="relative mx-auto w-full max-w-5xl px-6 pt-28 pb-16 text-center md:pt-36">
        <Reveal className="flex flex-col items-center gap-6">
          {eyebrow ? <Badge variant="accent">{eyebrow}</Badge> : null}
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-balance md:text-7xl">
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
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-24">
          <Reveal>
            <div className="rounded-2xl bg-gradient-to-b from-ring/40 to-border p-px shadow-[0_0_80px_-20px_var(--ring)]">
              <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
                <img
                  src={image}
                  alt=""
                  className="aspect-video w-full object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>
      ) : null}
    </section>
  );
}

export const HeroDemo: HeroProps = {
  eyebrow: 'Now with autonomous agents',
  headline: 'Build, deploy, and scale AI products',
  subhead:
    'Forge gives engineering teams one platform for inference, agents, and evals — from prototype to production traffic without rewriting a line.',
  primaryCta: { label: 'Start building', href: '#cta' },
  secondaryCta: { label: 'Read the docs', href: '#' },
  image:
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1600&q=80',
};

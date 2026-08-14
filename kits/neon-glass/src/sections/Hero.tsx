import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/Badge';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Full-bleed opening statement: deep-violet and electric-blue ambient glow
 * blooms behind a frosted glass panel, and the headline itself sweeps font
 * weight from hairline to bold as it crosses the viewport — the kinetic
 * typography that stands in for imagery. The weight sweep is pure CSS
 * (`animation-timeline: view()`), so the section ships with no JavaScript.
 * Use as the first content section after the navbar.
 */
export interface HeroProps extends SectionBaseProps {
  /** Short label above the headline. 1–4 words, no punctuation (e.g. "Now in beta"). */
  eyebrow?: string | null;
  /** Primary statement. 1 sentence, 4–9 words, no trailing period. Renders large with a kinetic weight sweep on scroll. */
  headline: string;
  /** Supporting subhead under the headline. 1–2 sentences, 14–32 words. */
  subhead?: string | null;
  /** Primary call-to-action button (filled hot-pink). */
  primaryCta: {
    /** Button label. 1–3 words, sentence case (e.g. "Get early access"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  };
  /** Secondary call-to-action button (outline). Omit for a single-CTA hero. */
  secondaryCta?: {
    /** Button label. 1–3 words, sentence case (e.g. "Watch the film"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  } | null;
}

export function Hero({ id, eyebrow, headline, subhead, primaryCta, secondaryCta }: HeroProps) {
  return (
    <section id={id ?? undefined} className="relative w-full overflow-hidden bg-background">
      {/* Ambient gradient blooms — violet, blue, and pink — the trend's
          signature glow, blurred heavily so they read as atmosphere. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 -top-1/3 h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(closest-side,var(--chart-1),transparent)] opacity-60 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-1/4 top-0 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(closest-side,var(--chart-2),transparent)] opacity-40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-12rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,var(--chart-3),transparent)] opacity-30 blur-3xl"
      />
      <div className="relative mx-auto w-full max-w-5xl px-6 pt-28 pb-24 md:pt-36">
        <Reveal>
          <div className="flex flex-col items-start gap-7 rounded-2xl border border-border bg-card/70 p-8 backdrop-blur-2xl md:p-12">
            {eyebrow ? <Badge variant="glass">{eyebrow}</Badge> : null}
            <h1 className="kinetic-weight max-w-3xl font-[family-name:var(--font-display)] text-5xl leading-[1.02] tracking-tight text-balance md:text-7xl">
              {headline}
            </h1>
            {subhead ? (
              <p className="max-w-xl text-lg text-muted-foreground text-pretty md:text-xl">
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
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export const HeroDemo: HeroProps = {
  eyebrow: 'Now in beta',
  headline: 'Design that glows back at you',
  subhead:
    'Aurel turns every screen into a lit surface — layered glass, living gradients, and type that moves the moment you scroll past it.',
  primaryCta: { label: 'Get early access', href: '#cta' },
  secondaryCta: { label: 'Watch the film', href: '#showcase' },
};

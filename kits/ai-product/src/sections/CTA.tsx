import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Closing call-to-action band — a gradient-edged card on the near-black canvas
 * with a faint grid, an iris glow, a single focused message, and the page's
 * primary button. The final conversion push; place just before the footer.
 */
export interface CTAProps extends SectionBaseProps {
  /** Headline restating the offer. 1 sentence, 4–9 words, no trailing period. */
  headline: string;
  /** Supporting line under the headline. 1 sentence, 10–22 words. */
  body?: string | null;
  /** Primary action button (the page's main conversion). */
  primaryCta: {
    /** Button label. 1–3 words, sentence case (e.g. "Start building"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  };
  /** Optional secondary action button. Omit for a single-CTA band. */
  secondaryCta?: {
    /** Button label. 1–3 words, sentence case (e.g. "Talk to sales"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  } | null;
}

export function CTA({ id, headline, body, primaryCta, secondaryCta }: CTAProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
            {/* Faint grid. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
            />
            {/* Iris glow. */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-full h-[28rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,var(--chart-1),transparent)] opacity-30 blur-3xl"
            />
            <div className="relative flex flex-col items-center gap-6 px-6 py-16 text-center md:py-20">
              <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance md:text-4xl">
                {headline}
              </h2>
              {body ? (
                <p className="max-w-xl text-lg text-muted-foreground text-pretty">
                  {body}
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
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export const CTADemo: CTAProps = {
  headline: 'Ship your first AI feature today',
  body: 'Create a workspace and make your first inference call in under five minutes. No credit card, no GPU setup.',
  primaryCta: { label: 'Start building', href: '#' },
  secondaryCta: { label: 'Talk to sales', href: '#' },
};

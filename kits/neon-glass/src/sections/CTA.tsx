import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Closing call-to-action: a full-bleed glass card lit by the brightest glow
 * in the system, restating the offer with nothing left to distract from the
 * button. The final push; place just before the footer.
 */
export interface CTAProps extends SectionBaseProps {
  /** Headline restating the offer. 1 sentence, 4–9 words, no trailing period. */
  headline: string;
  /** Supporting line under the headline. 1 sentence, 10–22 words. */
  body?: string | null;
  /** Primary action button (the page's main conversion). */
  primaryCta: {
    /** Button label. 1–3 words, sentence case (e.g. "Get early access"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  };
  /** Optional secondary action button. Omit for a single-CTA band. */
  secondaryCta?: {
    /** Button label. 1–3 words, sentence case (e.g. "Talk to us"). */
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
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card/70 backdrop-blur-2xl">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,var(--chart-3),transparent)] opacity-40 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-1/4 bottom-0 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(closest-side,var(--chart-2),transparent)] opacity-30 blur-3xl"
            />
            <div className="relative flex flex-col items-center gap-6 px-6 py-16 text-center md:py-20">
              <h2 className="max-w-2xl font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-balance md:text-4xl">
                {headline}
              </h2>
              {body ? (
                <p className="max-w-xl text-lg text-muted-foreground text-pretty">{body}</p>
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
  headline: 'Your next launch deserves to glow',
  body: 'Spin up a workspace and ship your first lit-up scene in an afternoon — no design system to build from scratch.',
  primaryCta: { label: 'Get early access', href: '#' },
  secondaryCta: { label: 'Talk to us', href: '#' },
};

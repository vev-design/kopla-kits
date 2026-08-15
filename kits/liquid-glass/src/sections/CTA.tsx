import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Closing call-to-action band: a tinted glass panel over an intensified
 * version of the canvas glow, so the final message reads as the brightest,
 * most saturated moment on the page. The final conversion push — keep it
 * distraction-free. Place just before the footer.
 */
export interface CTAProps extends SectionBaseProps {
  /** Headline restating the offer. 1 sentence, 4–9 words, no trailing period. */
  headline: string;
  /** Supporting line under the headline. 1 sentence, 10–22 words. */
  body?: string | null;
  /** Primary action button (the page's main conversion). */
  primaryCta: {
    /** Button label. 1–3 words, sentence case (e.g. "Start free trial"). */
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
    <section id={id ?? undefined} className="relative w-full">
      {/* Intensified glow, local to this section only — the brightest point
          on the page, so the closing panel reads as a climax. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[56rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,var(--chart-1),transparent)] opacity-40 blur-3xl"
      />
      <div className="relative mx-auto w-full max-w-5xl px-6 py-24">
        <Reveal>
          <GlassCard variant="tinted" className="items-center gap-6 px-6 py-16 text-center md:py-20">
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance md:text-4xl">
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
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}

export const CTADemo: CTAProps = {
  headline: 'Give your product a surface worth touching',
  body: 'Spin up your first glass surface in under five minutes. No credit card, no design system rewrite required.',
  primaryCta: { label: 'Start free trial', href: '#' },
  secondaryCta: { label: 'Talk to sales', href: '#' },
};

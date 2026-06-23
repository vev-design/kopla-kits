import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Closing call-to-action band that invites the visitor to open an account. A
 * single focused message and button on the emerald primary surface — keep it
 * distraction-free. Place just before the footer.
 */
export interface CTAProps extends SectionBaseProps {
  /** Headline restating the offer. 1 sentence, 4–9 words, no trailing period. */
  headline: string;
  /** Supporting line under the headline. 1 sentence, 10–22 words. */
  body?: string | null;
  /** Reassurance note under the buttons. 1 short phrase, max 10 words (e.g. "No minimums. Cancel anytime."). */
  note?: string | null;
  /** Primary action button (the page's main conversion). */
  primaryCta: {
    /** Button label. 1–3 words, sentence case (e.g. "Open account"). */
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

export function CTA({ id, headline, body, note, primaryCta, secondaryCta }: CTAProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <Reveal>
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-primary px-6 py-16 text-center text-primary-foreground md:py-20">
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance md:text-4xl">
              {headline}
            </h2>
            {body ? (
              <p className="max-w-xl text-lg text-primary-foreground/80 text-pretty">
                {body}
              </p>
            ) : null}
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="secondary">
                <a href={primaryCta.href}>
                  {primaryCta.label}
                  <ArrowRight />
                </a>
              </Button>
              {secondaryCta ? (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <a href={secondaryCta.href}>{secondaryCta.label}</a>
                </Button>
              ) : null}
            </div>
            {note ? (
              <p className="text-sm text-primary-foreground/70">{note}</p>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export const CTADemo: CTAProps = {
  headline: 'Start building wealth today',
  body: 'Open an account in minutes and put your first deposit to work automatically — no paperwork, no minimums.',
  note: 'No account minimums. Cancel anytime.',
  primaryCta: { label: 'Open account', href: '#' },
  secondaryCta: { label: 'Talk to us', href: '#' },
};

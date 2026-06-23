import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * A soft closing call-to-action inviting the visitor to begin. A single warm
 * message and button on a rounded sage panel, kept gentle and distraction-free.
 * Place just before the footer.
 */
export interface CTAProps extends SectionBaseProps {
  /** Headline inviting the first visit. 1 sentence, 4–9 words, no trailing period. */
  headline: string;
  /** Supporting line under the headline. 1 sentence, 10–24 words. */
  body?: string | null;
  /** Primary action button (the studio's main invitation). */
  primaryCta: {
    /** Button label. 1–3 words, sentence case (e.g. "Book a class"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  };
  /** Optional secondary action button. Omit for a single-CTA band. */
  secondaryCta?: {
    /** Button label. 1–3 words, sentence case (e.g. "Get in touch"). */
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
          <div className="flex flex-col items-center gap-6 rounded-xl bg-primary px-6 py-20 text-center text-primary-foreground">
            <h2 className="max-w-2xl font-serif text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              {headline}
            </h2>
            {body ? (
              <p className="max-w-xl text-lg text-primary-foreground/80 text-pretty">
                {body}
              </p>
            ) : null}
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-full px-7"
              >
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
                  className="rounded-full border-primary-foreground/30 bg-transparent px-7 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
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

export const CTADemo: CTAProps = {
  headline: 'Your first class is on us',
  body: 'Come as you are. Reserve a complimentary first session and feel what a slower hour can do.',
  primaryCta: { label: 'Book a class', href: '#' },
  secondaryCta: { label: 'Get in touch', href: '#footer' },
};

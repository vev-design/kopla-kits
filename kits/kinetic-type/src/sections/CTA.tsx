import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Closing call-to-action band — a giant black-weight headline on the ink
 * canvas with one or two buttons and nothing else to distract from them.
 * The final beat before the footer.
 */
export interface CTAProps extends SectionBaseProps {
  /** Closing headline. 1 sentence, 4–9 words, no trailing period. */
  headline: string;
  /** Supporting line under the headline. 1 sentence, 10–22 words. */
  body?: string | null;
  /** Primary action button. */
  primaryCta: {
    /** Button label. 1–3 words, sentence case (e.g. "Start a drop"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  };
  /** Optional secondary action button. Omit for a single-CTA band. */
  secondaryCta?: {
    /** Button label. 1–3 words, sentence case (e.g. "Book a call"). */
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
    <section id={id ?? undefined} className="w-full bg-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-6 py-24 md:py-32">
        <Reveal className="flex max-w-3xl flex-col gap-6">
          <h2
            className="text-6xl leading-none tracking-tight text-background text-balance md:text-7xl"
            style={{ fontVariationSettings: "'wght' 800" }}
          >
            {headline}
          </h2>
          {body ? (
            <p className="max-w-xl text-lg text-background/70 text-pretty">{body}</p>
          ) : null}
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
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
                className="border-background/30 bg-transparent text-background hover:bg-background/10"
              >
                <a href={secondaryCta.href}>{secondaryCta.label}</a>
              </Button>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export const CTADemo: CTAProps = {
  headline: 'Ready to let type carry the page',
  body: 'Bring your copy — we bring the weight, the scroll, and the rhythm that makes it move.',
  primaryCta: { label: 'Start a drop', href: '#' },
  secondaryCta: { label: 'Book a call', href: '#' },
};

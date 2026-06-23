import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/Badge';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Calm, spacious hero for the studio. An optional eyebrow chip, a soft serif
 * headline, a gentle supporting line, and a primary CTA sit beside a serene
 * rounded image. Generous whitespace and unhurried pacing set the tone. Use as
 * the first content section after the navbar.
 */
export interface HeroProps extends SectionBaseProps {
  /** Short label above the headline. 1–4 words, sentence case, no punctuation (e.g. "A place to breathe"). */
  eyebrow?: string | null;
  /** Calm headline statement. 1 sentence, 4–9 words, no trailing period. */
  headline: string;
  /** Supporting line under the headline. 1–2 sentences, 16–34 words. */
  subhead?: string | null;
  /** Primary call-to-action button. */
  primaryCta: {
    /** Button label. 1–3 words, sentence case (e.g. "Book a class"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  };
  /** Secondary call-to-action button (quiet ghost). Omit for a single-CTA hero. */
  secondaryCta?: {
    /** Button label. 1–3 words, sentence case (e.g. "View schedule"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  } | null;
  /**
   * Serene hero image (portrait or square; yoga, spa, or nature).
   * @kind image
   */
  image: string;
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
    <section id={id ?? undefined} className="w-full bg-background">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <Reveal className="flex flex-col items-start gap-6">
          {eyebrow ? <Badge variant="soft">{eyebrow}</Badge> : null}
          <h1 className="font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-balance md:text-6xl">
            {headline}
          </h1>
          {subhead ? (
            <p className="max-w-md text-lg text-muted-foreground text-pretty">
              {subhead}
            </p>
          ) : null}
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full px-7">
              <a href={primaryCta.href}>
                {primaryCta.label}
                <ArrowRight />
              </a>
            </Button>
            {secondaryCta ? (
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="rounded-full px-7"
              >
                <a href={secondaryCta.href}>{secondaryCta.label}</a>
              </Button>
            ) : null}
          </div>
        </Reveal>
        <Reveal>
          <div className="overflow-hidden rounded-xl">
            <img
              src={image}
              alt=""
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export const HeroDemo: HeroProps = {
  eyebrow: 'A place to breathe',
  headline: 'Find your calm, one breath at a time',
  subhead:
    'A sunlit neighborhood studio for yoga, breathwork, and stillness. Move gently, rest deeply, and leave a little lighter than you arrived.',
  primaryCta: { label: 'Book a class', href: '#cta' },
  secondaryCta: { label: 'View schedule', href: '#schedule' },
  image:
    'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
};

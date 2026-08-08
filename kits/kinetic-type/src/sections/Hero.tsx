import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/Badge';
import type { SectionBaseProps } from '@/types';

/**
 * The signature, viewport-filling hero. The headline is genuinely
 * scroll-scrubbed — as the section moves through the viewport, its font
 * weight sweeps roughly 100 → 900 and its scale eases 0.85 → 1, driven by
 * live scroll progress (not a one-shot reveal). This is the whole point of
 * the system: type doing the work imagery normally does. Always the first
 * content section after the navbar.
 *
 * @hydrate
 */
export interface HeroProps extends SectionBaseProps {
  /** Short monospace label above the headline. 1–4 words, no punctuation (e.g. "Fall drop 03"). */
  eyebrow?: string | null;
  /** The headline that scrubs weight and scale on scroll. 1 sentence, 4–9 words, no trailing period. */
  headline: string;
  /** Supporting line under the headline. 1–2 sentences, 12–28 words. */
  subhead?: string | null;
  /** Primary call-to-action button. */
  primaryCta: {
    /** Button label. 1–3 words, sentence case (e.g. "Enter the drop"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  };
  /** Secondary call-to-action button. Omit for a single-CTA hero. */
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
  const ref = useRef<HTMLElement>(null);
  // Progress 0 as the section enters from the bottom of the viewport, 1 as
  // it exits the top — spans the whole time it's in view, so the weight/
  // scale sweep tracks the entire scroll-through, not just the entrance.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const weight = useTransform(scrollYProgress, [0, 1], [100, 900]);
  const fontVariationSettings = useTransform(weight, (w) => `'wght' ${w}`);
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);

  return (
    <section
      id={id ?? undefined}
      ref={ref}
      className="flex min-h-screen w-full flex-col justify-center bg-background"
    >
      <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-10 px-6 py-24">
        {eyebrow ? (
          <Badge variant="accent" className="w-fit">
            {eyebrow}
          </Badge>
        ) : null}
        <motion.h1
          style={{ fontVariationSettings, scale }}
          className="origin-left text-[12vw] leading-none tracking-tight text-balance"
        >
          {headline}
        </motion.h1>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          {subhead ? (
            <p className="max-w-xl text-lg text-muted-foreground text-pretty md:text-xl">
              {subhead}
            </p>
          ) : (
            <span />
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
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
    </section>
  );
}

export const HeroDemo: HeroProps = {
  eyebrow: 'Fall drop 03',
  headline: 'Type is the whole interface now',
  subhead:
    'Surge builds pages that move the way type moves — no photography, no filler, just weight, scale, and rhythm carrying the message.',
  primaryCta: { label: 'Enter the drop', href: '#cta' },
  secondaryCta: { label: 'See the work', href: '#work' },
};

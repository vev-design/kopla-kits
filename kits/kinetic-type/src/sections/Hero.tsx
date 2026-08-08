import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/Badge';
import type { SectionBaseProps } from '@/types';

/**
 * The signature, pinned hero. The section is a tall scroll track (2.4
 * viewports) with the actual stage held with `position: sticky` at its top,
 * so the headline stays in place while the scroll-through happens: its font
 * weight sweeps 100 → 900, its scale eases up, its tracking cinches tight,
 * and a live monospace scroll-progress counter ticks in the corner — all
 * driven by real scroll position, not a one-shot reveal. The eyebrow,
 * subhead, and CTAs hold back and only resolve into place in the final
 * stretch, so the pin reads as a build-up rather than everything happening
 * at once. This is the whole point of the system: type doing the work
 * imagery normally does. Always the first content section after the navbar.
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
  const trackRef = useRef<HTMLElement>(null);
  // Progress 0 at the top of the tall track, 1 at its end — the sticky
  // stage below stays pinned on screen for the whole span, so this is the
  // scroll-through progress of the PIN, not just the entrance/exit.
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });

  const weight = useTransform(scrollYProgress, [0, 1], [100, 900]);
  const fontVariationSettings = useTransform(weight, (w) => `'wght' ${w}`);
  const scale = useTransform(scrollYProgress, [0, 1], [0.82, 1]);
  const tracking = useTransform(scrollYProgress, [0, 1], [0.01, -0.03]);
  const letterSpacing = useTransform(tracking, (v) => `${v}em`);

  // The furniture (eyebrow/subhead/CTAs) holds back and resolves in the
  // final third of the pin, so the headline's transformation reads as the
  // main event rather than competing with everything else at once.
  const furnitureOpacity = useTransform(scrollYProgress, [0.6, 0.9], [0, 1]);
  const furnitureY = useTransform(scrollYProgress, [0.6, 0.9], [24, 0]);

  const progressLabel = useTransform(scrollYProgress, (v) => `${String(Math.round(v * 100)).padStart(3, '0')}%`);

  return (
    <section id={id ?? undefined} ref={trackRef} className="relative w-full" style={{ height: '240vh' }}>
      <div className="sticky top-0 flex h-screen w-full flex-col justify-center overflow-hidden bg-background">
        <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-10 px-6 py-24">
          <motion.div style={{ opacity: furnitureOpacity, y: furnitureY }}>
            {eyebrow ? (
              <Badge variant="accent" className="w-fit">
                {eyebrow}
              </Badge>
            ) : null}
          </motion.div>
          <motion.h1
            style={{ fontVariationSettings, scale, letterSpacing }}
            className="origin-left text-[12vw] leading-none text-balance"
          >
            {headline}
          </motion.h1>
          <motion.div
            style={{ opacity: furnitureOpacity, y: furnitureY }}
            className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          >
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
          </motion.div>
        </div>
        {/* Live scroll-progress readout — a typographic detail standing in
            for a progress bar, on brand for a system where numerals do the
            work other systems give to chrome. */}
        <motion.span
          aria-hidden
          className="absolute right-6 bottom-6 font-mono text-xs tracking-[0.14em] text-muted-foreground tabular-nums"
        >
          {progressLabel}
        </motion.span>
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

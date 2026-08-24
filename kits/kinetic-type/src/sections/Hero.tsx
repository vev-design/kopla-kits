import { useEffect, useRef } from 'react';
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

function mapClamp(v: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const t = Math.min(1, Math.max(0, (v - inMin) / (inMax - inMin)));
  return outMin + t * (outMax - outMin);
}

export function Hero({ id, eyebrow, headline, subhead, primaryCta, secondaryCta }: HeroProps) {
  const trackRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const furnitureTopRef = useRef<HTMLDivElement>(null);
  const furnitureBottomRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  // One rAF-throttled scroll handler drives the whole pin by writing
  // styles directly — no animation library. Progress is 0 at the top of
  // the tall track, 1 at its end; the sticky stage stays pinned on screen
  // for the whole span, so this is the scroll-through progress of the
  // PIN, not just the entrance/exit. The furniture (eyebrow/subhead/CTAs)
  // holds back and resolves in the final third, so the headline's
  // transformation reads as the main event.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const rect = track.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 1;
      const head = headlineRef.current;
      if (head) {
        head.style.fontVariationSettings = `'wght' ${100 + 800 * p}`;
        head.style.scale = String(0.82 + 0.18 * p);
        head.style.letterSpacing = `${0.01 - 0.04 * p}em`;
      }
      const opacity = mapClamp(p, 0.6, 0.9, 0, 1);
      const rise = mapClamp(p, 0.6, 0.9, 24, 0);
      for (const el of [furnitureTopRef.current, furnitureBottomRef.current]) {
        if (!el) continue;
        el.style.opacity = String(opacity);
        el.style.translate = `0 ${rise}px`;
      }
      if (counterRef.current) {
        counterRef.current.textContent = `${String(Math.round(p * 100)).padStart(3, '0')}%`;
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id={id ?? undefined} ref={trackRef} className="relative w-full" style={{ height: '240vh' }}>
      <div className="sticky top-0 flex h-screen w-full flex-col justify-center overflow-clip bg-background">
        <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-10 px-6 py-24">
          <div ref={furnitureTopRef} style={{ opacity: 0, translate: '0 24px' }}>
            {eyebrow ? (
              <Badge variant="accent" className="w-fit">
                {eyebrow}
              </Badge>
            ) : null}
          </div>
          <h1
            ref={headlineRef}
            // SSR/pre-hydration state matches progress 0, so the pin's
            // opening frame is right before the scroll handler attaches.
            style={{ fontVariationSettings: "'wght' 100", scale: '0.82', letterSpacing: '0.01em' }}
            // clamp(), not a bare vw value — 12vw alone keeps scaling past
            // the 90rem content column on ultrawide monitors (12vw of a
            // 3440px display is ~410px, several times wider than the line
            // it has to wrap inside), so the max bound ties the ceiling to
            // the column width instead of the raw viewport.
            className="origin-left text-[clamp(2.75rem,12vw,9rem)] leading-none text-balance"
          >
            {headline}
          </h1>
          <div
            ref={furnitureBottomRef}
            style={{ opacity: 0, translate: '0 24px' }}
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
          </div>
        </div>
        {/* Live scroll-progress readout — a typographic detail standing in
            for a progress bar, on brand for a system where numerals do the
            work other systems give to chrome. */}
        <span
          ref={counterRef}
          aria-hidden
          className="absolute right-6 bottom-6 font-mono text-xs tracking-[0.14em] text-muted-foreground tabular-nums"
        >
          000%
        </span>
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

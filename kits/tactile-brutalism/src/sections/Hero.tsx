import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Full-bleed opening statement: a mono stamp above a viewport-scaled headline
 * that stretches edge-to-edge, a short subhead, and one or two hard-edged
 * CTAs — over a faint hairline grid instead of a photograph. Use as the
 * first content section after the navbar; this is the system's loudest beat.
 */
export interface HeroProps extends SectionBaseProps {
  /** Small mono stamp above the headline. 1–4 words, no punctuation (e.g. "Est. 2019"). */
  eyebrow?: string | null;
  /** Primary statement. 1 short sentence or fragment, 3–8 words, no trailing period — reads best in all caps. */
  headline: string;
  /** Supporting line under the headline. 1–2 sentences, 14–30 words. */
  subhead?: string | null;
  /** Primary call-to-action button (solid acid-lime). */
  primaryCta: {
    /** Button label. 1–3 words, sentence case (e.g. "See the work"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  };
  /** Secondary call-to-action button (outline). Omit for a single-CTA hero. */
  secondaryCta?: {
    /** Button label. 1–3 words, sentence case (e.g. "Our process"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  } | null;
}

export function Hero({ id, eyebrow, headline, subhead, primaryCta, secondaryCta }: HeroProps) {
  return (
    <section
      id={id ?? undefined}
      className="relative w-full overflow-hidden border-b border-border bg-background"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:88px_88px] opacity-40"
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-6 py-24 md:py-32">
        <Reveal className="flex flex-col items-start gap-8">
          {eyebrow ? <Badge variant="solid">{eyebrow}</Badge> : null}
          <h1 className="max-w-5xl text-[clamp(2.75rem,9vw,7.5rem)] leading-[0.92] font-black tracking-tight text-balance uppercase">
            {headline}
          </h1>
          {subhead ? (
            <p className="max-w-xl text-lg text-muted-foreground text-pretty md:text-xl">
              {subhead}
            </p>
          ) : null}
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href={primaryCta.href}>{primaryCta.label}</a>
            </Button>
            {secondaryCta ? (
              <Button asChild size="lg" variant="outline">
                <a href={secondaryCta.href}>{secondaryCta.label}</a>
              </Button>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export const HeroDemo: HeroProps = {
  eyebrow: 'Est. 2019',
  headline: 'Built raw. Built right.',
  subhead:
    'Monolith is an engineering studio for physical products — we take a rough sketch through prototyping, tooling, and production without softening a single edge.',
  primaryCta: { label: 'See the work', href: '#work' },
  secondaryCta: { label: 'Our process', href: '#stat' },
};

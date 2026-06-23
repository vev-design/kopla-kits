import { Button } from '@/components/ui/button';
import { Divider } from '@/components/Divider';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Full-bleed atmospheric hero: a dark food image under a warm overlay, the
 * restaurant name in serif display, a tagline, a cuisine/location line, and a
 * reserve CTA. Tall and candle-lit — the opening mood of the page. Use as the
 * first content section after the navbar.
 */
export interface HeroProps extends SectionBaseProps {
  /** Cuisine and location line above the name. 2–5 words, title case (e.g. "French · Portland"). */
  overline?: string | null;
  /** Restaurant name. 1–3 words, no trailing period (e.g. "Maison Laurent"). */
  name: string;
  /** Tagline under the name. 1 sentence, 6–16 words, no trailing period. */
  tagline?: string | null;
  /** Reserve call-to-action button. */
  cta: {
    /** Button label. 1–3 words, sentence case (e.g. "Reserve a table"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  };
  /**
   * Full-bleed background image — a moody dish or dining-room shot. Portrait or wide.
   * @kind image
   */
  image: string;
}

export function Hero({ id, overline, name, tagline, cta, image }: HeroProps) {
  return (
    <section
      id={id ?? undefined}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden"
    >
      <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/55 to-background" />
      <Reveal className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-32 text-center">
        {overline ? (
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-primary">
            {overline}
          </p>
        ) : null}
        <h1 className="font-serif text-6xl font-medium tracking-tight text-balance md:text-8xl">
          {name}
        </h1>
        <Divider />
        {tagline ? (
          <p className="max-w-xl text-lg text-muted-foreground text-pretty md:text-xl">
            {tagline}
          </p>
        ) : null}
        <Button
          asChild
          size="lg"
          className="mt-2"
        >
          <a href={cta.href}>{cta.label}</a>
        </Button>
      </Reveal>
    </section>
  );
}

export const HeroDemo: HeroProps = {
  overline: 'French · Portland',
  name: 'Maison Laurent',
  tagline: 'A candle-lit room and a seasonal tasting menu drawn from the coast and the farm.',
  cta: { label: 'Reserve a table', href: '#reserve' },
  image:
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80',
};

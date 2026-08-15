import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { GlassCard } from '@/components/GlassCard';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Above-the-fold hero that states the product's core promise directly over
 * the kit's vivid gradient canvas. A floating, tinted `GlassCard` panel — a
 * big stat figure over an optional backing image — sells the glass effect
 * immediately: `centered` stacks the panel below the copy as a hovering
 * card; `split` sets it beside the copy, mirroring a product mockup. Use as
 * the first content section after the navbar.
 */
export interface HeroProps extends SectionBaseProps {
  /** Short label above the headline. 1–4 words, sentence case, no punctuation (e.g. "Now in beta"). */
  eyebrow?: string | null;
  /** Primary benefit statement. 1 sentence, 5–11 words, no trailing period. */
  headline: string;
  /** Supporting subhead under the headline. 1–2 sentences, 14–32 words. */
  subhead?: string | null;
  /** Primary call-to-action button (filled). */
  primaryCta: {
    /** Button label. 1–3 words, sentence case (e.g. "Start free trial"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  };
  /** Secondary call-to-action button (glass outline). Omit for a single-CTA hero. */
  secondaryCta?: {
    /** Button label. 1–3 words, sentence case (e.g. "Watch the film"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  } | null;
  /** Floating glass stat panel. Omit for a copy-only hero. */
  panel?: {
    /** Small label above the figure. 1–3 words, sentence case (e.g. "Refraction accuracy"). */
    label?: string | null;
    /** Big stat figure. Max 8 characters (e.g. "98%", "12K+"). */
    value: string;
    /** One-line caption under the figure. 1 sentence, max 14 words. */
    caption?: string | null;
    /**
     * Optional backing image inside the panel, wide aspect (≈16:10).
     * @kind image
     */
    image?: string | null;
  } | null;
  /** Layout arrangement. */
  variant?: 'centered' | 'split';
}

function StatPanel({ panel }: { panel: NonNullable<HeroProps['panel']> }) {
  return (
    <GlassCard variant="tinted" className="w-full max-w-md p-8">
      {panel.image ? (
        <div className="mb-6 -mt-2 -mx-2 overflow-hidden rounded-[calc(var(--radius)-0.5rem)] border border-border/60">
          <img src={panel.image} alt="" className="aspect-[16/10] w-full object-cover" />
        </div>
      ) : null}
      {panel.label ? (
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          {panel.label}
        </p>
      ) : null}
      <p className="mt-2 font-display text-5xl font-bold tracking-tight">
        {panel.value}
      </p>
      {panel.caption ? (
        <p className="mt-2 text-sm text-muted-foreground text-pretty">{panel.caption}</p>
      ) : null}
    </GlassCard>
  );
}

export function Hero({
  id,
  eyebrow,
  headline,
  subhead,
  primaryCta,
  secondaryCta,
  panel,
  variant = 'centered',
}: HeroProps) {
  const copy = (
    <Reveal
      className={
        variant === 'split'
          ? 'flex max-w-xl flex-col items-start gap-6 text-left'
          : 'flex flex-col items-center gap-6 text-center'
      }
    >
      {eyebrow ? <Badge variant="glass">{eyebrow}</Badge> : null}
      <h1
        className={
          variant === 'split'
            ? 'text-5xl font-bold tracking-tight text-balance md:text-6xl'
            : 'max-w-3xl text-5xl font-bold tracking-tight text-balance md:text-6xl'
        }
      >
        {headline}
      </h1>
      {subhead ? (
        <p
          className={
            variant === 'split'
              ? 'text-lg text-muted-foreground text-pretty md:text-xl'
              : 'max-w-2xl text-lg text-muted-foreground text-pretty md:text-xl'
          }
        >
          {subhead}
        </p>
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
    </Reveal>
  );

  return (
    <section id={id ?? undefined} className="relative w-full">
      {variant === 'split' ? (
        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 pt-24 pb-24 md:pt-32 lg:grid-cols-2 lg:gap-16">
          {copy}
          {panel ? (
            <Reveal className="flex justify-center lg:justify-end">
              <StatPanel panel={panel} />
            </Reveal>
          ) : null}
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-16 px-6 pt-24 pb-24 md:pt-32">
          {copy}
          {panel ? (
            <Reveal>
              <StatPanel panel={panel} />
            </Reveal>
          ) : null}
        </div>
      )}
    </section>
  );
}

export const HeroDemo: HeroProps = {
  eyebrow: 'Now in beta',
  headline: 'Design that refracts light, not just displays it',
  subhead:
    'Halo brings a real-time glass rendering engine to your product surfaces — translucent, blurred, and responsive to whatever sits behind it.',
  primaryCta: { label: 'Start free trial', href: '#cta' },
  secondaryCta: { label: 'Watch the film', href: '#' },
  panel: {
    label: 'Refraction accuracy',
    value: '99.4%',
    caption: 'Matched against physical glass samples in lab testing.',
    image:
      'https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=1200&q=80',
  },
  variant: 'centered',
};

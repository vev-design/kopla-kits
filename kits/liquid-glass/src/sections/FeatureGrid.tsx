import {
  Aperture,
  Droplets,
  Gauge,
  Layers,
  Lock,
  Sparkles,
  Sun,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { Reveal } from '@/motion';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

const ICONS: Record<string, LucideIcon> = {
  droplets: Droplets,
  waves: Waves,
  sun: Sun,
  layers: Layers,
  lock: Lock,
  gauge: Gauge,
  aperture: Aperture,
  sparkles: Sparkles,
};

/**
 * Bento capability grid built from stacked `GlassCard` tiles of varying
 * spans: the first feature anchors a large 2×2 cell (with an optional
 * visual), the next three fill single cells beside it, and any further
 * items render as wide half-row cells below. Each cell pairs an
 * icon-in-a-glass-well with a title and body. Use after the stat row to do
 * the explaining.
 */
export interface FeatureGridProps extends SectionBaseProps {
  /** Small label above the heading. 1–3 words, sentence case (e.g. "Under the hood"). */
  eyebrow?: string | null;
  /** Section heading. 1 sentence, 3–8 words, no trailing period. */
  heading: string;
  /** Supporting line under the heading. 1 sentence, 12–24 words. */
  subhead?: string | null;
  /** Feature cells. 4 or 6 items fill the bento exactly; the FIRST item is the large anchor cell. */
  features: {
    /** Icon name. One of: droplets, waves, sun, layers, lock, gauge, aperture, sparkles. */
    icon: 'droplets' | 'waves' | 'sun' | 'layers' | 'lock' | 'gauge' | 'aperture' | 'sparkles';
    /** Feature title. 1–3 words, sentence case. */
    title: string;
    /** Feature body. 1–2 sentences, 12–28 words. */
    body: string;
    /**
     * Optional visual for the cell, framed at the bottom. Wide aspect (≈16:9); best on the first (anchor) cell.
     * @kind image
     */
    image?: string | null;
  }[];
}

export function FeatureGrid({ id, eyebrow, heading, subhead, features }: FeatureGridProps) {
  return (
    <section id={id ?? undefined} className="w-full">
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        <Reveal className="mb-12 flex flex-col items-center gap-4 text-center">
          {eyebrow ? (
            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {heading}
          </h2>
          {subhead ? (
            <p className="max-w-2xl text-lg text-muted-foreground text-pretty">{subhead}</p>
          ) : null}
        </Reveal>
        {/* Span classes must sit on the grid's direct children — a Stagger
            wrapper would swallow them into its own per-child div. */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = ICONS[feature.icon] ?? Sparkles;
            const isAnchor = index === 0;
            const isWide = index >= 4;
            return (
              <Reveal
                key={feature.title}
                className={cn(isAnchor && 'sm:col-span-2 sm:row-span-2', isWide && 'lg:col-span-2')}
              >
                <GlassCard
                  variant={isAnchor ? 'tinted' : 'light'}
                  className={cn('h-full gap-4', isAnchor ? 'p-8' : 'p-6')}
                >
                  <span
                    className={cn(
                      'inline-flex items-center justify-center rounded-full border border-border bg-card backdrop-blur-xl',
                      isAnchor ? 'size-14 text-primary' : 'size-11 text-foreground',
                    )}
                  >
                    <Icon className={isAnchor ? 'size-6' : 'size-5'} strokeWidth={2} />
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3
                      className={cn(
                        'font-semibold tracking-tight',
                        isAnchor ? 'text-2xl' : 'text-lg',
                      )}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={cn(
                        'text-muted-foreground text-pretty',
                        isAnchor ? 'text-base' : 'text-sm',
                      )}
                    >
                      {feature.body}
                    </p>
                  </div>
                  {feature.image ? (
                    <div
                      className={cn(
                        'mt-auto overflow-hidden rounded-[calc(var(--radius)-0.5rem)] border border-border/60',
                        isAnchor && 'min-h-40 flex-1',
                      )}
                    >
                      <img
                        src={feature.image}
                        alt=""
                        className={cn('w-full object-cover', isAnchor ? 'h-full' : 'aspect-video')}
                      />
                    </div>
                  ) : null}
                </GlassCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const FeatureGridDemo: FeatureGridProps = {
  eyebrow: 'Under the hood',
  heading: 'A rendering engine built for light',
  subhead:
    'Every surface in Halo is a real glass simulation — refraction, blur, and specular response computed live, not faked with a drop shadow.',
  features: [
    {
      icon: 'droplets',
      title: 'Real-time refraction',
      body: 'Panels sample and bend whatever sits behind them at 60fps, so the glass reacts to motion and color instead of sitting on top of it.',
      image:
        'https://images.unsplash.com/photo-1614851099175-e5b30eb6f696?auto=format&fit=crop&w=1200&q=80',
    },
    {
      icon: 'waves',
      title: 'Adaptive blur',
      body: 'Blur radius adjusts to backdrop contrast automatically, so text stays legible over any color the canvas throws at it.',
    },
    {
      icon: 'sun',
      title: 'Specular highlights',
      body: 'Every panel edge catches a directional highlight that shifts with scroll position, selling the sense of a lit, curved surface.',
    },
    {
      icon: 'layers',
      title: 'Layered depth',
      body: 'Stack panels at different blur and opacity levels to build a real sense of foreground and background, not a flat card pile.',
    },
    {
      icon: 'lock',
      title: 'Contrast-safe by default',
      body: 'A built-in legibility guard raises foreground opacity automatically when a backdrop gets too bright to read through.',
    },
    {
      icon: 'aperture',
      title: 'One design token away',
      body: 'Swap the three canvas hues and every glass surface in the system re-tints instantly — no per-component edits required.',
    },
  ],
};

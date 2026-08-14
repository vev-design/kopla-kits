import {
  Aperture,
  Gem,
  Layers3,
  Orbit,
  Radio,
  Sparkles,
  Sun,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/Card';
import { Reveal } from '@/motion';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

const ICONS: Record<string, LucideIcon> = {
  aperture: Aperture,
  gem: Gem,
  layers: Layers3,
  orbit: Orbit,
  radio: Radio,
  sparkles: Sparkles,
  sun: Sun,
  waves: Waves,
};

/**
 * Bento grid of frosted glass cards breaking the product into cells of
 * varying weight: the first feature anchors a large 2×2 cell, the next
 * three fill single cells beside it, and any further items render as wide
 * half-row cells below. Each cell pairs a glowing icon chip with a title and
 * body over the translucent card surface. Use after the hero to do the
 * explaining.
 */
export interface FeatureGridProps extends SectionBaseProps {
  /** Small label above the heading. 1–3 words, sentence case (e.g. "What's inside"). */
  eyebrow?: string | null;
  /** Section heading. 1 sentence, 3–8 words, no trailing period. */
  heading: string;
  /** Supporting line under the heading. 1 sentence, 12–24 words. */
  subhead?: string | null;
  /** Feature cells. 4 or 6 items fill the bento exactly; the FIRST item is the large anchor cell. */
  features: {
    /** Icon name. One of: aperture, gem, layers, orbit, radio, sparkles, sun, waves. */
    icon: 'aperture' | 'gem' | 'layers' | 'orbit' | 'radio' | 'sparkles' | 'sun' | 'waves';
    /** Feature title. 1–4 words, sentence case. */
    title: string;
    /** Feature body. 1–2 sentences, 12–28 words. */
    body: string;
  }[];
}

export function FeatureGrid({ id, eyebrow, heading, subhead, features }: FeatureGridProps) {
  return (
    <section id={id ?? undefined} className="relative w-full bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,var(--chart-2),transparent)] opacity-20 blur-3xl"
      />
      <div className="relative mx-auto w-full max-w-6xl px-6 py-24">
        <Reveal className="mb-12 flex max-w-2xl flex-col items-start gap-4">
          {eyebrow ? (
            <p className="font-mono text-xs tracking-[0.18em] text-accent-foreground uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            {heading}
          </h2>
          {subhead ? (
            <p className="text-lg text-muted-foreground text-pretty">{subhead}</p>
          ) : null}
        </Reveal>
        {/* Span classes must sit on the grid's direct children — Reveal
            wraps each child in its own element, which would swallow them. */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = ICONS[feature.icon] ?? Sparkles;
            const isAnchor = index === 0;
            const isWide = index >= 4;
            return (
              <Reveal
                key={feature.title}
                className={cn(isAnchor && 'sm:col-span-2', isWide && 'lg:col-span-3')}
              >
                <Card variant="glass" className={cn('h-full', isAnchor && 'lg:p-8')}>
                  <span className="inline-flex size-11 items-center justify-center rounded-full border border-ring/40 bg-accent/50 text-accent-foreground shadow-[0_0_24px_-6px_var(--ring)]">
                    <Icon className="size-5" strokeWidth={2} />
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
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const FeatureGridDemo: FeatureGridProps = {
  eyebrow: "What's inside",
  heading: 'Every surface catches the light',
  subhead:
    'Four building blocks turn a flat interface into a lit, living one — no photography required.',
  features: [
    {
      icon: 'layers',
      title: 'Layered glass panels',
      body: 'Translucent surfaces stack over the gradient at different depths, so scrolling feels like moving through a lit room rather than down a page.',
    },
    {
      icon: 'orbit',
      title: 'Ambient gradients',
      body: 'Slow, oversized color blooms sit behind every panel — never sharp, never static.',
    },
    {
      icon: 'sparkles',
      title: 'Kinetic type',
      body: 'Headlines sweep font weight as they scroll into view, carrying the drama imagery usually would.',
    },
    {
      icon: 'aperture',
      title: 'Film grain',
      body: 'A faint noise layer keeps the glow tactile instead of flat and digital.',
    },
    {
      icon: 'gem',
      title: 'One accent, held back',
      body: 'Hot pink appears only where it matters — the primary action and the highlighted plan — so it still reads as an accent.',
    },
    {
      icon: 'radio',
      title: 'Built to broadcast',
      body: 'Every section is a full-bleed band, ready for a launch page, a drop, or a keynote.',
    },
  ],
};

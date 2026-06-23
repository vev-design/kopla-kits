import {
  Flower2,
  HeartPulse,
  Leaf,
  Moon,
  Sparkles,
  Sun,
  Waves,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { Reveal, Stagger } from '@/motion';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

const ICONS: Record<string, LucideIcon> = {
  leaf: Leaf,
  flower: Flower2,
  moon: Moon,
  sun: Sun,
  wind: Wind,
  waves: Waves,
  heart: HeartPulse,
  sparkles: Sparkles,
};

/**
 * Soft, rounded cards for the studio's classes and services. Each offering
 * pairs a calm icon with a name, a short description, and optional duration and
 * level details. Use after the hero to show what the studio offers; pick the
 * column count with `variant`.
 */
export interface OfferingsProps extends SectionBaseProps {
  /** Small label above the heading. 1–3 words, sentence case (e.g. "Our classes"). */
  eyebrow?: string | null;
  /** Section heading. 1 sentence, 3–8 words, no trailing period. */
  heading: string;
  /** Supporting line under the heading. 1 sentence, 12–26 words. */
  subhead?: string | null;
  /** Offering cards. 3–6 items (multiples of the column count read best). */
  offerings: {
    /** Icon name. One of: leaf, flower, moon, sun, wind, waves, heart, sparkles. */
    icon: 'leaf' | 'flower' | 'moon' | 'sun' | 'wind' | 'waves' | 'heart' | 'sparkles';
    /** Offering title. 1–3 words, sentence case. */
    title: string;
    /** Offering body. 1–2 sentences, 14–30 words. */
    body: string;
    /** Optional session length. Short, max 12 chars (e.g. "60 min"). */
    duration?: string | null;
    /** Optional experience level. Short, max 14 chars (e.g. "All levels"). */
    level?: string | null;
  }[];
  /** Number of columns on desktop. */
  variant?: 'two-col' | 'three-col';
}

export function Offerings({
  id,
  eyebrow,
  heading,
  subhead,
  offerings,
  variant = 'three-col',
}: OfferingsProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        <Reveal className="mb-14 flex flex-col items-center gap-4 text-center">
          {eyebrow ? <Badge variant="soft">{eyebrow}</Badge> : null}
          <h2 className="max-w-2xl font-serif text-4xl font-semibold tracking-tight text-balance md:text-5xl">
            {heading}
          </h2>
          {subhead ? (
            <p className="max-w-xl text-lg text-muted-foreground text-pretty">
              {subhead}
            </p>
          ) : null}
        </Reveal>
        <Stagger
          className={cn(
            'grid gap-6',
            variant === 'two-col'
              ? 'sm:grid-cols-2'
              : 'sm:grid-cols-2 lg:grid-cols-3',
          )}
        >
          {offerings.map((offering) => {
            const Icon = ICONS[offering.icon] ?? Leaf;
            return (
              <Card key={offering.title} variant="soft">
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Icon className="size-5" strokeWidth={2} />
                </span>
                <h3 className="font-serif text-xl font-semibold tracking-tight">
                  {offering.title}
                </h3>
                <p className="text-sm text-muted-foreground text-pretty">
                  {offering.body}
                </p>
                {offering.duration || offering.level ? (
                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    {offering.duration ? (
                      <Badge variant="outline">{offering.duration}</Badge>
                    ) : null}
                    {offering.level ? (
                      <Badge variant="outline">{offering.level}</Badge>
                    ) : null}
                  </div>
                ) : null}
              </Card>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

export const OfferingsDemo: OfferingsProps = {
  eyebrow: 'Our classes',
  heading: 'Practices for every kind of day',
  subhead:
    'Whether you crave movement or stillness, there is a class to meet you exactly where you are.',
  offerings: [
    {
      icon: 'sun',
      title: 'Morning flow',
      body: 'A warm, unhurried vinyasa to wake the body and set a gentle intention for the day ahead.',
      duration: '60 min',
      level: 'All levels',
    },
    {
      icon: 'wind',
      title: 'Breathwork',
      body: 'Guided breathing to quiet a busy mind, ease tension, and return you to a steady, settled calm.',
      duration: '45 min',
      level: 'All levels',
    },
    {
      icon: 'moon',
      title: 'Restorative',
      body: 'Long, supported holds with bolsters and blankets to release deeply and rest the nervous system.',
      duration: '75 min',
      level: 'Beginner',
    },
    {
      icon: 'waves',
      title: 'Slow flow',
      body: 'A mindful, fluid practice that links breath and movement at a soft and steady pace.',
      duration: '60 min',
      level: 'All levels',
    },
    {
      icon: 'flower',
      title: 'Prenatal',
      body: 'Nurturing movement and breath designed to support the body through every trimester.',
      duration: '60 min',
      level: 'Prenatal',
    },
    {
      icon: 'sparkles',
      title: 'Meditation',
      body: 'A seated practice in stillness and awareness to close the day and soften into evening.',
      duration: '30 min',
      level: 'All levels',
    },
  ],
  variant: 'three-col',
};

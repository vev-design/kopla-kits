import { Reveal } from '@/motion';
import { Badge, Button } from '@/components';
import { Calendar, MapPin } from 'lucide-react';
import type { SectionBaseProps } from '@/types';

/**
 * Top-of-page event banner — the name, a one-line pitch, the date + location,
 * and the primary ticket CTA. Use as the first section, above the fold.
 */
export interface EventHeroProps extends SectionBaseProps {
  /** Short uppercase kicker. 1–3 words, e.g. "Conference 2026". */
  eyebrow?: string | null;
  /** Event name. 1 line, 1–5 words. */
  title: string;
  /** One-line pitch. 1 sentence, 8–20 words. */
  tagline: string;
  /** Date line. ~3–6 words, e.g. "May 14–15, 2026". */
  date: string;
  /** Location. ~2–5 words, e.g. "Berlin + online". */
  location: string;
  /** Primary CTA. */
  cta: {
    /** Label. 1–3 words, e.g. "Get tickets". */
    label: string;
    /**
     * Destination.
     * @kind url
     */
    href: string;
  };
  /** Optional secondary CTA (e.g. "View schedule"). */
  secondaryCta?: {
    /** Label. 1–3 words. */
    label: string;
    /**
     * Destination.
     * @kind url
     */
    href: string;
  } | null;
}

export function EventHero({
  id,
  eyebrow,
  title,
  tagline,
  date,
  location,
  cta,
  secondaryCta,
}: EventHeroProps) {
  return (
    <section
      id={id ?? undefined}
      className="relative flex min-h-[80vh] w-full flex-col items-center justify-center overflow-hidden px-6 py-24 text-center"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
      />
      <Reveal className="relative flex max-w-3xl flex-col items-center gap-6">
        {eyebrow ? (
          <Badge tone="soft" size="kicker">
            {eyebrow}
          </Badge>
        ) : null}
        <h1 className="font-display text-6xl font-bold leading-[0.95] tracking-tight text-balance md:text-8xl">
          {title}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground text-pretty md:text-xl">{tagline}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium">
          <span className="inline-flex items-center gap-2">
            <Calendar size={15} strokeWidth={2.25} className="text-primary" />
            {date}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin size={15} strokeWidth={2.25} className="text-primary" />
            {location}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <a href={cta.href}>{cta.label}</a>
          </Button>
          {secondaryCta ? (
            <Button asChild variant="outline" size="lg">
              <a href={secondaryCta.href}>{secondaryCta.label}</a>
            </Button>
          ) : null}
        </div>
      </Reveal>
    </section>
  );
}

export const EventHeroDemo: EventHeroProps = {
  eyebrow: 'Conference 2026',
  title: 'Frontier',
  tagline: 'Two days on the craft of building software — talks, workshops, and the hallway track that makes it worth the trip.',
  date: 'May 14–15, 2026',
  location: 'Berlin + online',
  cta: { label: 'Get tickets', href: '#tickets' },
  secondaryCta: { label: 'View schedule', href: '#schedule' },
};

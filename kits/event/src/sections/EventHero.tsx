import { Reveal } from '@/motion';
import { Badge, Button } from '@/components';
import { MapPin } from 'lucide-react';
import type { SectionBaseProps } from '@/types';

/**
 * Full-bleed poster hero — the event name and dates as huge uppercase display
 * type (dates in solid accent), the venue line, ticket CTAs, and a scrolling
 * accent marquee strip along the base. Use as the first section, above the
 * fold.
 */
export interface EventHeroProps extends SectionBaseProps {
  /** Short kicker rendered as a solid chip. 1–3 words, e.g. "Conference 2026". */
  eyebrow?: string | null;
  /** Event name, set as oversized uppercase display type. 1 line, 1–4 words. */
  title: string;
  /** One-line pitch. 1 sentence, 8–20 words. */
  tagline: string;
  /** Event dates, set as an oversized accent-colored lockup. 2–5 words, e.g. "May 14–15, 2026". */
  date: string;
  /** Venue / location line. 2–5 words, e.g. "Berlin + online". */
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
  /** Phrases for the scrolling marquee strip at the base. 2–5 items, 2–6 words each (e.g. "3,000 builders"). Cleared, it falls back to the date and location. */
  marquee?: string[] | null;
}

/** Internal: the looping accent strip. Content is duplicated for a seamless
 *  -50% translate loop; animation only runs under `motion-safe`. */
function HeroMarquee({ phrases }: { phrases: string[] }) {
  // Repeat the set so one copy always overflows the viewport width.
  const run = Array.from({ length: 4 }, () => phrases).flat();
  const strip = (hidden?: boolean) => (
    <div aria-hidden={hidden ? true : undefined} className="flex shrink-0 items-center">
      {run.map((phrase, i) => (
        <span
          key={i}
          className="flex items-center gap-5 pl-5 font-display text-base uppercase leading-none tracking-tight whitespace-nowrap md:text-lg"
        >
          {phrase}
          <span aria-hidden className="size-1.5 rotate-45 bg-primary-foreground/50" />
        </span>
      ))}
    </div>
  );
  return (
    <div
      data-slot="marquee"
      className="w-full overflow-hidden bg-primary py-3.5 text-primary-foreground"
    >
      <div className="flex w-max motion-safe:animate-marquee">
        {strip()}
        {strip(true)}
      </div>
    </div>
  );
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
  marquee,
}: EventHeroProps) {
  const phrases = marquee && marquee.length > 0 ? marquee : [date, location];
  return (
    <section
      id={id ?? undefined}
      className="relative flex min-h-svh w-full flex-col overflow-hidden"
    >
      <div className="flex w-full flex-1 flex-col justify-center px-6 pt-24 pb-14 md:px-12 lg:px-16">
        <Reveal className="flex w-full flex-col gap-8 md:gap-10">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            {eyebrow ? (
              <Badge data-slot="eyebrow" tone="solid" size="kicker">
                {eyebrow}
              </Badge>
            ) : null}
            <span
              data-slot="location"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em]"
            >
              <MapPin size={14} strokeWidth={2.5} className="text-primary" />
              {location}
            </span>
          </div>
          <div className="flex flex-col">
            <h1
              data-slot="heading"
              className="font-display max-w-[10ch] text-[clamp(3.5rem,12vw,10rem)] uppercase leading-[0.85] tracking-[-0.02em] text-balance"
            >
              {title}
            </h1>
            <p
              data-slot="date"
              className="font-display text-[clamp(2.25rem,7.5vw,6.5rem)] uppercase leading-[0.9] tracking-[-0.02em] text-primary"
            >
              {date}
            </p>
          </div>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
            <p
              data-slot="subhead"
              className="max-w-md text-lg text-muted-foreground text-pretty md:text-xl"
            >
              {tagline}
            </p>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <a href={cta.href}>{cta.label}</a>
              </Button>
              {secondaryCta ? (
                <Button asChild variant="outline" size="lg">
                  <a href={secondaryCta.href}>{secondaryCta.label}</a>
                </Button>
              ) : null}
            </div>
          </div>
        </Reveal>
      </div>
      <HeroMarquee phrases={phrases} />
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
  marquee: ['May 14–15, 2026', 'Berlin + online', '1,200 builders', 'Two stages'],
};

import { Divider } from '@/components/Divider';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Closing reservation CTA — a full-bleed image under a dark overlay with one
 * focused invitation to book a table. The final push of the page; place just
 * before the footer.
 */
export interface ReservationProps extends SectionBaseProps {
  /** Small overline above the heading. 1–3 words, title case (e.g. "Reservations"). */
  overline?: string | null;
  /** Headline inviting a booking. 1 sentence, 4–9 words, no trailing period. */
  heading: string;
  /** Supporting line under the headline. 1 sentence, 10–24 words. */
  body?: string | null;
  /** Primary reserve button. */
  primaryCta: {
    /** Button label. 1–3 words, sentence case (e.g. "Book a table"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  };
  /** Optional secondary action (e.g. private events). Omit for a single button. */
  secondaryCta?: {
    /** Button label. 1–3 words, sentence case (e.g. "Private dining"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  } | null;
  /**
   * Full-bleed background image — a moody dining-room or table shot.
   * @kind image
   */
  image: string;
}

export function Reservation({
  id,
  overline,
  heading,
  body,
  primaryCta,
  secondaryCta,
  image,
}: ReservationProps) {
  return (
    <section
      id={id ?? undefined}
      className="relative flex w-full items-center justify-center overflow-hidden"
    >
      <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-background/80" />
      <Reveal className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-6 px-6 py-28 text-center md:py-36">
        {overline ? (
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-primary">
            {overline}
          </p>
        ) : null}
        <h2 className="font-serif text-4xl font-medium tracking-tight text-balance md:text-6xl">
          {heading}
        </h2>
        <Divider />
        {body ? (
          <p className="max-w-xl text-lg text-muted-foreground text-pretty">{body}</p>
        ) : null}
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <a href={primaryCta.href}>{primaryCta.label}</a>
          </Button>
          {secondaryCta ? (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <a href={secondaryCta.href}>{secondaryCta.label}</a>
            </Button>
          ) : null}
        </div>
      </Reveal>
    </section>
  );
}

export const ReservationDemo: ReservationProps = {
  overline: 'Reservations',
  heading: 'Join us for an evening',
  body: 'Tables open thirty days in advance. We hold a few seats at the counter for walk-ins each night.',
  primaryCta: { label: 'Book a table', href: '#' },
  secondaryCta: { label: 'Private dining', href: '#' },
  image:
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
};

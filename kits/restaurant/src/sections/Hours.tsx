import { MapPin, Phone } from 'lucide-react';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Visit details — opening hours per day beside the address and a short note,
 * with an optional reservations phone link. The practical beat before the
 * closing CTA; place after the gallery.
 */
export interface HoursProps extends SectionBaseProps {
  /** Small overline above the heading. 1–3 words, title case (e.g. "Visit"). */
  overline?: string | null;
  /** Section heading. 1 sentence, 2–6 words, no trailing period. */
  heading: string;
  /** Opening-hours rows. 3–7 items. */
  hours: {
    /** Day or day range. 1–3 words, title case (e.g. "Tue – Thu"). */
    day: string;
    /** Service hours, or a closed note. Max 18 characters (e.g. "5 – 10 pm"). */
    time: string;
  }[];
  /** Street address. 1–2 lines, max 60 characters. */
  address: string;
  /** Short note about visiting. 1 sentence, 8–20 words. */
  note?: string | null;
  /** Reservations phone link. Omit to hide. */
  phone?: {
    /** Visible number. Max 18 characters (e.g. "(503) 555-0142"). */
    label: string;
    /**
     * Tel link target (e.g. "tel:+15035550142").
     * @kind url
     */
    href: string;
  } | null;
}

export function Hours({ id, overline, heading, hours, address, note, phone }: HoursProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-card/40">
      <div className="mx-auto w-full max-w-5xl px-6 py-24 md:py-32">
        <Reveal className="mb-14 flex flex-col items-center gap-4 text-center">
          {overline ? <Badge variant="gold">{overline}</Badge> : null}
          <h2 className="font-serif text-4xl font-medium tracking-tight text-balance md:text-5xl">
            {heading}
          </h2>
        </Reveal>
        <Reveal className="grid gap-6 md:grid-cols-2">
          <Card variant="surface">
            <h3 className="font-serif text-xl tracking-wide text-primary">Hours</h3>
            <dl className="flex flex-col">
              {hours.map((row) => (
                <div
                  key={row.day}
                  className="flex items-baseline justify-between gap-3 border-b border-border/60 py-2.5 last:border-b-0"
                >
                  <dt className="text-sm text-foreground">{row.day}</dt>
                  <dd className="text-sm text-muted-foreground">{row.time}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card variant="surface" className="justify-between">
            <div className="flex flex-col gap-4">
              <h3 className="font-serif text-xl tracking-wide text-primary">Find Us</h3>
              <p className="flex items-start gap-3 text-sm text-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="whitespace-pre-line text-pretty">{address}</span>
              </p>
              {note ? (
                <p className="text-sm text-muted-foreground text-pretty">{note}</p>
              ) : null}
            </div>
            {phone ? (
              <Button
                asChild
                variant="outline"
                className="mt-2 self-start border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <a href={phone.href}>
                  <Phone className="size-4" />
                  {phone.label}
                </a>
              </Button>
            ) : null}
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

export const HoursDemo: HoursProps = {
  overline: 'Visit',
  heading: 'Hours & Location',
  hours: [
    { day: 'Tue – Thu', time: '5 – 10 pm' },
    { day: 'Fri – Sat', time: '5 – 11 pm' },
    { day: 'Sunday', time: '4 – 9 pm' },
    { day: 'Mon', time: 'Closed' },
  ],
  address: '218 Harbor Lane\nPortland, OR 97204',
  note: 'Street parking after 6 pm; the kitchen seats its last table thirty minutes before close.',
  phone: { label: '(503) 555-0142', href: 'tel:+15035550142' },
};

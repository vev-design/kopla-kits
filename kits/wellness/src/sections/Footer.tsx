import { Clock, MapPin } from 'lucide-react';
import type { SectionBaseProps } from '@/types';

/**
 * A calm closing footer for the studio. A serif wordmark with a short blurb,
 * an opening-hours list, a location block, and a row of social links. The quiet
 * landing after the page; always the last section.
 */
export interface FooterProps extends SectionBaseProps {
  /** Studio wordmark. Plain text, 1–2 words (e.g. "Lumen Studio"). */
  logo: string;
  /** Short studio blurb under the wordmark. 1 sentence, 8–18 words. */
  blurb?: string | null;
  /** Opening hours. 2–4 items, in weekday order. */
  hours: {
    /** Day or day range. Short, max 16 chars (e.g. "Mon – Fri"). */
    days: string;
    /** Hours for that range. Short, max 16 chars (e.g. "7am – 8pm"). */
    time: string;
  }[];
  /** Studio street address. 1 line, max 60 chars. */
  address: string;
  /** Social or contact links. 2–4 items. */
  social: {
    /** Link label. 1–2 words, sentence case (e.g. "Instagram"). */
    label: string;
    /**
     * Destination URL.
     * @kind url
     */
    href: string;
  }[];
  /** Small-print line at the bottom (copyright). 1 short line, max 12 words. */
  legal?: string | null;
}

export function Footer({ id, logo, blurb, hours, address, social, legal }: FooterProps) {
  return (
    <section
      id={id ?? undefined}
      className="w-full border-t border-border bg-muted/40"
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <div className="font-serif text-xl font-semibold tracking-tight">
              {logo}
            </div>
            {blurb ? (
              <p className="max-w-xs text-sm text-muted-foreground text-pretty">
                {blurb}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-foreground uppercase">
              <Clock className="size-4 text-primary" strokeWidth={2} />
              Hours
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {hours.map((entry) => (
                <li key={entry.days} className="flex justify-between gap-4">
                  <span>{entry.days}</span>
                  <span className="text-foreground/80">{entry.time}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-foreground uppercase">
              <MapPin className="size-4 text-primary" strokeWidth={2} />
              Visit
            </h3>
            <p className="text-sm text-muted-foreground text-pretty">{address}</p>
            <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
              {social.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {legal ? (
          <p className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
            {legal}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export const FooterDemo: FooterProps = {
  logo: 'Lumen Studio',
  blurb: 'A sunlit neighborhood studio for yoga, breathwork, and quiet, restorative hours.',
  hours: [
    { days: 'Mon – Fri', time: '7am – 8pm' },
    { days: 'Saturday', time: '8am – 4pm' },
    { days: 'Sunday', time: '9am – 1pm' },
  ],
  address: '14 Willow Lane, Cedar Grove',
  social: [
    { label: 'Instagram', href: '#' },
    { label: 'Newsletter', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  legal: '© 2026 Lumen Studio. Breathe easy.',
};

import { Rule } from '@/components';
import type { SectionBaseProps } from '@/types';

/**
 * The closing plate, set as a colophon rather than a marketing footer: the
 * wordmark once more at clear space, the link columns set small and wide, and
 * a production note naming what the page itself is set in. Naming your own
 * typesetting is a foundry habit, and it is the right last word for a system
 * whose whole subject is the letterform.
 */
export interface ColophonProps extends SectionBaseProps {
  /** Wordmark text. 1–2 words, any casing — the component uppercases it. */
  wordmark: string;
  /** Link columns. 2–4 columns, each with 2–5 links. */
  columns?: {
    /** Column heading. 1–2 words, Title Case. */
    heading: string;
    /** Links in this column. 2–5 items. */
    links: {
      /** Link label. 1–3 words. */
      label: string;
      /**
       * Destination.
       * @kind url
       */
      href: string;
    }[];
  }[];
  /** Production note naming the faces the page is set in. 1 sentence, 8–20 words. */
  colophon?: string | null;
  /** Copyright line. 1 line, max 60 characters. */
  legal?: string | null;
}

export function Colophon({ id, wordmark, columns = [], colophon, legal }: ColophonProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background pb-16">
      <div className="mx-auto w-full max-w-7xl px-6">
        <Rule weight="stem" />
        <div className="grid gap-12 pt-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="caps-lockup font-display text-3xl leading-none font-black text-foreground md:text-4xl">
              {wordmark}
            </p>
            {colophon ? (
              <p className="measure mt-6 font-sans text-sm leading-relaxed text-muted-foreground text-pretty">
                {colophon}
              </p>
            ) : null}
          </div>
          {columns.length > 0 ? (
            <div className="grid gap-10 sm:grid-cols-3 md:col-span-6 md:col-start-7">
              {columns.map((column) => (
                <div key={column.heading}>
                  <p className="font-sans text-[0.625rem] font-semibold uppercase [letter-spacing:var(--tracking-label)] text-foreground">
                    {column.heading}
                  </p>
                  <ul className="mt-5 space-y-3">
                    {column.links.map((link) => (
                      <li key={link.href + link.label}>
                        <a
                          href={link.href}
                          className="font-sans text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        {legal ? (
          <>
            <Rule weight="hair" className="mt-16" />
            <p className="nums-text pt-6 font-sans text-xs text-muted-foreground">{legal}</p>
          </>
        ) : null}
      </div>
    </section>
  );
}

export const ColophonDemo: ColophonProps = {
  wordmark: 'Kestrel & Vane',
  columns: [
    {
      heading: 'Family',
      links: [
        { label: 'Specimen', href: '#specimen' },
        { label: 'Weights', href: '#weights' },
        { label: 'Glyph set', href: '#anatomy' },
      ],
    },
    {
      heading: 'License',
      links: [
        { label: 'Desktop', href: '#' },
        { label: 'Web', href: '#' },
        { label: 'Broadcast', href: '#' },
      ],
    },
    {
      heading: 'Foundry',
      links: [
        { label: 'About', href: '#' },
        { label: 'Custom work', href: '#' },
        { label: 'Contact', href: '#' },
      ],
    },
  ],
  colophon:
    'This page is set in Meridian Display and Marden Grotesk, with figures in oldstyle throughout the running text.',
  legal: '© 2026 Kestrel & Vane. All rights reserved.',
};

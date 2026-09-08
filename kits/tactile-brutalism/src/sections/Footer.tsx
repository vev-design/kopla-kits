import type { SectionBaseProps } from '@/types';

/**
 * Structured closing footer: a mono wordmark and blurb, columns of uppercase
 * mono links, and a small-print line below a hard top rule. Always the last
 * section on the page.
 */
export interface FooterProps extends SectionBaseProps {
  /** Brand wordmark. Plain text, 1–2 words (e.g. "Monolith"). */
  logo: string;
  /** Short shop blurb under the wordmark. 1 sentence, 8–18 words. */
  blurb?: string | null;
  /** Link columns. 2–3 columns, each with a heading and 2–5 links. */
  columns: {
    /** Column heading. 1–2 words, sentence case (e.g. "Studio"). */
    heading: string;
    /** Links in this column. 2–5 items. */
    links: {
      /** Link label. 1–3 words, sentence case. */
      label: string;
      /**
       * Destination URL or in-page anchor.
       * @kind url
       */
      href: string;
    }[];
  }[];
  /** Small-print line at the bottom (copyright, legal). 1 short line, max 12 words. */
  legal?: string | null;
}

export function Footer({ id, logo, blurb, columns, legal }: FooterProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 border-t border-border pt-12 md:grid-cols-[1.5fr_repeat(2,1fr)]">
          <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
            <span className="font-mono text-base font-semibold tracking-[0.08em] text-foreground uppercase">
              {logo}
            </span>
            {blurb ? (
              <p className="max-w-xs text-sm text-muted-foreground text-pretty">{blurb}</p>
            ) : null}
          </div>
          {columns.map((column) => (
            <div key={column.heading} className="flex flex-col gap-3">
              <h3 className="font-mono text-xs tracking-[0.12em] text-primary uppercase">
                {column.heading}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {legal ? (
          <p className="mt-12 border-t border-border pt-6 font-mono text-xs tracking-[0.05em] text-muted-foreground uppercase">
            {legal}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export const FooterDemo: FooterProps = {
  logo: 'Monolith',
  blurb: 'An engineering studio for physical products — prototyping, tooling, and production under one roof.',
  columns: [
    {
      heading: 'Studio',
      links: [
        { label: 'Work', href: '#work' },
        { label: 'Process', href: '#stat' },
        { label: 'Reviews', href: '#testimonial' },
      ],
    },
    {
      heading: 'Contact',
      links: [
        { label: 'Start a project', href: '#cta' },
        { label: 'Email', href: '#' },
        { label: 'Visit the shop', href: '#' },
      ],
    },
  ],
  legal: '© 2026 Monolith. All rights reserved.',
};

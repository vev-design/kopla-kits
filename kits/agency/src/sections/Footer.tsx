import type { SectionBaseProps } from '@/types';

/**
 * Structured closing footer with a large wordmark, link columns, and a
 * small-print line. Hairline rules and monospace headings keep the editorial
 * voice to the very bottom; always the last section on the page.
 */
export interface FooterProps extends SectionBaseProps {
  /** Brand wordmark. Plain text, 1–2 words (e.g. "Field Studio"). */
  logo: string;
  /** Short studio blurb under the wordmark. 1 sentence, 8–18 words. */
  blurb?: string | null;
  /** Link columns. 2–4 columns, each with a heading and 2–5 links. */
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
  /** Small-print line at the bottom (copyright, location). 1 short line, max 12 words. */
  legal?: string | null;
}

export function Footer({ id, logo, blurb, columns, legal }: FooterProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background">
      <div className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
            <span className="text-3xl font-bold tracking-tight uppercase md:text-4xl">
              {logo}
            </span>
            {blurb ? (
              <p className="max-w-xs text-sm text-muted-foreground text-pretty">
                {blurb}
              </p>
            ) : null}
          </div>
          {columns.map((column) => (
            <div key={column.heading} className="flex flex-col gap-3">
              <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {column.heading}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-foreground transition-colors hover:text-primary"
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
          <p className="mt-12 border-t border-border pt-6 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {legal}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export const FooterDemo: FooterProps = {
  logo: 'Field Studio',
  blurb: 'An independent creative practice making identity, web, and motion for companies with a point of view.',
  columns: [
    {
      heading: 'Studio',
      links: [
        { label: 'Work', href: '#work' },
        { label: 'Services', href: '#services' },
        { label: 'Process', href: '#process' },
      ],
    },
    {
      heading: 'Connect',
      links: [
        { label: 'Instagram', href: '#' },
        { label: 'LinkedIn', href: '#' },
        { label: 'Dribbble', href: '#' },
      ],
    },
    {
      heading: 'Contact',
      links: [
        { label: 'Enquiries', href: 'mailto:hello@fieldstudio.example' },
        { label: 'Careers', href: '#' },
        { label: 'Press', href: '#' },
      ],
    },
  ],
  legal: '© 2026 Field Studio — Berlin & New York',
};

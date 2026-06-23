import type { SectionBaseProps } from '@/types';

/**
 * Structured page footer with a brand wordmark, a short blurb, columns of
 * navigation links, and a small-print line. The calm closing band after the
 * pitch; always the last section on the page.
 */
export interface FooterProps extends SectionBaseProps {
  /** Brand wordmark. Plain text, 1–2 words (e.g. "Forge"). */
  logo: string;
  /** Short company blurb under the wordmark. 1 sentence, 8–18 words. */
  blurb?: string | null;
  /** Link columns. 2–4 columns, each with a heading and 2–5 links. */
  columns: {
    /** Column heading. 1–2 words, sentence case (e.g. "Product"). */
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
    <section
      id={id ?? undefined}
      className="w-full border-t border-border bg-card/40"
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
            <div className="flex items-center gap-2.5 text-base font-semibold tracking-tight">
              <span
                className="inline-block size-5 rounded-md bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3"
                aria-hidden
              />
              {logo}
            </div>
            {blurb ? (
              <p className="max-w-xs text-sm text-muted-foreground text-pretty">
                {blurb}
              </p>
            ) : null}
          </div>
          {columns.map((column) => (
            <div key={column.heading} className="flex flex-col gap-3">
              <h3 className="font-mono text-xs tracking-[0.12em] text-foreground uppercase">
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
          <p className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
            {legal}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export const FooterDemo: FooterProps = {
  logo: 'Forge',
  blurb: 'The platform for building, deploying, and scaling AI products — from first prompt to production traffic.',
  columns: [
    {
      heading: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Models', href: '#' },
        { label: 'Changelog', href: '#' },
      ],
    },
    {
      heading: 'Developers',
      links: [
        { label: 'Docs', href: '#' },
        { label: 'API reference', href: '#' },
        { label: 'Status', href: '#' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Security', href: '#' },
      ],
    },
  ],
  legal: '© 2026 Forge, Inc. All rights reserved.',
};

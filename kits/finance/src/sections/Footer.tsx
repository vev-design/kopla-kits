import { AtSign, Globe, Rss, Send, type LucideIcon } from 'lucide-react';
import type { SectionBaseProps } from '@/types';

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  website: Globe,
  contact: AtSign,
  blog: Rss,
  newsletter: Send,
};

/**
 * Structured page footer with a brand wordmark and blurb, columns of
 * navigation links, optional social icons, a small-print line, and a regulatory
 * disclaimer paragraph appropriate to a financial product. The calm closing
 * band; always the last section on the page.
 */
export interface FooterProps extends SectionBaseProps {
  /** Brand wordmark. Plain text, 1–2 words (e.g. "Meridian"). */
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
  /** Social / contact links shown by the wordmark. 0–4 items. */
  social?: {
    /** Channel icon. One of: website, contact, blog, newsletter. */
    platform: 'website' | 'contact' | 'blog' | 'newsletter';
    /**
     * Destination URL.
     * @kind url
     */
    href: string;
  }[];
  /** Small-print line (copyright). 1 short line, max 12 words. */
  legal?: string | null;
  /** Regulatory disclaimer paragraph. 1–3 sentences, 24–60 words. Generic, plain language. */
  disclaimer?: string | null;
}

export function Footer({ id, logo, blurb, columns, social, legal, disclaimer }: FooterProps) {
  return (
    <section
      id={id ?? undefined}
      className="w-full border-t border-border bg-secondary/40"
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
            <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <span className="inline-block size-5 rounded-sm bg-primary" aria-hidden />
              {logo}
            </div>
            {blurb ? (
              <p className="max-w-xs text-sm text-muted-foreground text-pretty">
                {blurb}
              </p>
            ) : null}
            {social && social.length > 0 ? (
              <div className="mt-2 flex items-center gap-3">
                {social.map((item) => {
                  const Icon = SOCIAL_ICONS[item.platform] ?? Globe;
                  return (
                    <a
                      key={item.platform}
                      href={item.href}
                      aria-label={item.platform}
                      className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      <Icon className="size-4" />
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>
          {columns.map((column) => (
            <div key={column.heading} className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold tracking-[0.12em] text-foreground uppercase">
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
        {disclaimer ? (
          <p className="mt-12 max-w-3xl border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
            {disclaimer}
          </p>
        ) : null}
        {legal ? (
          <p className="mt-6 text-sm text-muted-foreground">{legal}</p>
        ) : null}
      </div>
    </section>
  );
}

export const FooterDemo: FooterProps = {
  logo: 'Meridian',
  blurb: 'A modern way to invest, save, and grow your wealth — automated, low-cost, and secure.',
  columns: [
    {
      heading: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Performance', href: '#performance' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Security', href: '#security' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Press', href: '#' },
      ],
    },
    {
      heading: 'Legal',
      links: [
        { label: 'Disclosures', href: '#' },
        { label: 'Privacy', href: '#' },
        { label: 'Terms', href: '#' },
      ],
    },
  ],
  social: [
    { platform: 'website', href: '#' },
    { platform: 'contact', href: '#' },
    { platform: 'blog', href: '#' },
    { platform: 'newsletter', href: '#' },
  ],
  legal: '© 2026 Meridian Invest, Inc. All rights reserved.',
  disclaimer:
    'Meridian Invest is a fictional brand shown for demonstration only. Investing involves risk, including the possible loss of principal. Past performance does not guarantee future results. This is not investment advice.',
};

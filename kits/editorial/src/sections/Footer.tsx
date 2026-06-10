import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

/**
 * A minimal closing footer: the publication wordmark, one or more
 * columns of quiet links, and a colophon line. No color beyond the
 * crimson rule under the wordmark — it should read like the last page
 * of a magazine, not a marketing footer. This is the final section on
 * the page.
 */
export interface FooterProps extends SectionBaseProps {
  /** Publication wordmark. 1–3 words, Title Case. */
  wordmark: string;
  /** Link columns. 1–4 columns. */
  columns: {
    /** Column title. 1–2 words, Title Case. */
    title: string;
    /** Links in this column. 2–6 items. */
    links: {
      /** Link label. 1–3 words. */
      label: string;
      /**
       * Destination. Use `#section-id` for in-page anchors.
       * @kind url
       */
      href: string;
    }[];
  }[];
  /** Colophon line at the very bottom. 1 sentence, 6–18 words. */
  colophon?: string | null;
}

export function Footer({ id, wordmark, columns, colophon }: FooterProps) {
  return (
    <footer
      id={id ?? undefined}
      className="w-full bg-background px-6 pt-16 pb-12"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-1 gap-10 border-t border-border pt-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <p className="font-serif text-2xl font-bold tracking-[-0.01em] text-foreground">
              {wordmark}
            </p>
            <span className="mt-3 block h-px w-10 bg-primary" aria-hidden />
          </div>
          {columns.map((column, i) => (
            <nav key={i} aria-label={column.title}>
              <p className="font-sans text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                {column.title}
              </p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link, j) => (
                  <li key={j}>
                    <a
                      href={link.href}
                      className={cn(
                        'font-sans text-sm text-foreground transition-colors',
                        'hover:text-primary',
                      )}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        {colophon ? (
          <p className="mt-12 font-sans text-xs tracking-wide text-muted-foreground">
            {colophon}
          </p>
        ) : null}
      </div>
    </footer>
  );
}

export const FooterDemo: FooterProps = {
  wordmark: 'The Long Field',
  columns: [
    {
      title: 'Read',
      links: [
        { label: 'Features', href: '#' },
        { label: 'Essays', href: '#' },
        { label: 'The Archive', href: '#' },
        { label: 'Print Edition', href: '#' },
      ],
    },
    {
      title: 'About',
      links: [
        { label: 'Masthead', href: '#masthead' },
        { label: 'Ethics', href: '#' },
        { label: 'Contact', href: '#' },
      ],
    },
    {
      title: 'Follow',
      links: [
        { label: 'Newsletter', href: '#newsletter' },
        { label: 'RSS', href: '#' },
        { label: 'Letters', href: '#' },
      ],
    },
  ],
  colophon:
    'Set in Source Serif and Inter. Published in the slow tradition, one story at a time.',
};

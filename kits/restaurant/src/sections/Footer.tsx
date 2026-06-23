import type { SectionBaseProps } from '@/types';

/**
 * Quiet closing footer — the serif wordmark, address, a short hours summary,
 * and social links. The calm landing after the page; always last.
 */
export interface FooterProps extends SectionBaseProps {
  /** Restaurant wordmark. Plain text, 1–2 words (e.g. "Maison Laurent"). */
  logo: string;
  /** Street address. 1–2 lines, max 60 characters. */
  address: string;
  /** Short opening-hours summary. 1 line, max 40 characters (e.g. "Tue – Sun, 5 pm til late"). */
  hours?: string | null;
  /** Social links. 2–4 items. */
  social: {
    /** Platform label. 1 word, title case (e.g. "Instagram"). */
    label: string;
    /**
     * Profile URL.
     * @kind url
     */
    href: string;
  }[];
  /** Small-print line at the bottom. 1 short line, max 12 words. */
  legal?: string | null;
}

export function Footer({ id, logo, address, hours, social, legal }: FooterProps) {
  return (
    <section
      id={id ?? undefined}
      className="w-full border-t border-border bg-background"
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="flex flex-col items-center gap-8 text-center">
          <span className="font-serif text-2xl font-medium tracking-wide">{logo}</span>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <p className="whitespace-pre-line">{address}</p>
            {hours ? <p>{hours}</p> : null}
          </div>
          <ul className="flex items-center gap-7">
            {social.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {legal ? (
          <p className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
            {legal}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export const FooterDemo: FooterProps = {
  logo: 'Maison Laurent',
  address: '218 Harbor Lane\nPortland, OR 97204',
  hours: 'Tue – Sun, 5 pm til late',
  social: [
    { label: 'Instagram', href: '#' },
    { label: 'Facebook', href: '#' },
    { label: 'Newsletter', href: '#' },
  ],
  legal: '© 2026 Maison Laurent. All rights reserved.',
};

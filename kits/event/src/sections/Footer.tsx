import type { SectionBaseProps } from '@/types';

/**
 * Event footer — name + date recap, a few links, and small print. The last
 * nudge with the essentials in one place.
 */
export interface FooterProps extends SectionBaseProps {
  /** Event name. 1–4 words. */
  name: string;
  /** Date + location recap. 3–8 words. */
  detail?: string | null;
  /** Footer links. 0–6 items. */
  links?: {
    /** Label. 1–2 words. */
    label: string;
    /**
     * URL.
     * @kind url
     */
    href: string;
  }[];
  /** Small print. 3–10 words. */
  note?: string | null;
}

export function Footer({ id, name, detail, links, note }: FooterProps) {
  return (
    <footer id={id ?? undefined} className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xl font-bold tracking-tight">{name}</span>
            {detail ? <span className="text-sm text-muted-foreground">{detail}</span> : null}
          </div>
          {links && links.length > 0 ? (
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {links.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {note ? <span className="text-xs text-muted-foreground">{note}</span> : null}
      </div>
    </footer>
  );
}

export const FooterDemo: FooterProps = {
  name: 'Frontier',
  detail: 'May 14–15, 2026 · Berlin',
  links: [
    { label: 'Code of conduct', href: '#' },
    { label: 'Sponsor', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  note: '© 2026 Frontier Conference. All rights reserved.',
};

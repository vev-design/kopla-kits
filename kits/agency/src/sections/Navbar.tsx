import { Button } from '@/components/ui/button';
import type { SectionBaseProps } from '@/types';

/**
 * Sticky top bar with a wordmark, in-page anchor links, and a single accent
 * call-to-action. Brutalist-modern: monospace links, a hairline bottom rule,
 * near-square button. Always the first section on the page; links jump to
 * other sections' anchor ids via `#<id>` hrefs.
 */
export interface NavbarProps extends SectionBaseProps {
  /** Brand wordmark at the left. Plain text, 1–2 words, no tagline (e.g. "Field Studio"). */
  logo: string;
  /** Navigation links. 2–5 items. Each href should be an in-page anchor like "#work". */
  links: {
    /** Link label. 1–2 words, sentence case. */
    label: string;
    /**
     * In-page anchor target (e.g. "#work") or external URL.
     * @kind url
     */
    href: string;
  }[];
  /** Primary action button at the right. Omit for a link-only bar. */
  cta?: {
    /** Button label. 2–3 words, sentence case (e.g. "Start a project"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  } | null;
}

export function Navbar({ id, logo, links, cta }: NavbarProps) {
  return (
    <section
      id={id ?? undefined}
      className="sticky top-0 z-50 w-full border-b border-foreground bg-background/85 backdrop-blur-md"
    >
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <a
          href="#top"
          className="text-lg font-bold tracking-tight uppercase"
        >
          {logo}
        </a>
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        {cta ? (
          <Button asChild size="sm" className="rounded-sm font-mono text-xs uppercase tracking-[0.14em]">
            <a href={cta.href}>{cta.label}</a>
          </Button>
        ) : null}
      </nav>
    </section>
  );
}

export const NavbarDemo: NavbarProps = {
  id: 'top',
  logo: 'Field Studio',
  links: [
    { label: 'Work', href: '#work' },
    { label: 'Services', href: '#services' },
    { label: 'Process', href: '#process' },
    { label: 'Contact', href: '#contact' },
  ],
  cta: { label: 'Start a project', href: '#contact' },
};

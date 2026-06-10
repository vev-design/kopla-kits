import { Button } from '@/components/ui/button';
import type { SectionBaseProps } from '@/types';

/**
 * Sticky top navigation bar with a wordmark logo, in-page anchor links, and a
 * primary call-to-action button. Always the first section on the page; the
 * links jump to other sections' anchor ids via `#<id>` hrefs.
 */
export interface NavbarProps extends SectionBaseProps {
  /** Brand wordmark shown at the left. Plain text, 1–2 words, no tagline (e.g. "Acme"). */
  logo: string;
  /** Navigation links. 2–5 items. Each href should be an in-page anchor like "#pricing". */
  links: {
    /** Link label. 1–2 words, sentence case. */
    label: string;
    /**
     * In-page anchor target (e.g. "#features") or external URL.
     * @kind url
     */
    href: string;
  }[];
  /** Primary action button at the right. Omit for a link-only bar. */
  cta?: {
    /** Button label. 1–2 words, sentence case (e.g. "Get started"). */
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
      className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md"
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <a
          href="#top"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <span className="inline-block size-5 rounded-md bg-primary" aria-hidden />
          {logo}
        </a>
        <ul className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        {cta ? (
          <Button asChild size="sm">
            <a href={cta.href}>{cta.label}</a>
          </Button>
        ) : null}
      </nav>
    </section>
  );
}

export const NavbarDemo: NavbarProps = {
  id: 'top',
  logo: 'Northbeam',
  links: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Customers', href: '#testimonial' },
  ],
  cta: { label: 'Get started', href: '#cta' },
};

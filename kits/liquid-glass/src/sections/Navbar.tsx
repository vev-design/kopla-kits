import { Button } from '@/components/Button';
import type { SectionBaseProps } from '@/types';

/**
 * Sticky top navigation bar rendered as a thin glass shelf — a translucent,
 * blurred strip with a light-reactive bottom hairline — so page content
 * drifts beneath it as the visitor scrolls. Carries a wordmark, in-page
 * anchor links, and a primary call-to-action pill. Always the first section
 * on the page; the links jump to other sections' anchor ids via `#<id>`
 * hrefs.
 */
export interface NavbarProps extends SectionBaseProps {
  /** Brand wordmark shown at the left. Plain text, 1–2 words, no tagline (e.g. "Halo"). */
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
      className="sticky top-0 z-50 w-full border-b border-border bg-card/70 backdrop-blur-xl"
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <a href="#top" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span
            aria-hidden
            className="inline-block size-6 rounded-full bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3"
          />
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
  logo: 'Halo',
  links: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Customers', href: '#testimonial' },
  ],
  cta: { label: 'Get started', href: '#cta' },
};

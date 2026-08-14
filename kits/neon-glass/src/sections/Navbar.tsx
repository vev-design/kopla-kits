import { Button } from '@/components/ui/button';
import type { SectionBaseProps } from '@/types';

/**
 * Sticky top navigation bar rendered as a frosted glass strip — translucent
 * near-black with heavy backdrop blur and a hairline bottom edge — over
 * whatever gradient glows beneath it. Always the first section on the page;
 * link hrefs jump to other sections' anchor ids via `#<id>`.
 */
export interface NavbarProps extends SectionBaseProps {
  /** Brand wordmark shown at the left. Plain text, 1–2 words, no tagline (e.g. "Aurel"). */
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
    /** Button label. 1–3 words, sentence case (e.g. "Get early access"). */
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
      className="sticky top-0 z-50 w-full border-b border-border bg-background/50 backdrop-blur-2xl"
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <a
          href="#top"
          className="flex items-center gap-2.5 font-[family-name:var(--font-display)] text-base font-semibold tracking-tight"
        >
          <span
            className="inline-block size-5 rounded-full bg-gradient-to-br from-chart-1 via-chart-2 to-chart-3"
            aria-hidden
          />
          {logo}
        </a>
        <ul className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
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
  logo: 'Aurel',
  links: [
    { label: 'Features', href: '#features' },
    { label: 'Showcase', href: '#showcase' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Story', href: '#story' },
  ],
  cta: { label: 'Get early access', href: '#cta' },
};
